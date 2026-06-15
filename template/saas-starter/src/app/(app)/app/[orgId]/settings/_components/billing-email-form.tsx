'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateBillingEmailAction } from '~/app/(app)/actions/billing'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { emailValidation } from '~/lib/validations'

const schema = z.object({
  billingEmail: emailValidation
})

type Form = z.infer<typeof schema>

export function BillingEmailForm({
  orgId,
  defaultBillingEmail
}: {
  orgId: string
  defaultBillingEmail: string | null
}) {
  const router = useRouter()
  const { mutateAsync: updateBillingEmail } = useSafeActionMutation(
    updateBillingEmailAction
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { billingEmail: defaultBillingEmail ?? '' }
  })

  async function onSubmit(values: Form) {
    try {
      await updateBillingEmail({
        organizationId: orgId,
        billingEmail: values.billingEmail
      })
      reset({ billingEmail: values.billingEmail })
      toastSuccessMessage('Billing email updated')
      router.refresh()
    } catch (error) {
      toastErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update billing email'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field orientation="vertical">
        <FieldContent>
          <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
            Billing email
          </FieldTitle>
          <Input
            type="email"
            placeholder="billing@company.com"
            {...register('billingEmail')}
            aria-invalid={!!errors.billingEmail}
          />
          <FieldDescription className="mt-1.5 text-[13px]">
            Invoices and receipts are sent here. Required before purchasing a
            plan.
          </FieldDescription>
          <FieldError
            errors={[errors.billingEmail]}
            className="mt-1.5 text-[13px]"
          />
        </FieldContent>
      </Field>

      <div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save billing email
        </Button>
      </div>
    </form>
  )
}
