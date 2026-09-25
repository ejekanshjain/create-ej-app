'use server'

import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { invitationsTable, membersTable, usersTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { MAX_FILTER_VALUES } from '~/lib/constants'
import { assertCanManageOrganization } from '~/lib/organization-access'
import { getOrganizationPlan } from '~/lib/plan-limits'
import { authActionClient, withWideEvent } from '~/lib/safe-action'
import { likeContains } from '~/lib/search'
import { optionalStringValidation, stringValidation } from '~/lib/validations'

export const getMembers = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      ...getPaginationSchema(),
      ...getSortSchema(['name', 'email', 'role', 'createdAt']),
      search: optionalStringValidation,
      filters: z
        .object({
          role: z.array(z.string()).max(MAX_FILTER_VALUES).optional()
        })
        .optional()
    })
  )
  .action(
    withWideEvent(
      'getMembers',
      async ({
        parsedInput: {
          organizationId,
          page,
          limit,
          sortBy,
          sortOrder,
          search,
          filters
        },
        ctx
      }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)

        const where = and(
          eq(membersTable.organizationId, organizationId),
          search
            ? or(
                ilike(usersTable.name, likeContains(search)),
                ilike(usersTable.email, likeContains(search))
              )
            : undefined,
          filters?.role?.length
            ? inArray(membersTable.role, filters.role)
            : undefined
        )

        const sortColumn =
          sortBy === 'name'
            ? usersTable.name
            : sortBy === 'email'
              ? usersTable.email
              : sortBy === 'role'
                ? membersTable.role
                : membersTable.createdAt

        const direction = sortOrder === SortOrderEnum.ASC ? asc : desc

        const [rows, total] = await Promise.all([
          db
            .select({
              id: membersTable.id,
              userId: usersTable.id,
              name: usersTable.name,
              email: usersTable.email,
              image: usersTable.image,
              role: membersTable.role,
              createdAt: membersTable.createdAt
            })
            .from(membersTable)
            .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
            .where(where)
            .orderBy(direction(sortColumn))
            .limit(limit)
            .offset((page - 1) * limit),
          db
            .select({ count: count() })
            .from(membersTable)
            .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
            .where(where)
        ])

        return [rows, total[0]?.count ?? 0] as const
      }
    )
  )

export const getInvitations = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      ...getPaginationSchema(),
      ...getSortSchema(['email', 'status', 'createdAt', 'expiresAt']),
      search: optionalStringValidation,
      filters: z
        .object({
          status: z.array(z.string()).max(MAX_FILTER_VALUES).optional()
        })
        .optional()
    })
  )
  .action(
    withWideEvent(
      'getInvitations',
      async ({
        parsedInput: {
          organizationId,
          page,
          limit,
          sortBy,
          sortOrder,
          search,
          filters
        },
        ctx
      }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)

        const where = and(
          eq(invitationsTable.organizationId, organizationId),
          search
            ? ilike(invitationsTable.email, likeContains(search))
            : undefined,
          filters?.status?.length
            ? inArray(invitationsTable.status, filters.status)
            : undefined
        )

        const direction = sortOrder === SortOrderEnum.ASC ? asc : desc

        const [rows, total] = await Promise.all([
          db.query.invitationsTable.findMany({
            where,
            with: { inviter: { columns: { name: true } } },
            limit,
            offset: (page - 1) * limit,
            orderBy: [direction(invitationsTable[sortBy ?? 'createdAt'])]
          }),
          db.select({ count: count() }).from(invitationsTable).where(where)
        ])

        const data = rows.map(row => ({
          id: row.id,
          email: row.email,
          role: row.role ?? 'member',
          status: row.status,
          expiresAt: row.expiresAt,
          createdAt: row.createdAt,
          inviterName: row.inviter?.name ?? null
        }))

        return [data, total[0]?.count ?? 0] as const
      }
    )
  )

/** Member count and the plan's member limit, for the invite button. */
export const getMemberUsage = authActionClient
  .inputSchema(stringValidation)
  .action(
    withWideEvent(
      'getMemberUsage',
      async ({ parsedInput: organizationId, ctx }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)

        const [[row], { plan }] = await Promise.all([
          db
            .select({ count: count() })
            .from(membersTable)
            .where(eq(membersTable.organizationId, organizationId)),
          getOrganizationPlan(organizationId)
        ])

        return { memberCount: row?.count ?? 0, maxMembers: plan.maxMembers }
      }
    )
  )
