'use server'

import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { invitationsTable, membersTable, usersTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { assertUserCanManageOrganization } from '~/lib/organization-access'
import { authActionClient } from '~/lib/safe-action'
import { resolveImageUrl } from '~/lib/storage'
import { stringValidation } from '~/lib/validations'

export const getMembers = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      ...getPaginationSchema(),
      ...getSortSchema(['name', 'email', 'role', 'createdAt']),
      search: z.string().trim().optional(),
      filters: z
        .object({
          role: z.array(z.string()).optional()
        })
        .optional()
    })
  )
  .action(
    async ({
      parsedInput: {
        organizationId,
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        filters
      }
    }) => {
      await assertUserCanManageOrganization(organizationId)

      const where = and(
        eq(membersTable.organizationId, organizationId),
        search
          ? or(
              ilike(usersTable.name, `%${search}%`),
              ilike(usersTable.email, `%${search}%`)
            )
          : undefined,
        filters?.role && filters.role.length > 0
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

      const data = rows.map(row => ({
        ...row,
        image: resolveImageUrl(row.image)
      }))

      return [data, total[0]?.count ?? 0] as const
    }
  )

export const getInvitations = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      ...getPaginationSchema(),
      ...getSortSchema(['email', 'status', 'createdAt', 'expiresAt']),
      search: z.string().trim().optional(),
      filters: z
        .object({
          status: z.array(z.string()).optional()
        })
        .optional()
    })
  )
  .action(
    async ({
      parsedInput: {
        organizationId,
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        filters
      }
    }) => {
      await assertUserCanManageOrganization(organizationId)

      const where = and(
        eq(invitationsTable.organizationId, organizationId),
        search ? ilike(invitationsTable.email, `%${search}%`) : undefined,
        filters?.status && filters.status.length > 0
          ? inArray(invitationsTable.status, filters.status)
          : undefined
      )

      const sortColumn = invitationsTable[sortBy ?? 'createdAt']
      const direction = sortOrder === SortOrderEnum.ASC ? asc : desc

      const [rows, total] = await Promise.all([
        db.query.invitationsTable.findMany({
          where,
          with: {
            user: { columns: { name: true } }
          },
          limit,
          offset: (page - 1) * limit,
          orderBy: [direction(sortColumn)]
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
        inviterName: row.user?.name ?? null
      }))

      return [data, total[0]?.count ?? 0] as const
    }
  )
