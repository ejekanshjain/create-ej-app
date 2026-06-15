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
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { cache } from 'react'
import { start } from 'workflow/api'
import { db } from '~/db'
import {
  accountsTable,
  invitationsTable,
  membersTable,
  organizationsTable,
  organizationSubscriptionsTable,
  sessionsTable,
  usersTable,
  verificationsTable
} from '~/db/schema'
import { env } from '~/env'
import { ac, roles } from './auth-permissions'
import {
  sendInvitationEmail,
  sendMagicLinkEmail,
  sendWelcomeEmail
} from './email-service'
import { getOrganizationPlanCached } from './organization-plan-limits'
import { siteConfig } from './siteConfig'
import { stripeClient } from './stripe'

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
      roles
    }),
    organization({
      organizationLimit: 10,
      invitationExpiresIn: 7 * 24 * 60 * 60, // 7 days
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async ({ id, email, organization, inviter }) => {
        try {
          await start(sendInvitationEmail, [
            email,
            {
              inviterName: inviter.user.name,
              organizationName: organization.name,
              inviteLink: `${env.BETTER_AUTH_URL}/accept-invitation/${id}`,
              companyName: siteConfig.name
            }
          ])
        } catch (error) {
          console.error('Failed to send invitation email:', error)
        }
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization }) => {
          await db.insert(organizationSubscriptionsTable).values({
            organizationId: organization.id
          })
        },
        beforeDeleteOrganization: async ({ organization }) => {
          const sub = await db.query.organizationSubscriptionsTable.findFirst({
            where: eq(
              organizationSubscriptionsTable.organizationId,
              organization.id
            )
          })

          if (sub?.stripeSubscriptionId) {
            try {
              await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId)
            } catch (error) {
              console.error(
                `Failed to cancel Stripe subscription ${sub.stripeSubscriptionId} for org ${organization.id} on org delete:`,
                error
              )
              throw new APIError('BAD_REQUEST', {
                message:
                  'Could not cancel the active subscription. Please try again later.'
              })
            }
          }

          await db
            .delete(organizationSubscriptionsTable)
            .where(
              eq(organizationSubscriptionsTable.organizationId, organization.id)
            )
        }
      },
      invitationLimit: async ({ organization }) => {
        const { plan } = await getOrganizationPlanCached(organization.id)
        return plan.maxMembers
      },
      membershipLimit: async (_, organization) => {
        const { plan } = await getOrganizationPlanCached(organization.id)
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
