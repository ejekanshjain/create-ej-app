import { env } from '~/env'

export type Plan = {
  id: 'free' | 'pro' | 'ultimate'
  name: string
  maxMembers: number
  stripePrice?: {
    monthly: {
      id: string
      amount: number
      currency: string
    }
    annual: {
      id: string
      amount: number
      currency: string
    }
  }
  canUseTrial?: boolean
}

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
