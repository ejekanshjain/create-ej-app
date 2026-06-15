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
import { formatCurrency } from '~/lib/format-currency'
import { Plan } from '~/lib/plans'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastErrorMessage } from '~/lib/toast-message'

type Interval = 'monthly' | 'annual'

const ACTIVE_STATUSES = ['trialing', 'active', 'past_due']

const annualSavingsPercent = (monthly: number, annual: number) => {
  const fullYear = monthly * 12
  if (fullYear <= 0) return 0
  return Math.round(((fullYear - annual) / fullYear) * 100)
}

export function PlansSection({
  orgId,
  plans,
  currentPlanId,
  currentStatus,
  hasBillingEmail,
  canStartTrial
}: {
  orgId: string
  plans: Plan[]
  currentPlanId: 'free' | 'pro' | 'ultimate'
  currentStatus: string
  hasBillingEmail: boolean
  canStartTrial: boolean
}) {
  const [interval, setInterval] = useState<Interval>('monthly')
  const [pending, setPending] = useState<string | null>(null)

  const hasActiveSub = ACTIVE_STATUSES.includes(currentStatus)

  const { mutateAsync: createCheckout } = useSafeActionMutation(
    createCheckoutSessionAction
  )
  const { mutateAsync: createPortal } = useSafeActionMutation(
    createPortalSessionAction
  )

  async function goToPortal(key: string) {
    setPending(key)
    try {
      const result = await createPortal({ organizationId: orgId })
      if (result?.url) window.location.assign(result.url)
    } catch (error) {
      toastErrorMessage(
        error instanceof Error ? error.message : 'Failed to open billing portal'
      )
      setPending(null)
    }
  }

  async function goToCheckout(plan: 'pro' | 'ultimate', withTrial: boolean) {
    setPending(plan)
    try {
      const result = await createCheckout({
        organizationId: orgId,
        plan,
        interval,
        withTrial
      })
      if (result?.url) window.location.assign(result.url)
    } catch (error) {
      toastErrorMessage(
        error instanceof Error ? error.message : 'Failed to start checkout'
      )
      setPending(null)
    }
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
            {pending === 'manage' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Manage billing
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <Label htmlFor="interval-toggle" className="text-[13px]">
            Monthly
          </Label>
          <Switch
            id="interval-toggle"
            checked={interval === 'annual'}
            onCheckedChange={checked =>
              setInterval(checked ? 'annual' : 'monthly')
            }
          />
          <Label htmlFor="interval-toggle" className="text-[13px]">
            Annual
          </Label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId
          const price = plan.stripePrice?.[interval]
          const savings =
            plan.stripePrice && interval === 'annual'
              ? annualSavingsPercent(
                  plan.stripePrice.monthly.amount,
                  plan.stripePrice.annual.amount
                )
              : 0

          const isPaid = plan.id !== 'free'
          const offerTrial = Boolean(plan.canUseTrial) && canStartTrial
          const isPending = pending === plan.id

          const onClick = isCurrent
            ? undefined
            : hasActiveSub
              ? () => goToPortal(plan.id)
              : isPaid
                ? () => goToCheckout(plan.id as 'pro' | 'ultimate', offerTrial)
                : undefined

          const label = isCurrent
            ? 'Current plan'
            : hasActiveSub
              ? plan.id === 'free'
                ? 'Cancel plan'
                : `Switch to ${plan.name}`
              : isPaid
                ? offerTrial
                  ? 'Start 7-day free trial'
                  : `Upgrade to ${plan.name}`
                : 'Current plan'

          const needsBillingEmail = !hasActiveSub && isPaid && !hasBillingEmail

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
                    {price
                      ? formatCurrency(price.currency, price.amount / 100)
                      : '$0'}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{interval === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                {savings > 0 && (
                  <p className="text-muted-foreground text-[13px]">
                    Save {savings}% vs monthly
                  </p>
                )}
                {plan.canUseTrial && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
                    <Check className="size-3.5" /> 7-day free trial, card
                    required
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-1.5">
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={
                    isCurrent ||
                    needsBillingEmail ||
                    (pending !== null && !isPending)
                  }
                  onClick={onClick}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {label}
                </Button>
                {needsBillingEmail && (
                  <p className="text-muted-foreground text-center text-[12px]">
                    Set a billing email first
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
