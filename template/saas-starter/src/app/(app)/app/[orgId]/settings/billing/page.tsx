import { CreditCard } from 'lucide-react'
import { redirect } from 'next/navigation'
import { PageHeading } from '~/components/page-heading'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { canManageOrganization } from '~/lib/app-navigation'
import { formatDate } from '~/lib/format-date'
import { getUserMembershipCached } from '~/lib/organization-access'
import { getOrganizationPlanCached } from '~/lib/organization-plan-limits'
import { PLANS } from '~/lib/plans'
import { BillingEmailForm } from '../_components/billing-email-form'
import { PlansSection } from '../_components/plans-section'

const STATUS_LABELS: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  free: { label: 'Free', variant: 'secondary' },
  trialing: { label: 'Trialing', variant: 'default' },
  active: { label: 'Active', variant: 'default' },
  past_due: { label: 'Past due', variant: 'destructive' },
  canceled: { label: 'Canceled', variant: 'outline' },
  unpaid: { label: 'Unpaid', variant: 'destructive' },
  paused: { label: 'Paused', variant: 'outline' },
  incomplete: { label: 'Incomplete', variant: 'outline' },
  incomplete_expired: { label: 'Incomplete', variant: 'outline' }
}

export default async function Page({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  const membership = await getUserMembershipCached(orgId)
  if (!membership || !canManageOrganization(membership.role)) {
    return redirect(`/app/${orgId}/dashboard`)
  }

  const { plan, sub } = await getOrganizationPlanCached(orgId)

  const status = STATUS_LABELS[sub.status] ?? {
    label: sub.status,
    variant: 'outline' as const
  }
  const canStartTrial = sub.status === 'free' && !sub.hasUsedTrial
  const trialEndsAt = formatDate(sub.trialEndsAt)
  const renewsAt = formatDate(sub.currentPeriodEnd)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeading
        title="Billing"
        description="Manage your organization's plan and billing details."
        icon={CreditCard}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Current plan:</span>
          <span className="text-sm">{plan.name}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {sub.status === 'trialing' && trialEndsAt && (
          <p className="text-muted-foreground text-[13px]">
            Trial ends on {trialEndsAt}. Your card will be charged then unless
            you cancel.
          </p>
        )}
        {sub.status === 'active' && renewsAt && (
          <p className="text-muted-foreground text-[13px]">
            {sub.cancelAtPeriodEnd
              ? `Access ends on ${renewsAt}.`
              : `Renews on ${renewsAt}.`}
          </p>
        )}
        {sub.status === 'past_due' && (
          <p className="text-destructive text-[13px]">
            Your last payment failed. Update your payment method to keep access.
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Plans</h2>
        <p className="text-muted-foreground text-sm">
          Choose the plan that fits your organization.
        </p>
      </div>
      <PlansSection
        orgId={orgId}
        plans={PLANS}
        currentPlanId={plan.id}
        currentStatus={sub.status}
        hasBillingEmail={Boolean(sub.billingEmail)}
        canStartTrial={canStartTrial}
      />

      <Separator />

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Billing email</h2>
        <p className="text-muted-foreground text-sm">
          Where invoices and receipts are sent.
        </p>
      </div>
      <BillingEmailForm orgId={orgId} defaultBillingEmail={sub.billingEmail} />
    </div>
  )
}
