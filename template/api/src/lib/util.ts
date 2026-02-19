/**
 * Shared utility types, enums, and reusable Zod schema fragments.
 */
import { z } from 'zod'

/**
 * Allowed values for the `sortOrder` query parameter.
 * Maps to the SQL `ASC` / `DESC` keywords.
 */
export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Reusable Zod schema fragment for cursor-less offset pagination.
 *
 * - `page`  – 1-based page number (defaults to 1)
 * - `limit` – Number of items per page; clamped between 10 and 100 (defaults to 10)
 *
 * Spread this object into a `z.object({})` call to add pagination
 * to any route's query schema.
 */
export const paginationSchema = {
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .min(10)
    .max(100)
    .optional()
    .default(10)
}

/**
 * Generates a reusable Zod schema fragment for sort parameters.
 *
 * @param keys – A non-empty tuple of the allowed `sortBy` field names for
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
