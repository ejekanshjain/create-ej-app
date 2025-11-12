import {
  InferSelectModel,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql
} from 'drizzle-orm'

import { db } from '@/db'
import { Task } from '@/db/schema'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

export type TaskType = InferSelectModel<typeof Task>

type getTasksInput = {
  page: number
  limit: number
  sortBy?: keyof TaskType
  sortOrder?: SortOrderEnum
  filters?: {
    title?: string
    status?: TaskType['status'][]
  }
}

export const getTasksWithUser = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  filters
}: getTasksInput) => {
  const where = or(
    filters?.title ? ilike(Task.title, `%${filters.title}%`) : undefined,
    ...(filters?.status || []).map(f => eq(Task.status, f))
  )

  const [tasks, total] = await Promise.all([
    db.query.Task.findMany({
      columns: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          columns: {
            id: true,
            name: true
          }
        }
      },
      where,
      orderBy: [
        sortOrder === 'asc'
          ? asc(Task[sortBy || 'createdAt'])
          : desc(Task[sortBy || 'createdAt'])
      ],
      offset: (page - 1) * limit,
      limit
    }),
    db
      .select({
        count: count()
      })
      .from(Task)
      .where(where)
  ])

  return { tasks, total: total[0]?.count || 0 }
}

export const getTaskByIdWithUser = async (id: string) => {
  return await db.query.Task.findFirst({
    where: eq(Task.id, id),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true
        }
      },
      updatedBy: {
        columns: {
          id: true,
          name: true
        }
      }
    }
  })
}

type createTaskInput = {
  title: string
  description?: string | null
  status: TaskType['status']
  createdById: string
}

export const createTask = async (data: createTaskInput) => {
  const newTask = await db.insert(Task).values(data).returning({
    id: Task.id
  })

  if (!newTask[0]?.id) throw new Error('Failed to create task')

  return newTask[0].id
}

type updateTaskInput = {
  id: string
  title?: string
  description?: string | null
  status?: TaskType['status']
  updatedById: string
}

export const updateTask = async (data: updateTaskInput) => {
  return await db
    .update(Task)
    .set({
      ...data,
      updatedAt: sql`now()`
    })
    .where(eq(Task.id, data.id))
}

export const deleteTask = async (id: string) => {
  return await db.delete(Task).where(eq(Task.id, id))
}
