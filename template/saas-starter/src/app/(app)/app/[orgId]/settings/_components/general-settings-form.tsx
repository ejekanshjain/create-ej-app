'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateOrganizationLogoAction } from '~/app/(app)/actions/organization'
import { FileUpload } from '~/components/file-upload'
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
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { stringValidation } from '~/lib/validations'

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

export function GeneralSettingsForm({
  orgId,
  defaultName,
  defaultSlug,
  currentLogoUrl,
  currentLogoKey
}: {
  orgId: string
  defaultName: string
  defaultSlug: string
  currentLogoUrl: string | null
  currentLogoKey: string | null
}) {
  const router = useRouter()
  const [logo, setLogo] = useState<string | null>(currentLogoKey)
  const [submitting, setSubmitting] = useState(false)
  const { mutateAsync: updateOrgLogo } = useSafeActionMutation(
    updateOrganizationLogoAction
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, slug: defaultSlug }
  })

  const logoChanged = logo !== currentLogoKey

  async function onSubmit(values: Form) {
    setSubmitting(true)

    const { error } = await organization.update({
      organizationId: orgId,
      data: {
        name: values.name,
        slug: values.slug,
        logo: logo ?? undefined
      }
    })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to update organization')
      setSubmitting(false)
      return
    }

    if (logoChanged && logo) {
      await updateOrgLogo({
        organizationId: orgId,
        key: logo,
        oldKey: currentLogoKey
      })
    }

    toastSuccessMessage('Organization updated')
    setSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field orientation="vertical">
        <FieldContent>
          <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
            Organization name
          </FieldTitle>
          <Input {...register('name')} aria-invalid={!!errors.name} />
          <FieldError errors={[errors.name]} className="mt-1.5 text-[13px]" />
        </FieldContent>
      </Field>

      <Field orientation="vertical">
        <FieldContent>
          <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
            Slug
          </FieldTitle>
          <Input {...register('slug')} aria-invalid={!!errors.slug} />
          <FieldDescription className="mt-1.5 text-[13px]">
            A unique identifier used in links.
          </FieldDescription>
          <FieldError errors={[errors.slug]} className="mt-1.5 text-[13px]" />
        </FieldContent>
      </Field>

      <Field orientation="vertical">
        <FieldContent>
          <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
            Logo
          </FieldTitle>
          <div className="w-32">
            <FileUpload
              organizationId={orgId}
              accept="image/*"
              onClientUploadFinish={setLogo}
              currentUrl={currentLogoUrl}
              sizes="128px"
            />
          </div>
        </FieldContent>
      </Field>

      <div>
        <Button
          type="submit"
          disabled={submitting || (!isDirty && !logoChanged)}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
