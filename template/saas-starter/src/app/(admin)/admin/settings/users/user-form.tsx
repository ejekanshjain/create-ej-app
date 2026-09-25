'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import { createUser, updateUser } from '../../../actions/users'
import { baseUserFormSchema, type UserRole } from './validation'

type UserFormValues = z.infer<typeof baseUserFormSchema>

type UserFormProps = {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    name: string
    email: string
    role: string | null
  }
}

export function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(baseUserFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      role: (initialData?.role as UserRole) ?? 'user'
    }
  })

  const mutationOptions = {
    onSuccess: () => {
      toastSuccessMessage(mode === 'create' ? 'User created' : 'User updated')
      router.push('/admin/settings/users')
    },
    onError: (error: Error) =>
      toastActionError(error, 'The user was not saved. Try again.')
  }
  const create = useSafeActionMutation(createUser, mutationOptions)
  const update = useSafeActionMutation(updateUser, mutationOptions)
  const isPending = create.isPending || update.isPending

  const onSubmit = (values: UserFormValues) => {
    if (mode === 'edit' && initialData) {
      update.mutate({ id: initialData.id, ...values })
    } else {
      create.mutate(values)
    }
  }

  const errors = form.formState.errors
  const role = useWatch({ control: form.control, name: 'role' })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldContent>
            <Input
              {...form.register('name')}
              placeholder="Full name"
              aria-invalid={!!errors.name}
            />
            <FieldError errors={errors.name ? [errors.name] : []} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldContent>
            <Input
              {...form.register('email')}
              type="email"
              placeholder="email@example.com"
              aria-invalid={!!errors.email}
            />
            <FieldError errors={errors.email ? [errors.email] : []} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Role</FieldLabel>
          <FieldContent>
            <Select
              value={role}
              onValueChange={value => form.setValue('role', value as UserRole)}
            >
              <SelectTrigger aria-invalid={!!errors.role} className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={errors.role ? [errors.role] : []} />
          </FieldContent>
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/settings/users')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {mode === 'create' ? 'Create User' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
