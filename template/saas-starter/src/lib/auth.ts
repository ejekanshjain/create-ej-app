import 'server-only'

import { validateEmail } from '@ejekanshjain/simple-email-validator'
import { createId } from '@paralleldrive/cuid2'
import { APIError, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import {
  admin,
  lastLoginMethod,
  magicLink,
  organization
} from 'better-auth/plugins'
import { and, count, eq, isNull, ne } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { headers } from 'next/headers'
import { cache } from 'react'
import { start } from 'workflow/api'
import { db } from '~/db'
import {
  accountsTable,
  invitationsTable,
  membersTable,
  organizationSubscriptionsTable,
  organizationsTable,
  sessionsTable,
  usersTable,
  verificationsTable
} from '~/db/schema'
import { env } from '~/env'
import { ac, adminRoles, roles } from './auth-permissions'
import {
  INVITATION_EXPIRES_IN_DAYS,
  MAX_ORGANIZATIONS_PER_USER
} from './constants'
import {
  sendInvitationEmail,
  sendMagicLinkEmail,
  sendWelcomeEmail
} from './email-service'
import { getOrganizationPlan } from './plan-limits'
import { siteConfig } from './siteConfig'
import { deleteOrganizationUploads } from './storage'
import { stripeClient } from './stripe'

/**
 * Blocks organization logos set through the Better Auth client. Logos go
 * through `updateOrganizationAction`, which checks the upload belongs to the
 * organization before saving it.
 */
function rejectClientLogo(logo: string | null | undefined) {
  if (logo) {
    throw new APIError('BAD_REQUEST', {
      message: 'Change the logo from the organization settings page.'
    })
  }
}

/** True when `userId` is the only owner of at least one organization. */
async function ownsOrganizationAlone(userId: string): Promise<boolean> {
  const otherOwners = alias(membersTable, 'other_owners')

  const [row] = await db
    .select({ organizationId: membersTable.organizationId })
    .from(membersTable)
    .leftJoin(
      otherOwners,
      and(
        eq(otherOwners.organizationId, membersTable.organizationId),
        eq(otherOwners.role, 'owner'),
        ne(otherOwners.userId, userId)
      )
    )
    .where(
      and(
        eq(membersTable.userId, userId),
        eq(membersTable.role, 'owner'),
        isNull(otherOwners.id)
      )
    )
    .limit(1)

  return Boolean(row)
}

/**
 * Better Auth configuration.
 *
 * Features:
 * - Magic link email sign-in
 * - OAuth (GitHub, Google) with account linking
 * - Admin plugin with `user`, `admin`, and `superadmin` roles
 * - Organization plugin with owner, admin, and member roles
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
      organization: organizationsTable,
      member: membersTable,
      invitation: invitationsTable
    }
  }),
  account: {
    accountLinking: {
      enabled: true
    }
  },
  advanced: {
    database: {
      generateId: ({ model }) => `${model}_${createId()}`
    }
  },
  socialProviders: {
    github: {
      prompt: 'select_account',
      clientId: env.BETTER_AUTH_GITHUB_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_SECRET
    },
    google: {
      prompt: 'select_account',
      clientId: env.BETTER_AUTH_GOOGLE_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_SECRET
    }
  },
  databaseHooks: {
    user: {
      create: {
        // Magic-link sign-up sends an empty name; fall back to the email's
        // local part so greetings and avatars never render blank.
        before: async user => ({
          data: { ...user, name: user.name.trim() || user.email.split('@')[0]! }
        }),
        after: async user => {
          try {
            await start(sendWelcomeEmail, [
              user.email,
              {
                userName: user.name,
                companyName: siteConfig.name
              }
            ])
          } catch (error) {
            console.error('Failed to send welcome email:', error)
          }
        }
      },
      delete: {
        before: async user => {
          if (await ownsOrganizationAlone(user.id)) {
            throw new APIError('BAD_REQUEST', {
              message:
                'This user is the only owner of an organization. Transfer ownership or delete the organization first.'
            })
          }
        }
      }
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          await start(sendMagicLinkEmail, [
            email,
            {
              magicLink: url,
              companyName: siteConfig.name
            }
          ])
        } catch (error) {
          console.error('Failed to send magic link email:', error)
        }
      }
    }),
    admin({
      ac,
      roles,
      adminRoles: [...adminRoles],
      defaultRole: 'user'
    }),
    organization({
      organizationLimit: MAX_ORGANIZATIONS_PER_USER,
      invitationExpiresIn: INVITATION_EXPIRES_IN_DAYS * 24 * 60 * 60,
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async ({
        id,
        email,
        role,
        organization,
        inviter
      }) => {
        try {
          await start(sendInvitationEmail, [
            email,
            {
              inviterName: inviter.user.name,
              organizationName: organization.name,
              inviteUrl: `${env.BETTER_AUTH_URL}/accept-invitation/${id}`,
              role,
              companyName: siteConfig.name
            }
          ])
        } catch (error) {
          console.error('Failed to send invitation email:', error)
        }
      },
      organizationHooks: {
        beforeCreateOrganization: async ({ organization }) => {
          rejectClientLogo(organization.logo)
        },
        afterCreateOrganization: async ({ organization }) => {
          await db.insert(organizationSubscriptionsTable).values({
            organizationId: organization.id
          })
        },
        beforeUpdateOrganization: async ({ organization }) => {
          rejectClientLogo(organization.logo)
        },
        // Files go first: if R2 fails, the organization and its paid plan
        // both stay intact. Stripe is cancelled only once nothing else can fail.
        beforeDeleteOrganization: async ({ organization }) => {
          await deleteOrganizationUploads(organization.id)

          const sub = await db.query.organizationSubscriptionsTable.findFirst({
            where: eq(
              organizationSubscriptionsTable.organizationId,
              organization.id
            ),
            columns: { stripeSubscriptionId: true }
          })

          if (sub?.stripeSubscriptionId) {
            try {
              await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId)
            } catch (error) {
              console.error(
                `Failed to cancel Stripe subscription ${sub.stripeSubscriptionId} while deleting organization ${organization.id}:`,
                error
              )
              throw new APIError('BAD_REQUEST', {
                message:
                  'We could not cancel the active subscription, so the organization was kept. Try again in a few minutes.'
              })
            }
          }
        }
      },
      // Better Auth caps pending invitations at this number, so leave room
      // only for the seats current members do not fill.
      invitationLimit: async ({ organization }) => {
        const [{ plan }, [row]] = await Promise.all([
          getOrganizationPlan(organization.id),
          db
            .select({ count: count() })
            .from(membersTable)
            .where(eq(membersTable.organizationId, organization.id))
        ])
        return Math.max(0, plan.maxMembers - (row?.count ?? 0))
      },
      membershipLimit: async (_, organization) => {
        const { plan } = await getOrganizationPlan(organization.id)
        return plan.maxMembers
      }
    }),
    lastLoginMethod()
  ],
  hooks: {
    before: createAuthMiddleware(async ctx => {
      if (ctx.path === '/sign-in/magic-link' && ctx.body?.email) {
        try {
          const validation = await validateEmail({
            email: ctx.body.email
          })

          if (validation.isValid === false) {
            throw new APIError('BAD_REQUEST', {
              message: 'Please use a valid email address.'
            })
          }
        } catch (err) {
          console.error('Email validation failed', err)
        }
      }
    })
  }
})

/**
 * The current session, cached per request.
 *
 * Returns null when signed out. `isAdmin` is true for both `admin` and
 * `superadmin` (admin panel access). `isSuperAdmin` is true only for
 * `superadmin` (user management, role changes, and impersonation).
 */
export const getAuthSession = cache(async () => {
  const authSession = await auth.api.getSession({
    headers: await headers()
  })

  if (!authSession || !authSession.user || !authSession.session) return null

  const role = authSession.user.role
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role === 'admin' || isSuperAdmin

  return { ...authSession, isAdmin, isSuperAdmin }
})
