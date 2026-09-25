import 'server-only'

import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '~/db'
import { organizationSubscriptionsTable } from '~/db/schema'
import { AppError, AppErrorCode } from './errors'
import { PLANS, isActiveSubscriptionStatus } from './plans'

/**
 * The plan an organization is entitled to right now, and its subscription row.
 *
 * Only a trialing, active, or past-due subscription grants its paid plan;
 * every other status falls back to the free plan.
 */
export const getOrganizationPlan = cache(async (organizationId: string) => {
  const sub = await db.query.organizationSubscriptionsTable.findFirst({
    where: eq(organizationSubscriptionsTable.organizationId, organizationId)
  })

  if (!sub) {
    throw new AppError(
      AppErrorCode.NOT_FOUND,
      'This organization has no subscription record.'
    )
  }

  const planId = isActiveSubscriptionStatus(sub.status) ? sub.plan : 'free'
  const plan = PLANS.find(candidate => candidate.id === planId)

  if (!plan) {
    // A configuration bug, not a customer error: masked and recorded.
    throw new Error(`Plan ${planId} is missing from the plan registry.`)
  }

  return { plan, sub }
})
