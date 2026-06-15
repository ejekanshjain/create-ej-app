import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '~/db'
import { organizationSubscriptionsTable } from '~/db/schema'
import { PLANS } from './plans'

export const getOrganizationPlan = async (organizationId: string) => {
  const sub = await db.query.organizationSubscriptionsTable.findFirst({
    where: eq(organizationSubscriptionsTable.organizationId, organizationId)
  })

  if (!sub) {
    throw new Error(
      `Organization: ${organizationId} does not have a subscription`
    )
  }

  const effectivePlan =
    sub.status === 'trialing' ||
    sub.status === 'active' ||
    sub.status === 'past_due'
      ? sub.plan
      : 'free'

  const plan = PLANS.find(plan => plan.id === effectivePlan)
  if (!plan) {
    throw new Error(
      `Organization: ${organizationId} does not have a valid subscription plan, ${effectivePlan}`
    )
  }

  return {
    plan,
    sub
  }
}

export const getOrganizationPlanCached = cache(getOrganizationPlan)
