'use server'

import { Permissions } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getRole = async (id: string) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  return await prisma.role.findUnique({
    where: {
      id
    },
    include: {
      permissions: true
    }
  })
}

export type GetRoleFnDataType = UnwrapPromise<ReturnType<typeof getRole>>

export const createRole = async ({
  name,
  permissions
}: {
  name: string
  permissions: Permissions[]
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  const { id } = await prisma.role.create({
    data: {
      name,
      permissions: {
        createMany: {
          data: permissions.map(permission => ({
            permission
          }))
        }
      }
    }
  })

  revalidatePath('/roles')
  revalidatePath(`/roles/${id}`)

  return id
}

export const updateRole = async ({
  id,
  name,
  permissions
}: {
  id: string
  name: string
  permissions: Permissions[]
}) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  await prisma.role.update({
    where: {
      id
    },
    data: {
      name
    }
  })
  await prisma.rolePermission.deleteMany({
    where: {
      roleId: id
    }
  })
  await prisma.rolePermission.createMany({
    data: permissions.map(permission => ({ permission, roleId: id }))
  })

  revalidatePath('/roles')
  revalidatePath(`/roles/${id}`)
}

export const deleteRole = async (id: string) => {
  const session = await authGuard(['Root'])
  if (!session) throw new Error('Unauthorized')

  await prisma.role.delete({
    where: {
      id
    }
  })

  revalidatePath('/roles')
  revalidatePath(`/roles/${id}`)
}
