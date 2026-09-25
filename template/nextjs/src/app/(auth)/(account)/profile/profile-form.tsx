'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { updateUser, useSession } from '~/lib/auth-client'
import {
  toastActionError,
  toastErrorMessage,
  toastSuccessMessage
} from '~/lib/toast-message'
import { stringValidation } from '~/lib/validations'

const profileFormSchema = z.object({
  name: stringValidation
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { data: session, isPending, refetch } = useSession()

  if (isPending) {
    return <ProfileFormSkeleton />
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            You are not signed in.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login?callbackUrl=/profile">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <ProfileFormInner user={session.user} onUpdated={refetch} />
}

function ProfileFormInner({
  user,
  onUpdated
}: {
  user: {
    name: string
    email: string
    image?: string | null
    emailVerified?: boolean
    role?: string | null
  }
  onUpdated: () => Promise<void>
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name ?? ''
    }
  })

  const isSubmitting = form.formState.isSubmitting
  const isDirty = form.formState.isDirty

  const initials =
    user.name
      ?.split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'NA'

  async function onSubmit(values: ProfileFormValues) {
    if (values.name.trim() === user.name) return

    try {
      const res = await updateUser({ name: values.name.trim() })
      if (res?.error) throw res.error
      await onUpdated()
      form.reset({ name: values.name.trim() })
      toastSuccessMessage('Profile updated')
    } catch (err) {
      console.error('Failed to update profile:', err)
      if (
        typeof err === 'object' &&
        err &&
        'message' in err &&
        typeof err.message === 'string'
      )
        toastActionError(err)
      else toastErrorMessage('Your profile was not saved. Try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Details from your account. Only your name can change here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-foreground text-lg">
                {initials}
              </AvatarFallback>
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
            </Avatar>
            <div className="space-y-1">
              <p className="text-base font-medium">{user.name}</p>
              <div className="flex flex-wrap items-center gap-2">
                {user.emailVerified ? (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="size-3" />
                    Email verified
                  </Badge>
                ) : null}
                {user.role ? (
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <DetailRow icon={Mail} label="Email" value={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="Your full name"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value
}: {
  icon: React.FC<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          {label}
        </p>
        <p className="text-sm wrap-break-word">{value}</p>
      </div>
    </div>
  )
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32 self-end" />
        </CardContent>
      </Card>
    </div>
  )
}
