'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldError,
  FieldTitle
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { organization } from '~/lib/auth-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { emailValidation } from '~/lib/validations'
import { useOrganizationContext } from '../../../../_components/organization-context'

const schema = z.object({
  email: emailValidation,
  role: z.enum(['admin', 'member'])
})

type Form = z.infer<typeof schema>

export function InviteMemberDialog({
  onInvited,
  children
}: {
  onInvited?: () => void
  children: React.ReactNode
}) {
  const { id: orgId } = useOrganizationContext()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'member' }
  })

  useEffect(() => {
    if (open) reset({ email: '', role: 'member' })
  }, [open, reset])

  async function onSubmit(values: Form) {
    const { error } = await organization.inviteMember({
      organizationId: orgId,
      email: values.email,
      role: values.role
    })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to send invitation')
      return
    }

    toastSuccessMessage(`Invitation sent to ${values.email}`)
    setOpen(false)
    onInvited?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Send an email invitation to join this organization. They&apos;ll
            need to sign in with this email to accept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <Field orientation="vertical">
            <FieldContent>
              <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
                Email address
              </FieldTitle>
              <Input
                type="email"
                placeholder="teammate@example.com"
                autoComplete="off"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              <FieldError
                errors={[errors.email]}
                className="mt-1.5 text-[13px]"
              />
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldContent>
              <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
                Role
              </FieldTitle>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        Admin - manage members & settings
                      </SelectItem>
                      <SelectItem value="member">
                        Member - standard access
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                errors={[errors.role]}
                className="mt-1.5 text-[13px]"
              />
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
