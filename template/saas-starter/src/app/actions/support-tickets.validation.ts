import { z } from 'zod'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { MAX_FILTER_VALUES } from '~/lib/constants'
import {
  optionalStringValidation,
  requiredMessageValidation,
  stringValidation
} from '~/lib/validations'

export const supportTicketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed'
])

export const supportTicketPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
])

/**
 * Omit `organizationId` to raise an account ticket, visible only to its author
 * and platform admins. Supply it to raise an organization ticket, which every
 * manager of that organization can read and answer. An empty string is coerced
 * to null so a blank form field cannot masquerade as an organization id.
 */
export const createSupportTicketSchema = z.object({
  organizationId: z
    .string()
    .trim()
    .transform(value => value || null)
    .nullish(),
  subject: stringValidation,
  priority: supportTicketPrioritySchema.default('medium'),
  message: requiredMessageValidation
})

export const addSupportTicketMessageSchema = z.object({
  ticketId: stringValidation,
  message: requiredMessageValidation,
  /** Reply as the support team. Ignored unless the caller is a platform admin. */
  asSupport: z.boolean().default(false)
})

export const updateSupportTicketStatusSchema = z.object({
  ticketId: stringValidation,
  status: supportTicketStatusSchema
})

const listSortKeys = [
  'ticketNumber',
  'subject',
  'status',
  'priority',
  'createdAt',
  'resolvedAt'
] as const

/** Shared list shape. The admin list adds an organization filter on top. */
const baseListSchema = {
  ...getPaginationSchema(),
  ...getSortSchema([...listSortKeys]),
  search: optionalStringValidation,
  filters: z
    .object({
      status: z
        .array(supportTicketStatusSchema)
        .max(MAX_FILTER_VALUES)
        .optional(),
      priority: z
        .array(supportTicketPrioritySchema)
        .max(MAX_FILTER_VALUES)
        .optional()
    })
    .optional()
}

export const listOrganizationSupportTicketsSchema = z.object({
  organizationId: stringValidation,
  ...baseListSchema
})

export const listAccountSupportTicketsSchema = z.object(baseListSchema)

/**
 * Sentinel for the admin organization filter. `inArray` cannot express IS NULL,
 * so account tickets are selected by this value instead of an organization id.
 */
export const ACCOUNT_TICKET_FILTER_VALUE = 'account'

export const listAdminSupportTicketsSchema = z.object({
  ...baseListSchema,
  filters: z
    .object({
      status: z
        .array(supportTicketStatusSchema)
        .max(MAX_FILTER_VALUES)
        .optional(),
      priority: z
        .array(supportTicketPrioritySchema)
        .max(MAX_FILTER_VALUES)
        .optional(),
      organizationId: z.array(z.string()).max(MAX_FILTER_VALUES).optional()
    })
    .optional()
})

export const supportTicketIdSchema = z.object({ ticketId: stringValidation })
