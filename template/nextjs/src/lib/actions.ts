/**
 * Reusable Zod fragments for paginated, sortable list actions.
 */
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'

/**
 * Returns a reusable Zod schema fragment for cursor-less offset pagination.
 *
 * - `page`: 1-based page number (defaults to 1)
 * - `limit`: Number of items per page; clamped between 10 and 100 (defaults to `defaultPageSize`)
 *
 * Spread the returned object into a `z.object({})` call to add pagination
 * to any query schema.
 *
 * @param defaultPageSize - Default number of items per page (defaults to 10)
 *
 * @example
 * z.object({
 *   ...getPaginationSchema(20),
 *   ...getSortSchema(['title', 'createdAt'])
 * })
 */
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

/**
 * Generates a reusable Zod schema fragment for sort parameters.
 *
 * @param keys - A non-empty tuple of the allowed `sortBy` field names for
 *               the resource (e.g. `['title', 'createdAt', 'updatedAt']`).
 * @returns An object with `sortOrder` and `sortBy` Zod validators that can
 *          be spread into a `z.object({})` query schema.
 *
 * @example
 * z.object({
 *   ...paginationSchema,
 *   ...getSortSchema(['title', 'createdAt', 'updatedAt'])
 * })
 */
export const getSortSchema = <T extends string>(
  keys: readonly [T, ...T[]]
) => ({
  sortOrder: z.enum(SortOrderEnum).optional(),
  sortBy: z.enum(keys).optional()
})
