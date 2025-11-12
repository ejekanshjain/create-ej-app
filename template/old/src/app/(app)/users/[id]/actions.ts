'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { authActionClient } from '@/lib/safe-action'
import { getRolesMiniUseCase } from '@/use-case/role'
import {
  createUserUseCase,
  deleteUserUseCase,
  getUserByIdUseCase,
  updateUserUseCase
} from '@/use-case/user'
import { UserCreateUpdateSchema, UserUpdateServerSchema } from './validation'

export const getUserAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }) => {
    return await getUserByIdUseCase(ctx.user.type, id)
  })

export const createUserAction = authActionClient
  .schema(UserCreateUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const id = await createUserUseCase(ctx.user.type, parsedInput)

    revalidatePath('/users')
    revalidatePath(`/users/${id}`)

    return {
      success: true,
      id
    }
  })

export const updateUserAction = authActionClient
  .schema(UserUpdateServerSchema)
  .action(async ({ parsedInput: { id, name, type, roleId }, ctx }) => {
    await updateUserUseCase(ctx.user.type, id, {
      name,
      type,
      roleId
    })

    revalidatePath('/users')
    revalidatePath(`/users/${id}`)

    return {
      success: true
    }
  })

export const deleteUserAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }) => {
    await deleteUserUseCase(ctx.user.type, id)

    revalidatePath('/users')
    revalidatePath(`/users/${id}`)

    return { success: true }
  })

export const getRolesMiniAction = authActionClient
  .schema(z.undefined())
  .action(async ({ ctx }) => {
    return await getRolesMiniUseCase(ctx.user.type)
  })
