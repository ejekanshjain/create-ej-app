'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { organizationSubscriptionsTable } from '~/db/schema'
import { env } from '~/env'
import { canStartTrial, ensureStripeCustomer } from '~/lib/billing'
import { TRIAL_DAYS } from '~/lib/constants'
import { AppError, AppErrorCode } from '~/lib/errors'
import { assertCanManageOrganization } from '~/lib/organization-access'
import { getOrganizationPlan } from '~/lib/plan-limits'
import { PLANS, hasLiveSubscription } from '~/lib/plans'
import { authActionClient, withWideEvent } from '~/lib/safe-action'
import { stripeClient } from '~/lib/stripe'
import { emailValidation, stringValidation } from '~/lib/validations'

const billingReturnUrl = (organizationId: string) =>
  `${env.BETTER_AUTH_URL}/app/${organizationId}/settings/billing`

async function getSubscription(organizationId: string) {
  const sub = await db.query.organizationSubscriptionsTable.findFirst({
    where: eq(organizationSubscriptionsTable.organizationId, organizationId)
  })

  if (!sub) {
    throw new AppError(
      AppErrorCode.NOT_FOUND,
      'This organization has no billing record.'
    )
  }

  return sub
}

/**
 * Everything the billing page shows: the current plan and subscription, and
 * each plan's public prices. Stripe price IDs stay on the server.
 */
export const getBillingOverview = authActionClient
  .inputSchema(stringValidation)
  .action(
    withWideEvent(
      'getBillingOverview',
      async ({ parsedInput: organizationId, ctx }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)
        const { plan, sub } = await getOrganizationPlan(organizationId)

        return {
          currentPlan: { id: plan.id, name: plan.name },
          subscription: {
            status: sub.status,
            billingEmail: sub.billingEmail,
            trialEndsAt: sub.trialEndsAt,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            canStartTrial: canStartTrial(sub),
            hasLiveSubscription: hasLiveSubscription(sub.status)
          },
          plans: PLANS.map(item => ({
            id: item.id,
            name: item.name,
            maxMembers: item.maxMembers,
            canUseTrial: Boolean(item.canUseTrial),
            prices: item.stripePrice
              ? {
                  monthly: {
                    amount: item.stripePrice.monthly.amount,
                    currency: item.stripePrice.monthly.currency
                  },
                  annual: {
                    amount: item.stripePrice.annual.amount,
                    currency: item.stripePrice.annual.currency
                  }
                }
              : null
          }))
        }
      }
    )
  )

export const updateBillingEmailAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      billingEmail: emailValidation
    })
  )
  .action(
    withWideEvent(
      'updateBillingEmailAction',
      async ({ parsedInput: { organizationId, billingEmail }, ctx }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)
        const sub = await getSubscription(organizationId)

        if (sub.stripeCustomerId) {
          await stripeClient.customers.update(sub.stripeCustomerId, {
            email: billingEmail
          })
        }

        await db
          .update(organizationSubscriptionsTable)
          .set({ billingEmail })
          .where(eq(organizationSubscriptionsTable.id, sub.id))

        return true
      }
    )
  )

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
    withWideEvent(
      'createCheckoutSessionAction',
      async ({
        parsedInput: { organizationId, plan, interval, withTrial },
        ctx
      }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)
        const sub = await getSubscription(organizationId)

        if (hasLiveSubscription(sub.status) || sub.stripeSubscriptionId) {
          throw new AppError(
            AppErrorCode.CONFLICT,
            'This organization already has a subscription. Change plans from Manage Billing.'
          )
        }

        const planDef = PLANS.find(item => item.id === plan)
        const price = planDef?.stripePrice?.[interval]
        if (!price) {
          throw new AppError(
            AppErrorCode.BAD_REQUEST,
            'That plan is not available. Choose another plan.'
          )
        }

        // The webhook marks the trial as used once Stripe starts it, so an
        // abandoned checkout does not use it up.
        const trialAllowed =
          withTrial && Boolean(planDef?.canUseTrial) && canStartTrial(sub)

        const customerId = await ensureStripeCustomer(sub)

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
          throw new AppError(
            AppErrorCode.INTERNAL,
            'Stripe did not return a checkout page. Try again.'
          )
        }

        return { url: session.url }
      }
    )
  )

export const createPortalSessionAction = authActionClient
  .inputSchema(z.object({ organizationId: stringValidation }))
  .action(
    withWideEvent(
      'createPortalSessionAction',
      async ({ parsedInput: { organizationId }, ctx }) => {
        await assertCanManageOrganization(organizationId, ctx.user.id)
        const sub = await getSubscription(organizationId)

        if (!sub.stripeCustomerId) {
          throw new AppError(
            AppErrorCode.BAD_REQUEST,
            'This organization has no billing account yet. Choose a paid plan first.'
          )
        }

        const session = await stripeClient.billingPortal.sessions.create({
          customer: sub.stripeCustomerId,
          return_url: billingReturnUrl(organizationId),
          configuration: env.STRIPE_PORTAL_CONFIGURATION_ID
        })

        return { url: session.url }
      }
    )
  )
