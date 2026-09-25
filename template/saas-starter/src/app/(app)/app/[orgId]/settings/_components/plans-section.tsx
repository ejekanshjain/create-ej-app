'use client'

import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  createCheckoutSessionAction,
  createPortalSessionAction
} from '~/app/(app)/actions/billing'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { TRIAL_DAYS } from '~/lib/constants'
import { formatCurrency } from '~/lib/format-currency'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastActionError } from '~/lib/toast-message'

type Interval = 'monthly' | 'annual'
type PaidPlanId = 'pro' | 'ultimate'

type PlanPrice = { amount: number; currency: string }

/** Public plan data from `getBillingOverview`. */
type PlanView = {
  id: 'free' | PaidPlanId
  name: string
  maxMembers: number
  canUseTrial: boolean
  prices: { monthly: PlanPrice; annual: PlanPrice } | null
}

const annualSavingsPercent = (monthly: number, annual: number) => {
  const fullYear = monthly * 12
  if (fullYear <= 0) return 0
  return Math.round(((fullYear - annual) / fullYear) * 100)
}

export function PlansSection({
  orgId,
  plans,
  currentPlanId,
  hasActiveSub,
  hasBillingEmail,
  canStartTrial
}: {
  orgId: string
  plans: PlanView[]
  currentPlanId: PlanView['id']
  /** A Stripe subscription still exists, so changes go through the portal. */
  hasActiveSub: boolean
  hasBillingEmail: boolean
  canStartTrial: boolean
}) {
  const [interval, setInterval] = useState<Interval>('monthly')
  const [pending, setPending] = useState<string | null>(null)

  // Stripe hosts both pages, so success is a full-page redirect.
  const redirectOptions = {
    onSuccess: (data: { url: string } | undefined) => {
      if (data?.url) window.location.assign(data.url)
    },
    onError: (error: Error) => {
      toastActionError(error, 'Stripe did not open. Try again.')
      setPending(null)
    }
  }
  const checkout = useSafeActionMutation(
    createCheckoutSessionAction,
    redirectOptions
  )
  const portal = useSafeActionMutation(
    createPortalSessionAction,
    redirectOptions
  )

  function goToPortal(key: string) {
    setPending(key)
    portal.mutate({ organizationId: orgId })
  }

  function goToCheckout(plan: PaidPlanId, withTrial: boolean) {
    setPending(plan)
    checkout.mutate({ organizationId: orgId, plan, interval, withTrial })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        {hasActiveSub ? (
          <Button
            variant="outline"
            onClick={() => goToPortal('manage')}
            disabled={pending !== null}
          >
            {pending === 'manage' && <Loader2 className="animate-spin" />}
            Manage Billing
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <Label htmlFor="interval-toggle">Monthly</Label>
          <Switch
            id="interval-toggle"
            checked={interval === 'annual'}
            onCheckedChange={checked =>
              setInterval(checked ? 'annual' : 'monthly')
            }
          />
          <Label htmlFor="interval-toggle">Annual</Label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId
          const price = plan.prices?.[interval]
          const savings =
            plan.prices && interval === 'annual'
              ? annualSavingsPercent(
                  plan.prices.monthly.amount,
                  plan.prices.annual.amount
                )
              : 0

          const paidPlanId = plan.id === 'free' ? null : plan.id
          const offerTrial = plan.canUseTrial && canStartTrial
          const isPending = pending === plan.id

          const onClick = isCurrent
            ? undefined
            : hasActiveSub
              ? () => goToPortal(plan.id)
              : paidPlanId
                ? () => goToCheckout(paidPlanId, offerTrial)
                : undefined

          const label = isCurrent
            ? 'Current Plan'
            : hasActiveSub
              ? paidPlanId
                ? `Switch to ${plan.name}`
                : 'Cancel Plan'
              : paidPlanId
                ? offerTrial
                  ? `Start ${TRIAL_DAYS}-Day Free Trial`
                  : `Upgrade to ${plan.name}`
                : 'Current Plan'

          const needsBillingEmail =
            !hasActiveSub && paidPlanId !== null && !hasBillingEmail

          return (
            <Card key={plan.id} className={isCurrent ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardDescription>
                  Up to {plan.maxMembers}{' '}
                  {plan.maxMembers === 1 ? 'member' : 'members'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight">
                    {formatCurrency(
                      price?.currency ?? 'USD',
                      (price?.amount ?? 0) / 100
                    )}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{interval === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                {savings > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Save {savings}% compared with monthly
                  </p>
                )}
                {plan.canUseTrial && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <Check className="size-3.5" /> {TRIAL_DAYS}-day free trial,
                    card required
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-1.5">
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || needsBillingEmail || pending !== null}
                  onClick={onClick}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {label}
                </Button>
                {needsBillingEmail && (
                  <p className="text-muted-foreground text-center text-xs">
                    Add a billing email below first
                  </p>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
