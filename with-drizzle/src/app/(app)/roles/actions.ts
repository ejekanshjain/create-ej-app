'use server'

import { RoleType, getRoles } from '@/data-access/role'
import { db } from '@/db'
import { Role } from '@/db/schema'
import { authGuard } from '@/lib/auth'
import { rootActionClient } from '@/lib/safe-action'
import { UnwrapPromise } from '@/types/UnwrapPromise'
import { asc } from 'drizzle-orm'
import { z } from 'zod'

export const getRolesAction2 = rootActionClient.schema(
  z.object({
    page: z.number(),
    limit: z.number(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    name: z.string().optional()
  })
)

export const getRolesAction = async ({
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

  return await getRoles({
    page,
    limit,
    sortBy,
    sortOrder,
    search: name ? { name } : undefined
  })
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
