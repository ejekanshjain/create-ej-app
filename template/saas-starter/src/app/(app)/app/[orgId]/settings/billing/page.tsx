import { CreditCard } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getBillingOverview } from '~/app/(app)/actions/billing'
import { PageHeading } from '~/components/page-heading'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { formatDate } from '~/lib/format-date'
import { BillingEmailForm } from '../_components/billing-email-form'
import { PlansSection } from '../_components/plans-section'

const STATUS_BADGES: Record<
  string,
  {
    label: string
    variant: 'secondary' | 'success' | 'info' | 'warning' | 'destructive'
  }
> = {
  free: { label: 'Free', variant: 'secondary' },
  trialing: { label: 'Trialing', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  past_due: { label: 'Past Due', variant: 'destructive' },
  canceled: { label: 'Canceled', variant: 'secondary' },
  unpaid: { label: 'Unpaid', variant: 'destructive' },
  paused: { label: 'Paused', variant: 'warning' },
  incomplete: { label: 'Incomplete', variant: 'warning' },
  incomplete_expired: { label: 'Expired', variant: 'secondary' }
}

export default async function BillingPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const overview = (await getBillingOverview(orgId))?.data

  if (!overview) {
    return notFound()
  }

  const { currentPlan, subscription, plans } = overview
  const status = STATUS_BADGES[subscription.status] ?? {
    label: subscription.status,
    variant: 'secondary' as const
  }
  const trialEndsAt = formatDate(subscription.trialEndsAt)
  const renewsAt = formatDate(subscription.currentPeriodEnd)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeading
        title="Billing"
        description="Choose a plan and manage payment details."
        icon={CreditCard}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Current plan:</span>
          <span className="text-sm">{currentPlan.name}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {subscription.status === 'trialing' && subscription.trialEndsAt ? (
          <p className="text-muted-foreground text-sm">
            Your trial ends on {trialEndsAt}. Stripe charges your card then
            unless you cancel.
          </p>
        ) : null}
        {subscription.status === 'active' && subscription.currentPeriodEnd ? (
          <p className="text-muted-foreground text-sm">
            {subscription.cancelAtPeriodEnd
              ? `Your plan ends on ${renewsAt}.`
              : `Your plan renews on ${renewsAt}.`}
          </p>
        ) : null}
        {subscription.status === 'past_due' ? (
          <p className="text-destructive text-sm">
            Your last payment failed. Update your payment method from Manage
            Billing to keep your plan.
          </p>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Plans</h2>
        <p className="text-muted-foreground text-sm">
          Upgrade, switch, or cancel at any time.
        </p>
      </div>
      <PlansSection
        orgId={orgId}
        plans={plans}
        currentPlanId={currentPlan.id}
        hasActiveSub={subscription.hasLiveSubscription}
        hasBillingEmail={Boolean(subscription.billingEmail)}
        canStartTrial={subscription.canStartTrial}
      />

      <Separator />

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Billing Email</h2>
        <p className="text-muted-foreground text-sm">
          Stripe sends invoices and receipts to this address.
        </p>
      </div>
      <BillingEmailForm
        orgId={orgId}
        defaultBillingEmail={subscription.billingEmail}
      />
    </div>
  )
}
