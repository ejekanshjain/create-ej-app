'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
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
import { admin } from '~/lib/auth-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { emailValidation, stringValidation } from '~/lib/validations'

const schema = z.object({
  name: stringValidation,
  email: emailValidation,
  role: z.enum(['user', 'admin', 'superadmin'])
})

type Form = z.infer<typeof schema>

interface CreateUserDialogProps {
  children: React.ReactNode
}

export function CreateUserDialog({ children }: CreateUserDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'user' }
  })

  useEffect(() => {
    if (open) reset({ name: '', email: '', role: 'user' })
  }, [open, reset])

  async function onSubmit(values: Form) {
    const { error } = await admin.createUser({
      name: values.name,
      email: values.email,
      role: values.role as any,
      data: {}
    })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to create user')
      return
    }

    toastSuccessMessage(`Account created for ${values.email}`)
    setOpen(false)
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Create a new account. The user will sign in via magic link.
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
                placeholder="Jane Doe"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              <FieldError
                errors={[errors.name]}
                className="mt-1.5 text-[13px]"
              />
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldContent>
              <FieldTitle className="text-foreground mb-1.5 text-[13px] font-semibold">
                Email
              </FieldTitle>
              <Input
                type="email"
                placeholder="jane@example.com"
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
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
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
              Create account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
