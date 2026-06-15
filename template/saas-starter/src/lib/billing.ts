import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { organizationSubscriptionsTable, organizationsTable } from '~/db/schema'
import { PLANS, type Plan } from './plans'
import { stripeClient } from './stripe'

type SubscriptionRow = typeof organizationSubscriptionsTable.$inferSelect

export const getPlanAndIntervalByPriceId = (
  priceId: string
): { planId: Plan['id']; interval: 'month' | 'year' } | null => {
  for (const plan of PLANS) {
    if (!plan.stripePrice) continue
    if (plan.stripePrice.monthly.id === priceId)
      return { planId: plan.id, interval: 'month' }
    if (plan.stripePrice.annual.id === priceId)
      return { planId: plan.id, interval: 'year' }
  }
  return null
}

export const canStartTrial = (
  sub: Pick<SubscriptionRow, 'status' | 'hasUsedTrial'>
): boolean => sub.status === 'free' && !sub.hasUsedTrial

export const ensureStripeCustomer = async (
  organizationId: string
): Promise<string> => {
  const sub = await db.query.organizationSubscriptionsTable.findFirst({
    where: eq(organizationSubscriptionsTable.organizationId, organizationId)
  })

  if (!sub) {
    throw new Error('Organization does not have a subscription')
  }

  if (sub.stripeCustomerId) return sub.stripeCustomerId

  if (!sub.billingEmail) {
    throw new Error('Set a billing email before subscribing')
  }

  const org = await db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.id, organizationId),
    columns: { name: true }
  })

  const customer = await stripeClient.customers.create({
    email: sub.billingEmail,
    name: org?.name,
    metadata: { organizationId }
  })

  await db
    .update(organizationSubscriptionsTable)
    .set({ stripeCustomerId: customer.id })
    .where(eq(organizationSubscriptionsTable.organizationId, organizationId))

  return customer.id
}

export const syncSubscriptionFromStripe = async (
  customerId: string
): Promise<void> => {
  const subs = await stripeClient.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1
  })

  const sub = subs.data[0]

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

  const item = sub.items.data[0]
  const resolved = item ? getPlanAndIntervalByPriceId(item.price.id) : null

  if (!resolved) {
    console.error(
      `Stripe price ${item?.price.id} on subscription ${sub.id} does not map to a known plan`
    )
  }

  const periodEnd = item?.current_period_end ?? null

  await db
    .update(organizationSubscriptionsTable)
    .set({
      plan: resolved?.planId ?? 'free',
      status: sub.status,
      interval: resolved?.interval ?? null,
      stripeSubscriptionId: sub.id,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      ...(sub.status === 'trialing' ? { hasUsedTrial: true } : {})
    })
    .where(eq(organizationSubscriptionsTable.stripeCustomerId, customerId))
}
