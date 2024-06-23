'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { InferSelectModel } from 'drizzle-orm'
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
import { Task } from '@/db/schema'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import { createTaskAction, deleteTaskAction, updateTaskAction } from './actions'
import { TaskCreateUpdateSchema, TaskStatusEnumArr } from './validation'

type FormData = z.infer<typeof TaskCreateUpdateSchema>

const statuses = TaskStatusEnumArr.map(x => ({
  label: generateLabel(x),
  value: x
}))

export const Render: FC<{
  task?: {
    id: string
    title: string
    description?: string | null
    status: InferSelectModel<typeof Task>['status']
    createdAt: Date
    updatedAt?: Date | null
    createdBy: {
      id: string
      name?: string | null
    }
    updatedBy?: {
      id: string
      name?: string | null
    } | null
  } | null
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}> = ({ task, canCreate, canUpdate, canDelete }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(TaskCreateUpdateSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description,
      status: task?.status
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    try {
      if (!task) {
        const res = await createTaskAction(data)
        if (!res?.data?.success)
          throw new Error(res?.serverError || 'No success returned from server')
        if (!res?.data?.id) throw new Error('No id returned from server')
        router.replace(`/tasks/${res.data.id}`)
      } else {
        const res = await updateTaskAction({
          id: task.id,
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
      <Heading heading={task ? task.title : 'New Task'} />
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
            {(task ? canUpdate : canCreate) ? (
              <Button type="submit" disabled={isSaving || isDeleting}>
                {isSaving ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.save className="mr-2 h-4 w-4" />
                )}
                <span>Save</span>
              </Button>
            ) : undefined}
            {task && canDelete ? (
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
                          const res = await deleteTaskAction(task.id)
                          if (!res?.data?.success)
                            throw new Error(
                              res?.serverError ||
                                'No success returned from server'
                            )
                          toast('Task deleted')
                          router.replace('/tasks')
                        } catch (err) {
                          toast('Error deleting task', {
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
            {task && canCreate ? (
              <Link href="/tasks/new">
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter a title"
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSaving}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map(({ label, value }) => (
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
        </form>
      </Form>
      {task ? (
        <SystemInfo
          items={[
            {
              label: 'Id',
              value: task.id
            },
            {
              label: 'Created At',
              value: formatDateTime(task.createdAt)
            },
            {
              label: 'Updated At',
              value: task.updatedAt ? timesAgo(task.updatedAt) : '-'
            },
            {
              label: 'Created By',
              value: (
                <Link
                  href={`/users/${task.createdBy.id}`}
                  className="underline underline-offset-4 transition-all hover:text-foreground"
                >
                  {task.createdBy.name ?? 'Unknown'}
                </Link>
              )
            },
            {
              label: 'Updated By',
              value: task.updatedBy ? (
                <Link
                  href={`/users/${task.updatedBy.id}`}
                  className="underline underline-offset-4 transition-all hover:text-foreground"
                >
                  {task.updatedBy.name ?? 'Unknown'}
                </Link>
              ) : (
                '-'
              )
            }
          ]}
        />
      ) : undefined}
    </Shell>
  )
}
