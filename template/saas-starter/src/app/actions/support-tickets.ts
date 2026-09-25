'use server'

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or
} from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import {
  organizationsTable,
  supportTicketMessagesTable,
  supportTicketsTable,
  usersTable
} from '~/db/schema'
import { getPaginationSchema } from '~/lib/actions'
import { AppError, AppErrorCode } from '~/lib/errors'
import { assertCanManageOrganization } from '~/lib/organization-access'
import {
  adminActionClient,
  authActionClient,
  withWideEvent
} from '~/lib/safe-action'
import { likeContains } from '~/lib/search'
import { optionalStringValidation } from '~/lib/validations'
import {
  ACCOUNT_TICKET_FILTER_VALUE,
  addSupportTicketMessageSchema,
  createSupportTicketSchema,
  listAccountSupportTicketsSchema,
  listAdminSupportTicketsSchema,
  listOrganizationSupportTicketsSchema,
  supportTicketIdSchema,
  updateSupportTicketStatusSchema
} from './support-tickets.validation'

/**
 * Tickets come in two shapes.
 *
 * An **organization ticket** has an `organizationId`. Every owner and admin
 * of that organization reads and answers it, whoever opened the thread;
 * members have no access. An **account ticket** has none, and belongs to the person who raised
 * it alone, so any signed-in user can open one about their own account.
 *
 * Platform admins see both.
 */

const ticketSelect = {
  id: supportTicketsTable.id,
  ticketNumber: supportTicketsTable.ticketNumber,
  subject: supportTicketsTable.subject,
  status: supportTicketsTable.status,
  priority: supportTicketsTable.priority,
  createdAt: supportTicketsTable.createdAt,
  resolvedAt: supportTicketsTable.resolvedAt,
  userId: supportTicketsTable.userId,
  userEmail: usersTable.email,
  userName: usersTable.name,
  organizationId: supportTicketsTable.organizationId,
  organizationName: organizationsTable.name
}

const orderBy = (sortBy: string | undefined, sortOrder: string | undefined) => {
  const column = supportTicketsTable[(sortBy || 'createdAt') as 'createdAt']
  return sortOrder === SortOrderEnum.ASC ? asc(column) : desc(column)
}

/**
 * Build the admin list's organization filter. The sentinel selects account
 * tickets, which `inArray` cannot express, so the two halves are OR'd.
 */
function organizationFilter(selected: string[] | undefined) {
  if (!selected?.length) return undefined

  const organizationIds = selected.filter(
    value => value !== ACCOUNT_TICKET_FILTER_VALUE
  )
  const conditions = [
    ...(selected.includes(ACCOUNT_TICKET_FILTER_VALUE)
      ? [isNull(supportTicketsTable.organizationId)]
      : []),
    ...(organizationIds.length
      ? [inArray(supportTicketsTable.organizationId, organizationIds)]
      : [])
  ]

  return or(...conditions)
}

/**
 * Load a ticket and assert the caller may read it: a platform admin, a manager
 * of the organization it belongs to, or the author of an account ticket.
 */
async function assertTicketAccess(
  ticketId: string,
  ctx: { user: { id: string }; isAdmin?: boolean }
) {
  const ticket = await db.query.supportTicketsTable.findFirst({
    where: eq(supportTicketsTable.id, ticketId),
    columns: { id: true, userId: true, status: true, organizationId: true }
  })

  if (!ticket)
    throw new AppError(AppErrorCode.NOT_FOUND, 'Support ticket not found.')

  // Branch explicitly. A missing organizationId means "author only", never
  // "skip the check".
  if (!ctx.isAdmin) {
    if (ticket.organizationId) {
      await assertCanManageOrganization(ticket.organizationId, ctx.user.id)
    } else if (ticket.userId !== ctx.user.id) {
      throw new AppError(
        AppErrorCode.FORBIDDEN,
        'You do not have permission to do this.'
      )
    }
  }

  return ticket
}

export const getOrganizationSupportTicketsAction = authActionClient
  .inputSchema(listOrganizationSupportTicketsSchema)
  .action(
    withWideEvent(
      'getOrganizationSupportTicketsAction',
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
          eq(supportTicketsTable.organizationId, organizationId),
          search
            ? or(
                ilike(supportTicketsTable.ticketNumber, likeContains(search)),
                ilike(supportTicketsTable.subject, likeContains(search))
              )
            : undefined,
          filters?.status?.length
            ? inArray(supportTicketsTable.status, filters.status)
            : undefined,
          filters?.priority?.length
            ? inArray(supportTicketsTable.priority, filters.priority)
            : undefined
        )

        const [results, total] = await Promise.all([
          db
            .select(ticketSelect)
            .from(supportTicketsTable)
            .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
            .leftJoin(
              organizationsTable,
              eq(supportTicketsTable.organizationId, organizationsTable.id)
            )
            .where(where)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(orderBy(sortBy, sortOrder)),
          db.select({ count: count() }).from(supportTicketsTable).where(where)
        ])

        return [results, total[0]?.count || 0] as const
      }
    )
  )

