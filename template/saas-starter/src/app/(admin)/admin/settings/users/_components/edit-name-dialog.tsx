'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { admin } from '~/lib/auth-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { stringValidation } from '~/lib/validations'

const schema = z.object({
  name: stringValidation
})

type Form = z.infer<typeof schema>

interface EditNameDialogProps {
  userId: string
  currentName: string
  children: React.ReactNode
}

export function EditNameDialog({
  userId,
  currentName,
  children
}: EditNameDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName }
  })

  useEffect(() => {
    if (open) reset({ name: currentName })
  }, [open, currentName, reset])

  async function onSubmit(values: Form) {
    const { error } = await admin.updateUser({
      userId,
      data: { name: values.name }
    })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to update name')
      return
    }

    toastSuccessMessage('Name updated')
    setOpen(false)
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit name</DialogTitle>
          <DialogDescription>
            Update the user&apos;s display name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <Field orientation="vertical">
            <FieldContent>
              <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
                Name
              </FieldTitle>
              <Input
                autoFocus
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              <FieldError
                errors={[errors.name]}
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
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
