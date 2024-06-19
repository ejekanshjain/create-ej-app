'use server'

import { db } from '@/db'
import { Role } from '@/db/schema'
import { authGuard } from '@/lib/auth'
import { UnwrapPromise } from '@/types/UnwrapPromise'
import { InferSelectModel, asc, count, desc, ilike } from 'drizzle-orm'

type RoleType = InferSelectModel<typeof Role>

export const getRoles = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  name
}: {
  page: number
  limit: number
  sortBy?: keyof RoleType
  sortOrder?: 'asc' | 'desc'
  name?: string
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  let countQ = db
    .select({
      count: count()
    })
    .from(Role)

  if (name) countQ.where(ilike(Role.name, `%${name}%`))

  const [roles, total] = await Promise.all([
    db.query.Role.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      where: name ? ilike(Role.name, `%${name}%`) : undefined,
      orderBy: [
        sortOrder === 'asc'
          ? asc(Role[sortBy || 'createdAt'])
          : desc(Role[sortBy || 'createdAt'])
      ],
      offset: (page - 1) * limit,
      limit
    }),
    countQ
  ])

  return { roles, total: total[0]?.count || 0 }
}

export type GetRolesFnDataType = UnwrapPromise<ReturnType<typeof getRoles>>

export const getRolesMini = async () => {
  return await db.query.Role.findMany({
    columns: {
      id: true,
      name: true
    },
    orderBy: [asc(Role.name)]
  })
}

export type GetRolesMiniFnDataType = UnwrapPromise<
  ReturnType<typeof getRolesMini>
>
