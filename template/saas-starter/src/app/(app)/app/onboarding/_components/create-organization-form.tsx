'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { organizationDetailsSchema } from '~/app/(app)/actions/organizations.validation'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { organization } from '~/lib/auth-client'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import { slugifyName } from '~/lib/validations'

type Form = z.infer<typeof organizationDetailsSchema>

export function CreateOrganizationForm() {
  const router = useRouter()
  const [slugEdited, setSlugEdited] = useState(false)

  const form = useForm<Form>({
    resolver: zodResolver(organizationDetailsSchema),
    defaultValues: { name: '', slug: '' }
  })

  async function onSubmit(values: Form) {
    const { data, error } = await organization.create(values)

    if (error || !data) {
      toastActionError(error, 'The organization was not created. Try again.')
      return
    }

    toastSuccessMessage(`${data.name} created`)
    router.push(`/app/${data.id}/dashboard`)
    // Re-render the app layout so the sidebar lists the new organization.
    router.refresh()
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Organization name</FieldLabel>
            <Input
              id={field.name}
              autoFocus
              placeholder="Acme Inc."
              aria-invalid={fieldState.invalid}
              {...field}
              onChange={event => {
                field.onChange(event)
                if (!slugEdited) {
                  form.setValue('slug', slugifyName(event.target.value), {
                    shouldValidate: form.formState.isSubmitted
                  })
                }
              }}
            />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="slug"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
            <Input
              id={field.name}
              placeholder="acme-inc"
              aria-invalid={fieldState.invalid}
              {...field}
              onChange={event => {
                setSlugEdited(true)
                field.onChange(event)
              }}
            />
            <FieldDescription>
              Identifies the organization in links. Use lowercase letters,
              numbers, and hyphens.
            </FieldDescription>
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Create Organization
        </Button>
      </div>
    </form>
  )
}