/**
 * The caller's own account tickets. Organization tickets are deliberately absent:
 * they live in their organization's shared queue, so each ticket appears in
 * exactly one list.
 */
export const getMyAccountSupportTicketsAction = authActionClient
  .inputSchema(listAccountSupportTicketsSchema)
  .action(
    withWideEvent(
      'getMyAccountSupportTicketsAction',
      async ({
        parsedInput: { page, limit, sortBy, sortOrder, search, filters },
        ctx
      }) => {
        const where = and(
          eq(supportTicketsTable.userId, ctx.user.id),
          isNull(supportTicketsTable.organizationId),
          search
            ? or(
                ilike(supportTicketsTable.ticketNumber, likeContains(search)),
                ilike(supportTicketsTable.subject, likeContains(search))
              )
            : undefined,
          filters?.status?.length
            ? inArray(supportTicketsTable.status, filters.status)
            : undefined,
          filters?.priority?.length
            ? inArray(supportTicketsTable.priority, filters.priority)
            : undefined
        )

        const [results, total] = await Promise.all([
          db
            .select(ticketSelect)
            .from(supportTicketsTable)
            .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
            .leftJoin(
              organizationsTable,
              eq(supportTicketsTable.organizationId, organizationsTable.id)
            )
            .where(where)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(orderBy(sortBy, sortOrder)),
          db.select({ count: count() }).from(supportTicketsTable).where(where)
        ])

        return [results, total[0]?.count || 0] as const
      }
    )
  )

export const getAdminSupportTicketsAction = adminActionClient
  .inputSchema(listAdminSupportTicketsSchema)
  .action(
    withWideEvent(
      'getAdminSupportTicketsAction',
      async ({
        parsedInput: { page, limit, sortBy, sortOrder, search, filters }
      }) => {
        const where = and(
          search
            ? or(
                ilike(supportTicketsTable.ticketNumber, likeContains(search)),
                ilike(supportTicketsTable.subject, likeContains(search)),
                ilike(usersTable.email, likeContains(search)),
                ilike(usersTable.name, likeContains(search)),
                ilike(organizationsTable.name, likeContains(search))
              )
            : undefined,
          filters?.status?.length
            ? inArray(supportTicketsTable.status, filters.status)
            : undefined,
          filters?.priority?.length
            ? inArray(supportTicketsTable.priority, filters.priority)
            : undefined,
          organizationFilter(filters?.organizationId)
        )

        const [results, total] = await Promise.all([
          db
            .select(ticketSelect)
            .from(supportTicketsTable)
            .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
            .leftJoin(
              organizationsTable,
              eq(supportTicketsTable.organizationId, organizationsTable.id)
            )
            .where(where)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(orderBy(sortBy, sortOrder)),
          db
            .select({ count: count() })
            .from(supportTicketsTable)
            .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
            .leftJoin(
              organizationsTable,
              eq(supportTicketsTable.organizationId, organizationsTable.id)
            )
            .where(where)
        ])

        return [results, total[0]?.count || 0] as const
      }
    )
  )

/** Organizations that have at least one ticket, for the admin list filter. */
export const getSupportTicketOrganizationsAction = adminActionClient
  .inputSchema(
    z.object({
      search: optionalStringValidation,
      ...getPaginationSchema(20)
    })
  )
  .action(
    withWideEvent(
      'getSupportTicketOrganizationsAction',
      async ({ parsedInput: { search, limit } }) => {
        const rows = await db
          .selectDistinct({
            value: organizationsTable.id,
            label: organizationsTable.name
          })
          .from(supportTicketsTable)
          .innerJoin(
            organizationsTable,
            eq(supportTicketsTable.organizationId, organizationsTable.id)
          )
          .where(
            search
              ? ilike(organizationsTable.name, likeContains(search))
              : undefined
          )
          .orderBy(asc(organizationsTable.name))
          .limit(limit)

        const [accountTicket] = await db
          .select({ id: supportTicketsTable.id })
          .from(supportTicketsTable)
          .where(isNull(supportTicketsTable.organizationId))
          .limit(1)

        return accountTicket
          ? [
              {
                value: ACCOUNT_TICKET_FILTER_VALUE,
                label: 'Account (no organization)'
              },
              ...rows
            ]
          : rows
      }
    )
  )

