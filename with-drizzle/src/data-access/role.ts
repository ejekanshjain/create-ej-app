import { InferSelectModel, asc, count, desc, ilike } from 'drizzle-orm'

import { db } from '@/db'
import { Role } from '@/db/schema'

export type RoleType = InferSelectModel<typeof Role>

type getRolesInput = {
  page: number
  limit: number
  sortBy?: keyof RoleType
  sortOrder?: 'asc' | 'desc'
  search?: {
    name?: string
  }
}

export const getRoles = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  search
}: getRolesInput) => {
  let countQ = db
    .select({
      count: count()
    })
    .from(Role)

  if (search?.name) countQ.where(ilike(Role.name, `%${search.name}%`))

  const [roles, total] = await Promise.all([
    db.query.Role.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      where: search?.name ? ilike(Role.name, `%${search?.name}%`) : undefined,
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

export const getRolesMini = async () => {
  return await db.query.Role.findMany({
    columns: {
      id: true,
      name: true
    },
    orderBy: [asc(Role.name)]
  })
}
