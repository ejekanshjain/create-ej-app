'use server'

import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { feedbacksTable, organizationsTable, usersTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { MAX_FILTER_VALUES, MAX_RATING, MIN_RATING } from '~/lib/constants'
import { adminActionClient, withWideEvent } from '~/lib/safe-action'
import { likeContains } from '~/lib/search'
import { optionalStringValidation } from '~/lib/validations'

export const getFeedbacks = adminActionClient
  .inputSchema(
    z.object({
      ...getPaginationSchema(),
      ...getSortSchema(['createdAt', 'rating']),
      search: optionalStringValidation,
      filters: z
        .object({
          rating: z
            .array(z.coerce.number().int().min(MIN_RATING).max(MAX_RATING))
            .max(MAX_FILTER_VALUES)
            .optional()
        })
        .optional()
    })
  )
  .action(
    withWideEvent(
      'getFeedbacks',
      async ({
        parsedInput: { page, limit, sortBy, sortOrder, search, filters }
      }) => {
        const where = and(
          search
            ? or(
                ilike(feedbacksTable.comment, likeContains(search)),
                ilike(usersTable.email, likeContains(search)),
                ilike(usersTable.name, likeContains(search)),
                ilike(organizationsTable.name, likeContains(search))
              )
            : undefined,
          filters?.rating?.length
            ? inArray(feedbacksTable.rating, filters.rating)
            : undefined
        )

        const [results, total] = await Promise.all([
          db
            .select({
              id: feedbacksTable.id,
              rating: feedbacksTable.rating,
              comment: feedbacksTable.comment,
              createdAt: feedbacksTable.createdAt,
              userId: feedbacksTable.userId,
              organizationId: feedbacksTable.organizationId,
              userEmail: usersTable.email,
              userName: usersTable.name,
              organizationName: organizationsTable.name
            })
            .from(feedbacksTable)
            .leftJoin(usersTable, eq(feedbacksTable.userId, usersTable.id))
            .leftJoin(
              organizationsTable,
              eq(feedbacksTable.organizationId, organizationsTable.id)
            )
            .where(where)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(
              sortOrder === SortOrderEnum.ASC
                ? asc(feedbacksTable[sortBy || 'createdAt'])
                : desc(feedbacksTable[sortBy || 'createdAt'])
            ),
          db
            .select({ count: count() })
            .from(feedbacksTable)
            .leftJoin(usersTable, eq(feedbacksTable.userId, usersTable.id))
            .leftJoin(
              organizationsTable,
              eq(feedbacksTable.organizationId, organizationsTable.id)
            )
            .where(where)
        ])

        return [results, total[0]?.count || 0] as const
      }
    )
  )
