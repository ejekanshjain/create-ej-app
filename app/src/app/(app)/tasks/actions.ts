'use server'

import { Task, TaskStatus } from '@prisma/client'

import { authGuardApi } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getData = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  title,
  description,
  status
}: {
  page: number
  limit: number
  sortBy?: keyof Task
  sortOrder?: 'asc' | 'desc'
  title?: string
  description?: string
  status?: TaskStatus[]
}) => {
  await authGuardApi(undefined, 'TaskList')
  const where = {
    title: title
      ? { contains: title, mode: 'insensitive' as const }
      : undefined,
    description: description
      ? { contains: description, mode: 'insensitive' as const }
      : undefined,
    status: status?.length ? { in: status } : undefined
  }
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
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
        [sortBy || 'title']: sortOrder || 'asc'
      }
    }),
    prisma.task.count({
      where
    })
  ])

  return { tasks, total }
}

export type GetDataFnDataType = UnwrapPromise<ReturnType<typeof getData>>
