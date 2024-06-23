import { z } from 'zod'

import { authActionClient } from '@/lib/safe-action'
import {
  createTaskUseCase,
  deleteTaskUseCase,
  getTaskByIdWithUserUseCase,
  updateTaskUseCase
} from '@/use-case/task'
import { TaskCreateUpdateSchema, TaskUpdateServerSchema } from './validations'

export const getTaskAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput, ctx }) => {
    return await getTaskByIdWithUserUseCase(ctx.user, parsedInput)
  })

export const createTaskAction = authActionClient
  .schema(TaskCreateUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await createTaskUseCase(ctx.user, parsedInput)
  })

export const updateTaskAction = authActionClient
  .schema(TaskUpdateServerSchema)
  .action(async ({ parsedInput, ctx }) => {
    return await updateTaskUseCase(ctx.user, parsedInput)
  })

export const deleteTaskAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput, ctx }) => {
    return await deleteTaskUseCase(ctx.user, parsedInput)
  })
