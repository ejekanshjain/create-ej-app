import { InferSelectModel, asc, count, desc, eq, ilike, or } from 'drizzle-orm'

import { db } from '@/db'
import { User } from '@/db/schema'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

export type UserType = InferSelectModel<typeof User>

type updateUserByIdInput = { name: string }

export const updateUserById = async (id: string, data: updateUserByIdInput) => {
  await db.update(User).set(data).where(eq(User.id, id))
}

type getUsersInput = {
  page: number
  limit: number
  sortBy?: keyof UserType
  sortOrder?: SortOrderEnum
  filters?: {
    name?: string
    email?: string
    type?: UserType['type'][]
  }
}

export const getUsersWithRole = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  filters
}: getUsersInput) => {
  const where = or(
    filters?.name ? ilike(User.name, `%${filters.name}%`) : undefined,
    filters?.email ? ilike(User.email, `%${filters.email}%`) : undefined,
    ...(filters?.type || []).map(f => eq(User.type, f))
  )

  const [users, total] = await Promise.all([
    db.query.User.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        type: true,
        roleId: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      with: {
        role: true
      },
      where,
      orderBy: [
        sortOrder === 'asc'
          ? asc(User[sortBy || 'createdAt'])
          : desc(User[sortBy || 'createdAt'])
      ],
      offset: (page - 1) * limit,
      limit
    }),
    db
      .select({
        count: count()
      })
      .from(User)
      .where(where)
  ])

  return { users, total: total[0]?.count || 0 }
}
