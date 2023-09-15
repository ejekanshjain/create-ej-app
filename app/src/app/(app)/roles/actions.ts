'use server'

import { Role } from '@prisma/client'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getRoles = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  name
}: {
  page: number
  limit: number
  sortBy?: keyof Role
  sortOrder?: 'asc' | 'desc'
  name?: string
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  const where = {
    name: name ? { contains: name, mode: 'insensitive' as const } : undefined
  }
  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy || 'createdAt']: sortOrder || 'desc'
      }
    }),
    prisma.role.count({
      where
    })
  ])

  return { roles, total }
}

export type GetRolesFnDataType = UnwrapPromise<ReturnType<typeof getRoles>>

export const getRolesMini = async () => {
  return await prisma.role.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export type GetRolesMiniFnDataType = UnwrapPromise<
  ReturnType<typeof getRolesMini>
>
