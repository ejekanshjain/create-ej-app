'use server'

import { z } from 'zod'

import { authActionClient } from '@/lib/safe-action'
import { getRolesUseCase } from '@/use-case/role'

export const getRolesAction = authActionClient
  .schema(
    z.object({
      page: z.number(),
      limit: z.number(),
      sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
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
        search: name
          ? {
              name
            }
          : undefined
      })
    }
  )
