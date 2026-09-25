import 'server-only'

import { eq } from 'drizzle-orm'
import { db } from '~/db'
import {
  organizationSubscriptionStatusEnum,
  organizationSubscriptionsTable,
  organizationsTable
} from '~/db/schema'
import { AppError, AppErrorCode } from './errors'
import { PLANS, hasLiveSubscription, type PlanId } from './plans'
import { stripeClient } from './stripe'

type SubscriptionRow = typeof organizationSubscriptionsTable.$inferSelect
type SubscriptionStatus = SubscriptionRow['status']

const KNOWN_STATUSES = new Set<string>(
  organizationSubscriptionStatusEnum.enumValues
)

/** Maps a Stripe price back to the plan and billing interval it belongs to. */
export const getPlanAndIntervalByPriceId = (
  priceId: string
): { planId: PlanId; interval: 'month' | 'year' } | null => {
  for (const plan of PLANS) {
    if (!plan.stripePrice) continue
    if (plan.stripePrice.monthly.id === priceId)
      return { planId: plan.id, interval: 'month' }
    if (plan.stripePrice.annual.id === priceId)
      return { planId: plan.id, interval: 'year' }
  }
  return null
}

/** One trial per organization, and only from the free plan. */
export const canStartTrial = (
  sub: Pick<SubscriptionRow, 'status' | 'hasUsedTrial'>
): boolean => sub.status === 'free' && !sub.hasUsedTrial

/**
 * Returns the organization's Stripe customer, creating one on first checkout.
 * A billing email is required first so receipts have somewhere to go.
 */
export const ensureStripeCustomer = async (
  sub: SubscriptionRow
): Promise<string> => {
  if (sub.stripeCustomerId) return sub.stripeCustomerId

  if (!sub.billingEmail) {
    throw new AppError(
      AppErrorCode.BAD_REQUEST,
      'Add a billing email before you choose a paid plan.'
    )
  }

  const org = await db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.id, sub.organizationId),
    columns: { name: true }
  })

  // The idempotency key makes a double-clicked checkout reuse one customer
  // instead of orphaning the first one's webhooks.
  const customer = await stripeClient.customers.create(
    {
      email: sub.billingEmail,
      name: org?.name,
      metadata: { organizationId: sub.organizationId }
    },
    { idempotencyKey: `organization-${sub.organizationId}-customer` }
  )

  await db
    .update(organizationSubscriptionsTable)
    .set({ stripeCustomerId: customer.id })
    .where(eq(organizationSubscriptionsTable.id, sub.id))

  return customer.id
}

/**
 * Copies the customer's latest Stripe subscription onto the organization.
 *
 * Webhooks call this for every relevant event, so it reads the current state
 * from Stripe instead of trusting the event payload, which may arrive out of
 * order.
 */
export const syncSubscriptionFromStripe = async (
  customerId: string
): Promise<void> => {
  const subs = await stripeClient.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10
  })

  // Newest first. Prefer a subscription that still bills over a newer one
  // that ended, so the organization never drops to free while paying.
  const sub =
    subs.data.find(item => hasLiveSubscription(item.status)) ?? subs.data[0]

  if (
    !sub ||
    sub.status === 'canceled' ||
    sub.status === 'incomplete_expired'
  ) {
    await db
      .update(organizationSubscriptionsTable)
      .set({
        plan: 'free',
        status: 'free',
        interval: null,
        stripeSubscriptionId: null,
        trialEndsAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      })
      .where(eq(organizationSubscriptionsTable.stripeCustomerId, customerId))
    return
  }

  if (!KNOWN_STATUSES.has(sub.status)) {
    throw new AppError(
      AppErrorCode.INTERNAL,
      `Stripe subscription ${sub.id} has unknown status ${sub.status}. Add it to the status enum to sync it.`
    )
  }

  const item = sub.items.data[0]
  const resolved = item ? getPlanAndIntervalByPriceId(item.price.id) : null

  if (!resolved) {
    console.error(
      `Stripe price ${item?.price.id} on subscription ${sub.id} does not map to a plan; the organization stays on the free plan.`
    )
  }

  const periodEnd = item?.current_period_end ?? null

  await db
    .update(organizationSubscriptionsTable)
    .set({
      plan: resolved?.planId ?? 'free',
      status: sub.status as SubscriptionStatus,
      interval: resolved?.interval ?? null,
      stripeSubscriptionId: sub.id,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      ...(sub.status === 'trialing' ? { hasUsedTrial: true } : {})
    })
    .where(eq(organizationSubscriptionsTable.stripeCustomerId, customerId))
}
