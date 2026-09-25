import 'server-only'

import { validateEmail } from '@ejekanshjain/simple-email-validator'
import { createId } from '@paralleldrive/cuid2'
import { APIError, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { admin, lastLoginMethod, magicLink } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { cache } from 'react'
import { start } from 'workflow/api'
import { db } from '~/db'
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable
} from '~/db/schema'
import { env } from '~/env'
import { ac, adminRoles, roles } from './auth-permissions'
import { sendMagicLinkEmail, sendWelcomeEmail } from './email-service'
import { siteConfig } from './siteConfig'

/**
 * Better Auth configuration.
 *
 * Features:
 * - Magic link email sign-in
 * - OAuth (GitHub, Google) with account linking
 * - Admin plugin with `user`, `admin`, and `superadmin` roles
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable
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
