'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateBillingEmailAction } from '~/app/(app)/actions/billing'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
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

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { billingEmail: defaultBillingEmail ?? '' }
  })

  const save = useSafeActionMutation(updateBillingEmailAction, {
    onSuccess: (_, values) => {
      form.reset({ billingEmail: values.billingEmail })
      toastSuccessMessage('Billing email updated')
      router.refresh()
    },
    onError: error =>
      toastActionError(error, 'The billing email was not saved. Try again.')
  })

  return (
    <form
      onSubmit={form.handleSubmit(values =>
        save.mutate({ organizationId: orgId, ...values })
      )}
      className="flex flex-col gap-6"
    >
      <Controller
        control={form.control}
        name="billingEmail"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Billing email</FieldLabel>
            <Input
              id={field.name}
              type="email"
              placeholder="billing@example.com"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            <FieldDescription>
              Required before you choose a paid plan.
            </FieldDescription>
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />

      <div>
        <Button
          type="submit"
          disabled={save.isPending || !form.formState.isDirty}
        >
          {save.isPending && <Loader2 className="animate-spin" />}
          Save Billing Email
        </Button>
      </div>
    </form>
  )
}
