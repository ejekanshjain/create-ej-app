'use server'

import { User, UserType } from '@prisma/client'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getUsers = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  name,
  email,
  type
}: {
  page: number
  limit: number
  sortBy?: keyof User
  sortOrder?: 'asc' | 'desc'
  name?: string
  email?: string
  type?: UserType[]
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  const where = {
    name: name ? { contains: name, mode: 'insensitive' as const } : undefined,
    email: email
      ? { contains: email, mode: 'insensitive' as const }
      : undefined,
    type: type?.length ? { in: type } : undefined
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        role: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy || 'createdAt']: sortOrder || 'desc'
      }
    }),
    prisma.user.count({
      where
    })
  ])

  return { users, total }
}

export type GetUsersFnDataType = UnwrapPromise<ReturnType<typeof getUsers>>
