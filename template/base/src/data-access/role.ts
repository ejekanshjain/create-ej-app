import { InferSelectModel, asc, count, desc, eq, ilike, sql } from 'drizzle-orm'

import { db } from '@/db'
import { Role } from '@/db/schema'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

export type RoleType = InferSelectModel<typeof Role>

type getRolesInput = {
  page: number
  limit: number
  sortBy?: keyof RoleType
  sortOrder?: SortOrderEnum
  filters?: {
    name?: string
  }
}

export const getRoles = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  filters
}: getRolesInput) => {
  const where = filters?.name
    ? ilike(Role.name, `%${filters.name}%`)
    : undefined

  const [roles, total] = await Promise.all([
    db.query.Role.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      where,
      orderBy: [
        sortOrder === 'asc'
          ? asc(Role[sortBy || 'createdAt'])
          : desc(Role[sortBy || 'createdAt'])
      ],
      offset: (page - 1) * limit,
      limit
    }),
    db
      .select({
        count: count()
      })
      .from(Role)
      .where(where)
  ])

  return { roles, total: total[0]?.count || 0 }
}

export const getRoleByIdWithPermissions = async (id: string) => {
  return await db.query.Role.findFirst({
    where: eq(Role.id, id),
    with: {
      permissions: true
    }
  })
}

type createRoleInput = {
  name: string
}

export const createRole = async (data: createRoleInput) => {
  const newRole = await db.insert(Role).values(data).returning({
    id: Role.id
  })

  const id = newRole[0]?.id
  if (!id) throw new Error('Failed to create role')

  return id
}

type updateRoleInput = createRoleInput & {
  id: string
}

export const updateRole = async (data: updateRoleInput) => {
  return await db
    .update(Role)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(Role.id, data.id))
}

export const deleteRole = async (id: string) => {
  return await db.delete(Role).where(eq(Role.id, id))
}

export const getRolesMini = async () => {
  return await db.query.Role.findMany({
    columns: {
      id: true,
      name: true
    },
    orderBy: [asc(Role.name)]
  })
}
