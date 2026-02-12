import { validateEmail } from '@ejekanshjain/simple-email-validator'
import { createId } from '@paralleldrive/cuid2'
import { APIError, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  admin,
  createAuthMiddleware,
  lastLoginMethod,
  magicLink
} from 'better-auth/plugins'
import { headers } from 'next/headers'
import { cache } from 'react'
import { db } from '~/db'
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable
} from '~/db/schema'
import { env } from '~/env'

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
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        console.warn('TODO: send email', {
          email,
          token,
          url
        })
      }
    }),
    admin(),
    lastLoginMethod()
  ],
  hooks: {
    before: createAuthMiddleware(async ctx => {
      if (
        ctx.path === '/sign-in/magic-link' &&
        ctx.body?.email
      ) {
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

  const isAdmin = authSession.user.role === 'admin'

  return { ...authSession, isAdmin }
})
