import 'server-only'

import { env } from '~/env'

export type PlanId = 'free' | 'pro' | 'ultimate'

type PlanPrice = {
  id: string
  /** Minor units, as Stripe stores them: 2000 is $20.00. */
  amount: number
  currency: string
}

export type Plan = {
  id: PlanId
  name: string
  maxMembers: number
  stripePrice?: { monthly: PlanPrice; annual: PlanPrice }
  canUseTrial?: boolean
}

/** Every plan, cheapest first. Stripe prices come from `bun run stripe:setup`. */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    maxMembers: 1
  },
  {
    id: 'pro',
    name: 'Pro',
    maxMembers: 25,
    stripePrice: {
      monthly: {
        id: env.STRIPE_PRICE_PRO_MONTHLY,
        amount: 2000,
        currency: 'USD'
      },
      annual: {
        id: env.STRIPE_PRICE_PRO_ANNUAL,
        amount: 20000,
        currency: 'USD'
      }
    },
    canUseTrial: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    maxMembers: 100,
    stripePrice: {
      monthly: {
        id: env.STRIPE_PRICE_ULTIMATE_MONTHLY,
        amount: 10000,
        currency: 'USD'
      },
      annual: {
        id: env.STRIPE_PRICE_ULTIMATE_ANNUAL,
        amount: 100000,
        currency: 'USD'
      }
    }
  }
]

/** Subscription statuses that keep the paid plan's features switched on. */
export const ACTIVE_SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due'
] as const

export function isActiveSubscriptionStatus(status: string): boolean {
  return (ACTIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status)
}

/**
 * Statuses with no live Stripe subscription behind them. Any other status
 * (including `unpaid`, `paused`, and `incomplete`) still bills or can resume,
 * so changes go through the billing portal instead of a new checkout.
 */
export const ENDED_SUBSCRIPTION_STATUSES = [
  'free',
  'canceled',
  'incomplete_expired'
] as const

export function hasLiveSubscription(status: string): boolean {
  return !(ENDED_SUBSCRIPTION_STATUSES as readonly string[]).includes(status)
}
