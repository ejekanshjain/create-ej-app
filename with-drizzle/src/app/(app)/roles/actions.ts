'use server'

import { z } from 'zod'

import { authActionClient } from '@/lib/safe-action'
import { SortOrderEnum } from '@/lib/sortOrderEnum'
import { getRolesUseCase } from '@/use-case/role'

export const getRolesAction = authActionClient
  .schema(
    z.object({
      page: z.number().min(1),
      limit: z.number().min(1).max(1000),
      sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
      sortOrder: z.enum(SortOrderEnum).optional(),
      name: z.string().optional()
    })
  )
  .action(
    async ({ parsedInput: { page, limit, sortBy, sortOrder, name }, ctx }) => {
      return await getRolesUseCase(ctx.user.type, {
        page,
        limit,
        sortBy,
        sortOrder,
        filters: name
          ? {
              name
            }
          : undefined
      })
    }
  )
