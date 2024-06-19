'use server'

import { UserType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getUser = async (id: string) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  return await prisma.user.findUnique({
    where: {
      id
    },
    include: {
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
}

export type GetUserFnDataType = UnwrapPromise<ReturnType<typeof getUser>>

export const createUser = async ({
  name,
  email,
  type,
  roleId
}: {
  name: string
  email: string
  type: UserType
  roleId?: string | null
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  const { id } = await prisma.user.create({
    data: {
      name,
      email,
      type,
      roleId
    }
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)

  return id
}

export const updateUser = async ({
  id,
  name,
  email,
  type,
  roleId
}: {
  id: string
  name: string
  email: string
  type: UserType
  roleId?: string | null
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  await prisma.user.update({
    where: {
      id
    },
    data: {
      name,
      email,
      type,
      roleId
    }
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
}

export const deleteUser = async (id: string) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  await prisma.user.delete({
    where: {
      id
    }
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
}
