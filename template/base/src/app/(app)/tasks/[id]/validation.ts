import { z } from 'zod'

import { Task } from '@/db/schema'

export const TaskStatusEnumArr = Task.status.enumValues

export const TaskCreateUpdateSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().optional().nullable(),
  status: z.enum(TaskStatusEnumArr)
})

export const TaskUpdateServerSchema = TaskCreateUpdateSchema.merge(
  z.object({
    id: z.string().min(1)
  })
)
