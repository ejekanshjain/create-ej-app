'use server'

import { TaskStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getTask = async (id: string) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  return await prisma.task.findUnique({
    where: {
      id
    },
    include: {
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
    }
  })
}

export type GetTaskFnDataType = UnwrapPromise<ReturnType<typeof getTask>>

export const createTask = async ({
  title,
  status,
  description
}: {
  title: string
  status: TaskStatus
  description?: any
}) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  const { id } = await prisma.task.create({
    data: {
      title,
      status,
      description,
      createdById: session.user.id,
      updatedById: session.user.id
    }
  })

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)

  return id
}

export const updateTask = async ({
  id,
  title,
  status,
  description
}: {
  id: string
  title: string
  status: TaskStatus
  description?: any
}) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.task.update({
    where: {
      id
    },
    data: {
      title,
      status,
      description,
      updatedById: session.user.id
    }
  })

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
}

export const deleteTask = async (id: string) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.task.delete({
    where: {
      id
    }
  })

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
}
