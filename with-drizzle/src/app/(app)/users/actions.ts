'use server'

import { z } from 'zod'

import { User } from '@/db/schema'
import { authActionClient } from '@/lib/safe-action'
import { SortOrderEnum } from '@/lib/sortOrderEnum'
import { getUsersUseCase } from '@/use-case/user'

export const getUsersAction = authActionClient
  .schema(
    z.object({
      page: z.number().min(1),
      limit: z.number().min(1).max(1000),
      sortBy: z.enum(['name']).optional(),
      sortOrder: z.enum(SortOrderEnum).optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      type: z.array(z.enum(User.type.enumValues)).optional()
    })
  )
  .action(async ({ ctx, parsedInput }) => {
    return await getUsersUseCase(ctx.user.type, {
      page: parsedInput.page,
      limit: parsedInput.limit,
      sortBy: parsedInput.sortBy,
      sortOrder: parsedInput.sortOrder,
      filters: {
        name: parsedInput.name,
        email: parsedInput.email,
        type: parsedInput.type
      }
    })
  })
