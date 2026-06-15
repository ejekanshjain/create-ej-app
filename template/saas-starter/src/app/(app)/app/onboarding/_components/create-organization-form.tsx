'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { organization } from '~/lib/auth-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { stringValidation } from '~/lib/validations'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const schema = z.object({
  name: stringValidation,
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers and hyphens only'
    )
})

type Form = z.infer<typeof schema>

export function CreateOrganizationForm() {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '' }
  })

  const [slugEdited, setSlugEdited] = useState(false)

  async function onSubmit(values: Form) {
    setSubmitting(true)

    const { data, error } = await organization.create({
      name: values.name,
      slug: values.slug
    })

    if (error || !data) {
      toastErrorMessage(error?.message ?? 'Failed to create organization')
      setSubmitting(false)
      return
    }

    toastSuccessMessage(`${data.name} created`)
    window.location.assign(`/app/${data.id}/dashboard`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field orientation="vertical">
        <FieldContent>
          <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
            Organization name
          </FieldTitle>
          <Input
            autoFocus
            placeholder="Acme Inc."
            {...register('name', {
              onChange: e => {
                if (!slugEdited) {
                  setValue('slug', slugify(e.target.value), {
                    shouldValidate: true
                  })
                }
              }
            })}
            aria-invalid={!!errors.name}
          />
          <FieldError errors={[errors.name]} className="mt-1.5 text-[13px]" />
        </FieldContent>
      </Field>

      <Field orientation="vertical">
        <FieldContent>
          <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
            Slug
          </FieldTitle>
          <Input
            placeholder="acme-inc"
            {...register('slug', {
              onChange: () => setSlugEdited(true)
            })}
            aria-invalid={!!errors.slug}
          />
          <FieldDescription className="mt-1.5 text-[13px]">
            A unique identifier used in links. Lowercase letters, numbers and
            hyphens.
          </FieldDescription>
          <FieldError errors={[errors.slug]} className="mt-1.5 text-[13px]" />
        </FieldContent>
      </Field>

      <div>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create organization
        </Button>
      </div>
    </form>
  )
}
