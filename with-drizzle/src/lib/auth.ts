import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { InferSelectModel, and, count, eq } from 'drizzle-orm'
import {
  Session as NextAuthSession,
  getServerSession,
  type DefaultSession,
  type NextAuthOptions
} from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

import { db } from '@/db'
import {
  Account,
  RolePermission,
  Session,
  User,
  VerificationToken
} from '@/db/schema'
import { env } from '@/env.mjs'
import { Adapter } from 'next-auth/adapters'
import { cache } from 'react'

type UserType = InferSelectModel<typeof User>['type']
type PermissionsType = InferSelectModel<typeof RolePermission>['permission']

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      type: UserType
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

export const authGuard = async (
  types?: UserType | UserType[],
  permission?: Permissions,
  session?: NextAuthSession
) => {
  if (!session) {
    const tempSession = await getAuthSession()
    if (!tempSession) return false
    session = tempSession
  }

  if (session.user.type === 'Root') return session

  if (types) {
    if (Array.isArray(types)) {
      if (!types.includes(session.user.type)) return false
    } else {
      if (types !== session.user.type) return false
    }
  }

  if (!session.user.roleId || !permission) return false

  const c = await db
    .select({ count: count() })
    .from(RolePermission)
    .where(eq(RolePermission.roleId, session.user.roleId))

  if (!c?.[0]?.count) return false

  return session
}

export const checkForPermission = async (
  permission: PermissionsType,
  session?: NextAuthSession
) => {
  if (!session) {
    const tempSession = await getAuthSession()
    if (!tempSession) return false
    session = tempSession
  }

  if (session.user.type === 'Root') return true
  if (!session.user.roleId) return false

  const c = await db
    .select({ count: count() })
    .from(RolePermission)
    .where(
      and(
        eq(RolePermission.roleId, session.user.roleId),
        eq(RolePermission.permission, permission)
      )
    )

  return !!c?.[0]?.count
}

export const getAuthSessionWithPermissions = async () => {
  const session = await getAuthSession()

  if (session && session.user) {
    if (session.user.type === 'Root') {
      return {
        session,
        permissions: ['*']
      }
    } else if (session.user.roleId) {
      const permissions = await db
        .select({ permission: RolePermission.permission })
        .from(RolePermission)
        .where(eq(RolePermission.roleId, session.user.roleId))

      return {
        session,
        permissions: permissions.map(p => p.permission)
      }
    } else {
      return {
        session,
        permissions: []
      }
    }
  }

  return {
    session
  }
}
