'use server'

import { TaskStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { storageClient } from '@/lib/storageClient'
import { UnwrapPromise } from '@/types/UnwrapPromise'

const handleImages = async (imageIds: string[], taskId: string) => {
  const prevImages = await prisma.resource.findMany({
    where: {
      taskId
    }
  })

  for (const p of prevImages) {
    if (imageIds.includes(p.id)) continue
    await Promise.all([
      storageClient.deleteFile(p.newFilename),
      prisma.resource.delete({
        where: {
          id: p.id
        }
      })
    ])
  }

  if (imageIds.length)
    await prisma.resource.updateMany({
      where: {
        id: {
          in: imageIds
        }
      },
      data: {
        taskId
      }
    })
}

export const getTask = async (id: string) => {
  const session = await authGuard(['Root', 'Normal'], 'TaskView')
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
  description,
  imageIds
}: {
  title: string
  status: TaskStatus
  description?: any
  imageIds: string[]
}) => {
  const session = await authGuard(['Root', 'Normal'], 'TaskCreate')
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
  await handleImages(imageIds, id)

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)

  return id
}

export const updateTask = async ({
  id,
  title,
  status,
  description,
  imageIds
}: {
  id: string
  title: string
  status: TaskStatus
  description?: any
  imageIds: string[]
}) => {
  const session = await authGuard(['Root', 'Normal'], 'TaskUpdate')
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
  await handleImages(imageIds, id)

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
}

export const deleteTask = async (id: string) => {
  const session = await authGuard(['Root', 'Normal'], 'TaskDelete')
  if (!session) throw new Error('Unauthorized')

  await handleImages([], id)
  await prisma.task.delete({
    where: {
      id
    }
  })

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
}
