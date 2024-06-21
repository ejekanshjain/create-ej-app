'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { authActionClient } from '@/lib/safe-action'
import {
  createRoleUseCase,
  deleteRoleUseCase,
  getRoleWithPermissionsUseCase,
  updateRoleUseCase
} from '@/use-case/role'
import { RoleCreateUpdateSchema, RoleUpdateServerSchema } from './validation'

export const getRoleAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }) => {
    return await getRoleWithPermissionsUseCase(ctx.user.type, id)
  })

export const createRoleAction = authActionClient
  .schema(RoleCreateUpdateSchema)
  .action(async ({ parsedInput: { name, permissions }, ctx }) => {
    const id = await createRoleUseCase(ctx.user.type, { name, permissions })

    revalidatePath('/roles')
    revalidatePath(`/roles/${id}`)

    return {
      success: true,
      id
    }
  })

export const updateRoleAction = authActionClient
  .schema(RoleUpdateServerSchema)
  .action(async ({ parsedInput: { id, name, permissions }, ctx }) => {
    await updateRoleUseCase(ctx.user.type, { id, name, permissions })

    revalidatePath('/roles')
    revalidatePath(`/roles/${id}`)

    return {
      success: true
    }
  })

export const deleteRoleAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }) => {
    await deleteRoleUseCase(ctx.user.type, id)

    revalidatePath('/roles')
    revalidatePath(`/roles/${id}`)

    return {
      success: true
    }
  })
