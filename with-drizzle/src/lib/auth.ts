import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { InferSelectModel } from 'drizzle-orm'
import {
  Session as NextAuthSession,
  getServerSession,
  type DefaultSession,
  type NextAuthOptions
} from 'next-auth'
import { Adapter } from 'next-auth/adapters'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { cache } from 'react'

import type { RolePermissionType } from '@/data-access/role-permission'
import type { UserType } from '@/data-access/user'
import { db } from '@/db'
import { Account, Session, User, VerificationToken } from '@/db/schema'
import { env } from '@/env.mjs'
import { checkForRolePermissionUseCase } from '@/use-case/role-permission'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      type: UserType['type']
      roleId?: string | null
    } & DefaultSession['user']
  }

  interface User extends InferSelectModel<typeof User> {}
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login'
  },
  callbacks: {
    session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          type: user.type,
          roleId: user.roleId
        }
      }
    }
  },
  adapter: DrizzleAdapter(db, {
    usersTable: User,
    accountsTable: Account,
    sessionsTable: Session,
    verificationTokensTable: VerificationToken
  }) as Adapter,
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD
        }
      },
      from: env.EMAIL_FROM
    }),
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET
    }),
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET
    })
  ]
}

export const getAuthSession = cache(() => getServerSession(authOptions))

export const authGuard = cache(
  () =>
    (session: NextAuthSession, permission?: RolePermissionType['permission']) =>
      checkForRolePermissionUseCase(
        session.user.type,
        session.user.roleId,
        permission
      )
)
