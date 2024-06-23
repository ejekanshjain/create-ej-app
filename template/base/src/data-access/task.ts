import { InferSelectModel, asc, count, desc, eq, ilike, or } from 'drizzle-orm'

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
