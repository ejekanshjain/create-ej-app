import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { $Enums, UserType } from '@prisma/client'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions
} from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'

import { env } from '@/env.mjs'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      type: UserType
      roleId?: string | null
    } & DefaultSession['user']
  }

  interface User {
    type: UserType
    roleId?: string | null
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
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
  adapter: PrismaAdapter(prisma),
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
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET
    })
  ]
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getAuthSession = () => getServerSession(authOptions)

export const authGuard = async (
  types?: UserType | UserType[],
  permission?: $Enums.Permissions
) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  if (types) {
    if (Array.isArray(types) && !types.includes(session.user.type))
      throw new Error('Access Denied')
    if (!Array.isArray(types) && types !== session.user.type)
      throw new Error('Access Denied')
  }

  if (session.user.type !== 'Root' && permission) {
    if (!session.user.roleId) throw new Error('Access Denied')

    const c = await prisma.rolePermission.count({
      where: {
        roleId: session.user.roleId,
        permission
      }
    })
    if (!c) throw new Error('Access Denied')
  }

  return session
}

export const authGuardApi = async (
  types?: UserType | UserType[],
  permission?: $Enums.Permissions
) => {
  try {
    return await authGuard(types, permission)
  } catch (err) {
    return {
      error: 'Unauthorized'
    }
  }
}

export const authGuardPage = async (
  types?: UserType | UserType[],
  permission?: $Enums.Permissions
) => {
  try {
    return await authGuard(types, permission)
  } catch (err) {
    return notFound()
  }
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
      const permissions = await prisma.rolePermission.findMany({
        where: {
          roleId: session.user.roleId
        },
        select: {
          permission: true
        },
        orderBy: {
          permission: 'asc'
        }
      })
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
