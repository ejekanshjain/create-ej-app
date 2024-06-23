'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { SystemInfo } from '@/components/system-info'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { User } from '@/db/schema'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import { InferSelectModel } from 'drizzle-orm'
import { createUserAction, deleteUserAction, updateUserAction } from './actions'
import { UserCreateUpdateSchema, UserTypeEnumArr } from './validation'

type FormData = z.infer<typeof UserCreateUpdateSchema>

const types = UserTypeEnumArr.map(x => ({
  label: generateLabel(x),
  value: x
}))

export const Render: FC<{
  user?: {
    id: string
    name?: string | null
    email: string
    type: InferSelectModel<typeof User>['type']
    roleId?: string | null
    createdAt: Date
    updatedAt?: Date | null
  } | null
  roles: {
    id: string
    name: string
  }[]
}> = ({ user, roles }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(UserCreateUpdateSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      type: user?.type ?? 'Normal',
      roleId: user?.roleId
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    try {
      if (!user) {
        const res = await createUserAction(data)
        if (!res?.data?.success)
          throw new Error(res?.serverError || 'No success returned from server')
        if (!res?.data?.id) throw new Error('No id returned from server')
        router.replace(`/users/${res.data.id}`)
      } else {
        const res = await updateUserAction({
          id: user.id,
          ...data
        })
        if (!res?.data?.success)
          throw new Error(res?.serverError || 'No success returned from server')
      }
      toast('User saved')
    } catch (err) {
      toast('Error saving user', {
        description: (err as any).message || undefined
      })
    }
    setIsSaving(false)
  }

  return (
    <Shell>
      <Heading
        heading={user ? user.name || user.email || user.id : 'New User'}
      />
      <Form {...form}>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="col-span-1 mb-1 grid grid-cols-2 gap-2 sm:flex md:col-span-2">
            <Button type="button" onClick={() => router.back()} variant="ghost">
              <Icons.chevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={isSaving || isDeleting}>
              {isSaving ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.save className="mr-2 h-4 w-4" />
              )}
              <span>Save</span>
            </Button>
            {user ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSaving || isDeleting}
                  >
                    {isDeleting ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.delete className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setIsDeleting(true)
                        try {
                          const res = await deleteUserAction(user.id)
                          if (!res?.data?.success)
                            throw new Error(
                              res?.serverError ||
                                'No success returned from server'
                            )
                          toast('User deleted')
                          router.replace('/users')
                        } catch (err) {
                          toast('Error deleting user', {
                            description:
                              (err as any).message || 'Something went wrong'
                          })
                        }
                        setIsDeleting(false)
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : undefined}
            {user ? (
              <Link href="/users/new">
                <Button
                  type="button"
                  disabled={isSaving || isDeleting}
                  variant="secondary"
                  className="w-full"
                >
                  <Icons.add className="mr-2 h-4 w-4" />
                  New
                </Button>
              </Link>
            ) : undefined}
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter a name"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter an email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSaving}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.getValues('type') === 'Normal' ? (
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    disabled={isSaving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : undefined}
        </form>
      </Form>
      {user ? (
        <SystemInfo
          items={[
            {
              label: 'Id',
              value: user.id
            },
            {
              label: 'Created At',
              value: formatDateTime(user.createdAt)
            },
            {
              label: 'Updated At',
              value: user.updatedAt ? timesAgo(user.updatedAt) : '-'
            }
          ]}
        />
      ) : undefined}
    </Shell>
  )
}
