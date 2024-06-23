'use server'

import { z } from 'zod'

import { authActionClient } from '@/lib/safe-action'
import { SortOrderEnum } from '@/lib/sortOrderEnum'
import { getTasksWithUserUseCase } from '@/use-case/task'
import { TaskStatusEnumArr } from './statusEnum'

export const getTasksAction = authActionClient
  .schema(
    z.object({
      page: z.number().gte(1),
      limit: z.number().gte(1).lte(1000),
      sortBy: z
        .enum(['id', 'title', 'status', 'createdAt', 'updatedAt'])
        .optional(),
      sortOrder: z.enum(SortOrderEnum).optional(),
      title: z.string().optional(),
      status: z.array(z.enum(TaskStatusEnumArr)).optional()
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    return await getTasksWithUserUseCase(
      { userType: ctx.user.type, roleId: ctx.user.roleId },
      {
        page: parsedInput.page,
        limit: parsedInput.limit,
        sortBy: parsedInput.sortBy,
        sortOrder: parsedInput.sortOrder,
        filters:
          parsedInput.title || parsedInput.status?.length
            ? {
                title: parsedInput.title || undefined,
                status: parsedInput.status?.length
                  ? parsedInput.status
                  : undefined
              }
            : undefined
      }
    )
  })
