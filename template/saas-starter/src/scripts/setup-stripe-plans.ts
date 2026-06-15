import { writeFile } from 'fs/promises'
import type Stripe from 'stripe'
import { env } from '~/env'
import { PLANS } from '~/lib/plans'
import { stripeClient } from '~/lib/stripe'

const checkStripePriceExists = async (priceId: string) => {
  try {
    await stripeClient.prices.retrieve(priceId)
    return true
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'resource_missing'
    ) {
      return false
    }
    throw err
  }
}

const createStripeProduct = async (name: string, planId: string) => {
  const newProduct = await stripeClient.products.create({
    name,
    metadata: { planId }
  })

  return newProduct.id
}

const createStripePrice = async (
  productId: string,
  planId: string,
  interval: 'month' | 'year',
  amount: number,
  currency: string
) => {
  const newPrice = await stripeClient.prices.create({
    product: productId,
    currency,
    unit_amount: amount,
    recurring: { interval },
    metadata: { planId }
  })

  return newPrice.id
}

type PaidPlanPrices = {
  planId: string
  productId: string
  monthlyPriceId: string
  annualPriceId: string
}

const setupStripePlans = async () => {
  let newEnvString = ''
  const paidPlans: PaidPlanPrices[] = []

  for (const plan of PLANS) {
    if (!plan.stripePrice) continue

    const monthlyExists = await checkStripePriceExists(
      plan.stripePrice.monthly.id
    )
    const annualExists = await checkStripePriceExists(
      plan.stripePrice.annual.id
    )

    if ((!monthlyExists && annualExists) || (monthlyExists && !annualExists)) {
      throw new Error(
        `Inconsistent Stripe price setup for plan ${plan.name}. Monthly exists: ${monthlyExists}, Annual exists: ${annualExists}`
      )
    }

    if (monthlyExists && annualExists) {
      const price = await stripeClient.prices.retrieve(
        plan.stripePrice.monthly.id
      )
      paidPlans.push({
        planId: plan.id,
        productId:
          typeof price.product === 'string' ? price.product : price.product.id,
        monthlyPriceId: plan.stripePrice.monthly.id,
        annualPriceId: plan.stripePrice.annual.id
      })
      continue
    }

    const productId = await createStripeProduct(plan.name, plan.id)
    const monthlyPriceId = await createStripePrice(
      productId,
      plan.id,
      'month',
      plan.stripePrice.monthly.amount,
      plan.stripePrice.monthly.currency
    )

    newEnvString += `\nSTRIPE_PRICE_${plan.id.toUpperCase()}_MONTHLY="${monthlyPriceId}"`

    const annualPriceId = await createStripePrice(
      productId,
      plan.id,
      'year',
      plan.stripePrice.annual.amount,
      plan.stripePrice.annual.currency
    )

    newEnvString += `\nSTRIPE_PRICE_${plan.id.toUpperCase()}_ANNUAL="${annualPriceId}"`

    paidPlans.push({
      planId: plan.id,
      productId,
      monthlyPriceId,
      annualPriceId
    })
  }

  const portalConfigId = await setupPortalConfiguration(paidPlans)
  if (portalConfigId) {
    newEnvString += `\nSTRIPE_PORTAL_CONFIGURATION_ID="${portalConfigId}"`
  }

  newEnvString = newEnvString.trim()

  if (newEnvString) {
    await writeFile('stripe.txt', newEnvString)
    console.info('Stripe setup complete. New values written to stripe.txt')
  } else {
    console.info('All Stripe plans and portal config already exist.')
  }
}

const setupPortalConfiguration = async (paidPlans: PaidPlanPrices[]) => {
  if (paidPlans.length === 0) return null

  const params: Stripe.BillingPortal.ConfigurationCreateParams = {
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ['address', 'name', 'tax_id']
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'other'
          ]
        }
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        proration_behavior: 'create_prorations',
        products: paidPlans.map(p => ({
          product: p.productId,
          prices: [p.monthlyPriceId, p.annualPriceId]
        }))
      }
    }
  }

  const existingId = env.STRIPE_PORTAL_CONFIGURATION_ID
  if (existingId) {
    try {
      await stripeClient.billingPortal.configurations.update(existingId, params)
      return null
    } catch (err) {
      const isMissing =
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: string }).code === 'resource_missing'
      if (!isMissing) throw err
    }
  }

  const created = await stripeClient.billingPortal.configurations.create(params)
  return created.id
}

if (import.meta.main) {
  try {
    await setupStripePlans()
  } catch (err) {
    console.error('Error setting up stripe plans:', err)
  } finally {
    process.exit(0)
  }
}
