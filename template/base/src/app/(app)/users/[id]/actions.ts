'use server'

import { revalidatePath } from 'next/cache'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getUser = async (id: string) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  return await prisma.user.findUnique({
    where: {
      id
    }
  })
}

export type GetUserFnDataType = UnwrapPromise<ReturnType<typeof getUser>>

export const createUser = async ({
  name,
  email
}: {
  name: string
  email: string
}) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  const { id } = await prisma.user.create({
    data: {
      name,
      email
    }
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)

  return id
}

export const updateUser = async ({
  id,
  name,
  email
}: {
  id: string
  name: string
  email: string
}) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.user.update({
    where: {
      id
    },
    data: {
      name,
      email
    }
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
}

export const deleteUser = async (id: string) => {
  const session = await getAuthSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.user.delete({
    where: {
      id
    }
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
}
