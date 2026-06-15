import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'

export const getPaginationSchema = (defaultPageSize = 10) => ({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .min(10)
    .max(100)
    .optional()
    .default(defaultPageSize)
})

export const getSortSchema = <T extends string>(
  keys: readonly [T, ...T[]]
) => ({
  sortOrder: z.enum(SortOrderEnum).optional(),
  sortBy: z.enum(keys).optional()
})
