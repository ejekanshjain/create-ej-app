'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { organizationSubscriptionsTable } from '~/db/schema'
import { env } from '~/env'
import { canStartTrial, ensureStripeCustomer } from '~/lib/billing'
import { TRIAL_DAYS } from '~/lib/constants'
import { assertUserCanManageOrganization } from '~/lib/organization-access'
import { PLANS } from '~/lib/plans'
import { authActionClient } from '~/lib/safe-action'
import { stripeClient } from '~/lib/stripe'
import { emailValidation, stringValidation } from '~/lib/validations'

const ACTIVE_STATUSES = ['trialing', 'active', 'past_due'] as const

const billingReturnUrl = (organizationId: string) =>
  `${env.BETTER_AUTH_URL}/app/${organizationId}/settings/billing`

export const updateBillingEmailAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      billingEmail: emailValidation
    })
  )
  .action(async ({ parsedInput: { organizationId, billingEmail } }) => {
    await assertUserCanManageOrganization(organizationId)

    const sub = await db.query.organizationSubscriptionsTable.findFirst({
      where: eq(organizationSubscriptionsTable.organizationId, organizationId)
    })

    if (!sub) {
      throw new Error('Organization does not have a subscription')
    }

    if (sub.stripeCustomerId) {
      await stripeClient.customers.update(sub.stripeCustomerId, {
        email: billingEmail
      })
    }

    await db
      .update(organizationSubscriptionsTable)
      .set({ billingEmail })
      .where(eq(organizationSubscriptionsTable.organizationId, organizationId))

    return true
  })

export const createCheckoutSessionAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      plan: z.enum(['pro', 'ultimate']),
      interval: z.enum(['monthly', 'annual']),
      withTrial: z.boolean().default(false)
    })
  )
  .action(
    async ({ parsedInput: { organizationId, plan, interval, withTrial } }) => {
      await assertUserCanManageOrganization(organizationId)

      const sub = await db.query.organizationSubscriptionsTable.findFirst({
        where: eq(organizationSubscriptionsTable.organizationId, organizationId)
      })

      if (!sub) {
        throw new Error('Organization does not have a subscription')
      }

      if ((ACTIVE_STATUSES as readonly string[]).includes(sub.status)) {
        throw new Error(
          'This organization already has a subscription. Manage it from the billing portal.'
        )
      }

      const planDef = PLANS.find(p => p.id === plan)
      const price = planDef?.stripePrice?.[interval]
      if (!price) {
        throw new Error('Selected plan is not available')
      }

      const trialAllowed =
        withTrial && Boolean(planDef?.canUseTrial) && canStartTrial(sub)

      const customerId = await ensureStripeCustomer(organizationId)

      if (trialAllowed) {
        await db
          .update(organizationSubscriptionsTable)
          .set({ hasUsedTrial: true })
          .where(
            eq(organizationSubscriptionsTable.organizationId, organizationId)
          )
      }

      const session = await stripeClient.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: price.id, quantity: 1 }],
        client_reference_id: organizationId,
        allow_promotion_codes: true,
        success_url: `${billingReturnUrl(organizationId)}?checkout=success`,
        cancel_url: `${billingReturnUrl(organizationId)}?checkout=cancel`,
        subscription_data: {
          metadata: { organizationId },
          ...(trialAllowed
            ? {
                trial_period_days: TRIAL_DAYS,
                trial_settings: {
                  end_behavior: { missing_payment_method: 'cancel' }
                }
              }
            : {})
        },
        ...(trialAllowed
          ? { payment_method_collection: 'always' as const }
          : {})
      })

      if (!session.url) {
        throw new Error('Failed to create checkout session')
      }

      return { url: session.url }
    }
  )

export const createPortalSessionAction = authActionClient
  .inputSchema(z.object({ organizationId: stringValidation }))
  .action(async ({ parsedInput: { organizationId } }) => {
    await assertUserCanManageOrganization(organizationId)

    const sub = await db.query.organizationSubscriptionsTable.findFirst({
      where: eq(organizationSubscriptionsTable.organizationId, organizationId)
    })

    if (!sub?.stripeCustomerId) {
      throw new Error('No billing account exists for this organization yet')
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: billingReturnUrl(organizationId),
      configuration: env.STRIPE_PORTAL_CONFIGURATION_ID
    })

    return { url: session.url }
  })
