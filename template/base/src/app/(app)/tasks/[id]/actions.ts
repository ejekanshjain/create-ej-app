'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getPresignedUrl, markFileUploaded } from '@/lib/s3Client'
import { authActionClient } from '@/lib/safe-action'
import {
  createTaskUseCase,
  deleteTaskUseCase,
  getTaskByIdWithUserUseCase,
  updateTaskUseCase
} from '@/use-case/task'
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

export const getTaskImageUploadPresignedUrlAction = authActionClient
  .schema(
    z.object({
      filename: z.string().min(1),
      contentType: z.string().min(1)
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    return await getPresignedUrl({
      // contentTypeStartsWith: 'image/',
      isPublic: true,
      filename: parsedInput.filename,
      contentType: parsedInput.contentType,
      createdById: ctx.user.id
    })
  })

export const markTaskImageUploadedAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }) => {
    try {
      await markFileUploaded(ctx.user, id)
      return {
        success: true
      }
    } catch (err) {
      return {
        success: false
      }
    }
  })
