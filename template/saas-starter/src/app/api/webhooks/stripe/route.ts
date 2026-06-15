import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { db } from '~/db'
import { stripeWebhooksEventsTable } from '~/db/schema'
import { env } from '~/env'
import { syncSubscriptionFromStripe } from '~/lib/billing'
import { stripeClient } from '~/lib/stripe'

const RELEVANT_EVENTS: ReadonlySet<string> = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'invoice.paid',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
])

const extractCustomerId = (event: Stripe.Event): string | null => {
  const object = event.data.object as {
    customer?: string | { id: string } | null
  }
  const customer = object.customer
  if (!customer) return null
  return typeof customer === 'string' ? customer : customer.id
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return new NextResponse('Unauthorized', { status: 400 })
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const existing = await db.query.stripeWebhooksEventsTable.findFirst({
    where: eq(stripeWebhooksEventsTable.id, event.id)
  })

  if (existing?.processed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  if (!existing) {
    await db
      .insert(stripeWebhooksEventsTable)
      .values({ id: event.id, type: event.type })
      .onConflictDoNothing()
  }

  try {
    const customerId = extractCustomerId(event)
    if (customerId) {
      await syncSubscriptionFromStripe(customerId)
    }

    await db
      .update(stripeWebhooksEventsTable)
      .set({ processed: true, processedAt: new Date(), error: null })
      .where(eq(stripeWebhooksEventsTable.id, event.id))

    return NextResponse.json({ received: true, processed: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Failed to process Stripe event ${event.id}:`, error)

    await db
      .update(stripeWebhooksEventsTable)
      .set({ error: message, payload: event as unknown })
      .where(eq(stripeWebhooksEventsTable.id, event.id))

    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}
