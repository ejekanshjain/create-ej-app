import { createId } from '@paralleldrive/cuid2'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, lastLoginMethod, magicLink } from 'better-auth/plugins'
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
  ]
})

export const getAuthSession = cache(async () => {
  const authSession = await auth.api.getSession({
    headers: await headers()
  })

  if (!authSession || !authSession.user || !authSession.session) return null

  const isAdmin = authSession.user.role === 'admin'

  return { ...authSession, isAdmin }
})