export const getSupportTicketDetailsAction = authActionClient
  .inputSchema(supportTicketIdSchema)
  .action(
    withWideEvent(
      'getSupportTicketDetailsAction',
      async ({ parsedInput: { ticketId }, ctx }) => {
        await assertTicketAccess(ticketId, ctx)

        const [ticket] = await db
          .select(ticketSelect)
          .from(supportTicketsTable)
          .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
          .leftJoin(
            organizationsTable,
            eq(supportTicketsTable.organizationId, organizationsTable.id)
          )
          .where(eq(supportTicketsTable.id, ticketId))

        if (!ticket)
          throw new AppError(
            AppErrorCode.NOT_FOUND,
            'Support ticket not found.'
          )

        const messages = await db
          .select({
            id: supportTicketMessagesTable.id,
            ticketId: supportTicketMessagesTable.ticketId,
            userId: supportTicketMessagesTable.userId,
            message: supportTicketMessagesTable.message,
            isAdmin: supportTicketMessagesTable.isAdmin,
            createdAt: supportTicketMessagesTable.createdAt,
            userName: usersTable.name,
            userEmail: usersTable.email
          })
          .from(supportTicketMessagesTable)
          .leftJoin(
            usersTable,
            eq(supportTicketMessagesTable.userId, usersTable.id)
          )
          .where(eq(supportTicketMessagesTable.ticketId, ticketId))
          .orderBy(asc(supportTicketMessagesTable.createdAt))

        return { ticket, messages }
      }
    )
  )

export const createSupportTicketAction = authActionClient
  .inputSchema(createSupportTicketSchema)
  .action(
    withWideEvent('createSupportTicketAction', async ({ parsedInput, ctx }) => {
      // Only an organization ticket needs a membership check. An account ticket is
      // owned by whoever raises it, so any signed-in user may open one.
      if (parsedInput.organizationId) {
        await assertCanManageOrganization(
          parsedInput.organizationId,
          ctx.user.id
        )
      }

      const [ticket] = await db
        .insert(supportTicketsTable)
        .values({
          organizationId: parsedInput.organizationId ?? null,
          userId: ctx.user.id,
          subject: parsedInput.subject,
          priority: parsedInput.priority,
          status: 'open'
        })
        .returning()

      if (!ticket)
        throw new AppError(
          AppErrorCode.INTERNAL,
          'The support ticket was not created. Try again.'
        )

      await db.insert(supportTicketMessagesTable).values({
        ticketId: ticket.id,
        userId: ctx.user.id,
        message: parsedInput.message,
        isAdmin: false
      })

      return ticket
    })
  )

export const addSupportTicketMessageAction = authActionClient
  .inputSchema(addSupportTicketMessageSchema)
  .action(
    withWideEvent(
      'addSupportTicketMessageAction',
      async ({ parsedInput, ctx }) => {
        const ticket = await assertTicketAccess(parsedInput.ticketId, ctx)
        // A platform admin replying from the admin panel is the support team.
        // The same person replying from their own ticket page is the customer.
        const asSupport = Boolean(ctx.isAdmin) && parsedInput.asSupport

        if (!asSupport && ['closed', 'resolved'].includes(ticket.status)) {
          throw new AppError(
            AppErrorCode.BAD_REQUEST,
            'Resolved or closed support tickets cannot receive customer messages.'
          )
        }

        const [message] = await db
          .insert(supportTicketMessagesTable)
          .values({
            ticketId: ticket.id,
            userId: ctx.user.id,
            message: parsedInput.message,
            isAdmin: asSupport
          })
          .returning()

        if (asSupport) {
          await db
            .update(supportTicketsTable)
            .set({
              status: 'waiting_customer',
              resolvedAt: null,
              updatedAt: new Date()
            })
            .where(eq(supportTicketsTable.id, ticket.id))
        } else if (ticket.status === 'waiting_customer') {
          await db
            .update(supportTicketsTable)
            .set({
              status: 'in_progress',
              updatedAt: new Date()
            })
            .where(eq(supportTicketsTable.id, ticket.id))
        }

        return message
      }
    )
  )

export const updateSupportTicketStatusAction = adminActionClient
  .inputSchema(updateSupportTicketStatusSchema)
  .action(
    withWideEvent(
      'updateSupportTicketStatusAction',
      async ({ parsedInput }) => {
        const [ticket] = await db
          .update(supportTicketsTable)
          .set({
            status: parsedInput.status,
            resolvedAt: ['resolved', 'closed'].includes(parsedInput.status)
              ? new Date()
              : null,
            updatedAt: new Date()
          })
          .where(eq(supportTicketsTable.id, parsedInput.ticketId))
          .returning()

        if (!ticket)
          throw new AppError(
            AppErrorCode.NOT_FOUND,
            'Support ticket not found.'
          )

        return ticket
      }
    )
  )
