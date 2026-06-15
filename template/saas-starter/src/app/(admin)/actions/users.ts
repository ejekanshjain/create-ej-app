'use server'

import {
  and,
  asc,
  count,
  desc,
  ilike,
  inArray,
  isNotNull,
  or
} from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { usersTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { adminActionClient } from '~/lib/safe-action'

export const getUsers = adminActionClient
  .inputSchema(
    z.object({
      ...getPaginationSchema(),
      ...getSortSchema(['name', 'email', 'createdAt']),
      search: z.string().trim().optional(),
      filters: z
        .object({
          role: z.array(z.string()).optional(),
          banned: z.array(z.boolean()).optional()
        })
        .optional()
    })
  )
  .action(
    async ({
      parsedInput: { page, limit, sortBy, sortOrder, search, filters }
    }) => {
      const where = and(
        search
          ? or(
              ilike(usersTable.name, `%${search}%`),
              ilike(usersTable.email, `%${search}%`)
            )
          : undefined,
        filters?.role && filters.role.length > 0
          ? inArray(usersTable.role, filters.role)
          : undefined,
        filters?.banned && filters.banned.length > 0
          ? inArray(usersTable.banned, filters.banned)
          : undefined
      )

      const [results, total] = await Promise.all([
        db.query.usersTable.findMany({
          where,
          limit,
          offset: (page - 1) * limit,
          orderBy: [
            sortOrder === SortOrderEnum.ASC
              ? asc(usersTable[sortBy || 'createdAt'])
              : desc(usersTable[sortBy || 'createdAt'])
          ]
        }),
        db.select({ count: count() }).from(usersTable).where(where)
      ])

      return [results, total[0]?.count ?? 0] as const
    }
  )

export const getDistinctRoles = adminActionClient
  .inputSchema(
    z.object({
      search: z.string().trim().optional(),
      ...getPaginationSchema(20)
    })
  )
  .action(async ({ parsedInput: { search, limit } }) => {
    const where = and(
      isNotNull(usersTable.role),
      search ? ilike(usersTable.role, `%${search}%`) : undefined
    )

    const rows = await db
      .selectDistinct({ role: usersTable.role })
      .from(usersTable)
      .where(where)
      .orderBy(asc(usersTable.role))
      .limit(limit)

    return rows
      .filter(r => r.role !== null)
      .map(r => ({
        value: r.role!,
        label: r.role!.charAt(0).toUpperCase() + r.role!.slice(1)
      }))
  })
