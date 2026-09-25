import 'server-only'

import Stripe from 'stripe'
import { env } from '~/env'

/** Pinned to the API version this `stripe` SDK release was built for. Bump both together. */
export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia'
})
