'use server'

import { asc, count, desc, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { contactLeadsTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { adminActionClient, withWideEvent } from '~/lib/safe-action'
import { likeContains } from '~/lib/search'
import { optionalStringValidation } from '~/lib/validations'

export const getContactLeads = adminActionClient
  .inputSchema(
    z.object({
      ...getPaginationSchema(),
      ...getSortSchema(['createdAt', 'name', 'email']),
      search: optionalStringValidation
    })
  )
  .action(
    withWideEvent(
      'getContactLeads',
      async ({ parsedInput: { page, limit, sortBy, sortOrder, search } }) => {
        const where = search
          ? or(
              ilike(contactLeadsTable.name, likeContains(search)),
              ilike(contactLeadsTable.email, likeContains(search)),
              ilike(contactLeadsTable.subject, likeContains(search)),
              ilike(contactLeadsTable.message, likeContains(search))
            )
          : undefined

        const [results, total] = await Promise.all([
          db.query.contactLeadsTable.findMany({
            where,
            limit,
            offset: (page - 1) * limit,
            orderBy: [
              sortOrder === SortOrderEnum.ASC
                ? asc(contactLeadsTable[sortBy || 'createdAt'])
                : desc(contactLeadsTable[sortBy || 'createdAt'])
            ]
          }),
          db.select({ count: count() }).from(contactLeadsTable).where(where)
        ])

        return [results, total[0]?.count || 0] as const
      }
    )
  )
