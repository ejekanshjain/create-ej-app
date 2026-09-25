/**
 * @fileoverview Postgres enum definitions. Each constant maps to a
 * `CREATE TYPE ... AS ENUM` referenced by columns in `schema.ts`.
 *
 * @module db/enums
 */
import { pgEnum } from 'drizzle-orm/pg-core'

// ─── Billing ────────────────────────────────────────────────────

export const organizationSubscriptionPlanEnum = pgEnum(
  'organization_subscription_plan_enum',
  ['free', 'pro', 'ultimate']
)

/** Stripe's subscription statuses, plus `free` for organizations without one. */
export const organizationSubscriptionStatusEnum = pgEnum(
  'organization_subscription_status_enum',
  [
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused',
    'free'
  ]
)

export const organizationSubscriptionIntervalEnum = pgEnum(
  'organization_subscription_interval_enum',
  ['month', 'year']
)

// ─── Support ────────────────────────────────────────────────────

export const supportTicketStatusEnum = pgEnum('support_ticket_status_enum', [
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed'
])

export const supportTicketPriorityEnum = pgEnum(
  'support_ticket_priority_enum',
  ['low', 'medium', 'high', 'urgent']
)
