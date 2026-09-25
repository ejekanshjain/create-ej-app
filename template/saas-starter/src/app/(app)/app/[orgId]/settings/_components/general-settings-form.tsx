'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateOrganizationAction } from '~/app/(app)/actions/organizations'
import { organizationDetailsSchema } from '~/app/(app)/actions/organizations.validation'
import { FileUpload } from '~/components/file-upload'
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

type Form = z.infer<typeof organizationDetailsSchema>

export function GeneralSettingsForm({
  orgId,
  defaultName,
  defaultSlug,
  currentLogoKey,
  currentLogoUrl
}: {
  orgId: string
  defaultName: string
  defaultSlug: string
  /** Stored logo value, sent back unchanged when you keep the logo. */
  currentLogoKey: string | null
  /** Renderable URL for the stored logo, from `resolveImageUrl`. */
  currentLogoUrl: string | null
}) {
  const router = useRouter()
  const [logo, setLogo] = useState<string | null>(currentLogoKey)

  const form = useForm<Form>({
    resolver: zodResolver(organizationDetailsSchema),
    defaultValues: { name: defaultName, slug: defaultSlug }
  })

  const save = useSafeActionMutation(updateOrganizationAction, {
    onSuccess: (_, values) => {
      toastSuccessMessage('Organization updated')
      form.reset({ name: values.name, slug: values.slug })
      router.refresh()
    },
    onError: error =>
      toastActionError(error, 'Your changes were not saved. Try again.')
  })

  const logoChanged = logo !== currentLogoKey

  return (
    <form
      onSubmit={form.handleSubmit(values =>
        save.mutate({ ...values, organizationId: orgId, logo: logo ?? '' })
      )}
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
              aria-invalid={fieldState.invalid}
              {...field}
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
              aria-invalid={fieldState.invalid}
              {...field}
            />
            <FieldDescription>
              Identifies the organization in links.
            </FieldDescription>
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />

      <Field>
        <FieldLabel>Logo</FieldLabel>
        <div className="w-32">
          <FileUpload
            organizationId={orgId}
            accept="image/*"
            onClientUploadFinish={setLogo}
            currentUrl={currentLogoUrl}
            sizes="128px"
          />
        </div>
      </Field>

      <div>
        <Button
          type="submit"
          disabled={save.isPending || (!form.formState.isDirty && !logoChanged)}
        >
          {save.isPending && <Loader2 className="animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
