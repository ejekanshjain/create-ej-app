'use server'

import { Task, TaskStatus } from '@prisma/client'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getTasks = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  title,
  status
}: {
  page: number
  limit: number
  sortBy?: keyof Task
  sortOrder?: 'asc' | 'desc'
  title?: string
  status?: TaskStatus[]
}) => {
  const session = await authGuard(['Root', 'Normal'], 'TaskList')
  if (!session) throw new Error('Unauthorized')

  const where = {
    title: title
      ? { contains: title, mode: 'insensitive' as const }
      : undefined,
    status: status?.length ? { in: status } : undefined
  }
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy || 'createdAt']: sortOrder || 'desc'
      }
    }),
    prisma.task.count({
      where
    })
  ])

  return { tasks, total }
}

export type GetTasksFnDataType = UnwrapPromise<ReturnType<typeof getTasks>>
