import { InferSelectModel, asc, count, desc, eq, ilike, or } from 'drizzle-orm'

import { db } from '@/db'
import { User } from '@/db/schema'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

export type UserType = InferSelectModel<typeof User>

type updateUserByIdInput = {
  name?: string | null
  type?: UserType['type']
  roleId?: string | null
}

export const updateUser = async (id: string, data: updateUserByIdInput) => {
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

export const getUserById = async (id: string) => {
  return await db.query.User.findFirst({
    where: eq(User.id, id),
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      type: true,
      roleId: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

type createUserInput = {
  name?: string | null
  email: string
  type: UserType['type']
  roleId?: string | null
}

export const createUser = async ({
  name,
  email,
  type,
  roleId
}: createUserInput) => {
  const newUser = await db
    .insert(User)
    .values({
      name,
      email,
      type,
      roleId
    })
    .returning({
      id: User.id
    })

  const id = newUser[0]?.id
  if (!id) throw new Error('Failed to create user')

  return id
}

export const deleteUser = async (id: string) => {
  return await db.delete(User).where(eq(User.id, id))
}
