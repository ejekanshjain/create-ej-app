import { pgEnum } from 'drizzle-orm/pg-core'

export const organizationSubscriptionPlanEnum = pgEnum(
  'organization_subscription_plan_enum',
  ['free', 'pro', 'ultimate']
)

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
