'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { uploadFile } from '@/lib/s3Client'
import { authActionClient } from '@/lib/safe-action'
import {
  createTaskUseCase,
  deleteTaskUseCase,
  getTaskByIdWithUserUseCase,
  updateTaskUseCase
} from '@/use-case/task'
import { readFile } from 'fs/promises'
import { TaskCreateUpdateSchema, TaskUpdateServerSchema } from './validation'

export const getTaskAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput, ctx }) => {
    return await getTaskByIdWithUserUseCase(ctx.user, parsedInput)
  })

export const createTaskAction = authActionClient
  .schema(TaskCreateUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const id = await createTaskUseCase(ctx.user, parsedInput)

    revalidatePath('/tasks')
    revalidatePath(`/tasks/${id}`)

    return {
      id,
      success: true
    }
  })

export const updateTaskAction = authActionClient
  .schema(TaskUpdateServerSchema)
  .action(async ({ parsedInput: id, ctx }) => {
    await updateTaskUseCase(ctx.user, id)

    revalidatePath('/tasks')
    revalidatePath(`/tasks/${id}`)

    console.log(
      await uploadFile({
        body: await readFile('package.json'),
        filename: 'package.json',
        isPublic: true
      })
    )

    return {
      success: true
    }
  })

export const deleteTaskAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }) => {
    await deleteTaskUseCase(ctx.user, id)

    revalidatePath('/tasks')
    revalidatePath(`/tasks/${id}`)

    return {
      success: true
    }
  })

export const getUploadPresignedUrlAction = authActionClient
  .schema(z.object({}))
  .action(async () => {})
