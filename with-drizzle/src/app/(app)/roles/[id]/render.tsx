'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Permissions } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import {
  GetRoleFnDataType,
  createRole,
  deleteRole,
  updateRole
} from './actions'

const RoleSchema = z.object({
  name: z.string().min(1),
  permissions: z.array(z.nativeEnum(Permissions))
})

type FormData = z.infer<typeof RoleSchema>

const permissions = Object.values(Permissions).map(x => ({
  label: generateLabel(x),
  value: x
}))

export const Render: FC<{
  role: GetRoleFnDataType | undefined
}> = ({ role }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: role?.name ?? '',
      permissions: role?.permissions.map(p => p.permission) ?? []
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    try {
      if (!role) {
        const newId = await createRole(data)
        router.replace(`/roles/${newId}`)
      } else {
        await updateRole({
          id: role.id,
          ...data
        })
      }
      toast({
        title: 'Role saved'
      })
    } catch (err) {
      toast({
        title: 'Error saving role',
        variant: 'destructive'
      })
    }
    setIsSaving(false)
  }

  return (
    <Shell>
      <Heading heading={role ? role.name : 'New Role'} />
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
            {role ? (
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
                          await deleteRole(role.id)
                          toast({
                            title: 'Role deleted'
                          })
                          router.push('/roles')
                        } catch (err) {
                          toast({
                            title: 'Error deleting role',
                            variant: 'destructive'
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
            {role ? (
              <Link href="/roles/new">
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

          <div></div>

          <FormField
            control={form.control}
            name="permissions"
            render={() => (
              <FormItem>
                <FormLabel className="text-base">Permissions</FormLabel>
                {permissions.map(item => (
                  <FormField
                    key={item.value}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <FormItem
                        key={item.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.value)}
                            onCheckedChange={checked => {
                              return checked
                                ? field.onChange([...field.value, item.value])
                                : field.onChange(
                                    field.value?.filter(
                                      value => value !== item.value
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel>{item.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {role ? (
        <SystemInfo
          items={[
            {
              label: 'Id',
              value: role.id
            },
            {
              label: 'Created At',
              value: formatDateTime(role.createdAt)
            },
            {
              label: 'Updated At',
              value: timesAgo(role.updatedAt)
            }
          ]}
        />
      ) : undefined}
    </Shell>
  )
}
