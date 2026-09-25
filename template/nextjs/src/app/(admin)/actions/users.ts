'use server'

import {
  and,
  asc,
  count,
  desc,
  eq,
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
import { MAX_FILTER_VALUES } from '~/lib/constants'
import { AppError, AppErrorCode, rethrowUniqueViolation } from '~/lib/errors'
import { superAdminActionClient, withWideEvent } from '~/lib/safe-action'
import { likeContains } from '~/lib/search'
import { optionalStringValidation, stringValidation } from '~/lib/validations'
import {
  createUserSchema,
  updateUserSchema
} from '../admin/settings/users/validation'

const EMAIL_TAKEN = 'Another account already uses this email address.'

export const getUsers = superAdminActionClient
  .inputSchema(
    z.object({
      ...getPaginationSchema(),
      ...getSortSchema(['name', 'email', 'createdAt']),
      search: optionalStringValidation,
      filters: z
        .object({
          role: z.array(z.string()).max(MAX_FILTER_VALUES).optional(),
          banned: z.array(z.boolean()).max(MAX_FILTER_VALUES).optional()
        })
        .optional()
    })
  )
  .action(
    withWideEvent(
      'getUsers',
      async ({
        parsedInput: { page, limit, sortBy, sortOrder, search, filters }
      }) => {
        const where = and(
          search
            ? or(
                ilike(usersTable.name, likeContains(search)),
                ilike(usersTable.email, likeContains(search))
              )
            : undefined,
          filters?.role?.length
            ? inArray(usersTable.role, filters.role)
            : undefined,
          filters?.banned?.length
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

        return [results, total[0]?.count || 0] as const
      }
    )
  )

export const getDistinctRoles = superAdminActionClient
  .inputSchema(
    z.object({
      search: optionalStringValidation,
      ...getPaginationSchema(20)
    })
  )
  .action(
    withWideEvent(
      'getDistinctRoles',
      async ({ parsedInput: { search, limit } }) => {
        const where = and(
          isNotNull(usersTable.role),
          search ? ilike(usersTable.role, likeContains(search)) : undefined
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
      }
    )
  )

export const getUserById = superAdminActionClient
  .inputSchema(z.object({ userId: stringValidation }))
  .action(
    withWideEvent('getUserById', async ({ parsedInput: { userId } }) => {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
        columns: { id: true, name: true, email: true, role: true }
      })

      if (!user) {
        throw new AppError(AppErrorCode.NOT_FOUND, 'User not found.')
      }

      return user
    })
  )

/** Creates an account that signs in by magic link or OAuth with this email. */
export const createUser = superAdminActionClient
  .inputSchema(createUserSchema)
  .action(
    withWideEvent('createUser', async ({ parsedInput }) => {
      const [created] = await db
        .insert(usersTable)
        .values({
          name: parsedInput.name,
          email: parsedInput.email,
          role: parsedInput.role
        })
        .returning()
        .catch(error => rethrowUniqueViolation(error, EMAIL_TAKEN))

      return created
    })
  )

export const updateUser = superAdminActionClient
  .inputSchema(updateUserSchema)
  .action(
    withWideEvent('updateUser', async ({ parsedInput, ctx }) => {
      // Demoting yourself would lock you out of this page with no way back.
      if (parsedInput.id === ctx.user.id && parsedInput.role !== 'superadmin') {
        throw new AppError(
          AppErrorCode.BAD_REQUEST,
          'You cannot remove your own superadmin role. Ask another superadmin to change it.'
        )
      }

      const [updated] = await db
        .update(usersTable)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          role: parsedInput.role
        })
        .where(eq(usersTable.id, parsedInput.id))
        .returning()
        .catch(error => rethrowUniqueViolation(error, EMAIL_TAKEN))

      if (!updated) {
        throw new AppError(AppErrorCode.NOT_FOUND, 'User not found.')
      }

      return updated
    })
  )
