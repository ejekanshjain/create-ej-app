'use client'

import EditorJS from '@editorjs/editorjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { InferSelectModel } from 'drizzle-orm'
import edjsHTML from 'editorjs-html'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import {
  createTaskAction,
  deleteTaskAction,
  getTaskImageUploadPresignedUrlAction,
  markTaskImageUploadedAction,
  updateTaskAction
} from './actions'
import { TaskCreateUpdateSchema, TaskStatusEnumArr } from './validation'

type FormData = z.infer<typeof TaskCreateUpdateSchema>

const statuses = TaskStatusEnumArr.map(x => ({
  label: generateLabel(x),
  value: x
}))

const edjsParser = edjsHTML()

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
      status: task?.status
    }
  })
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditorMounted, setIsMounted] = useState<boolean>(false)

  const editorRef = useRef<EditorJS>()

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default

    // @ts-ignore
    const Header = (await import('@editorjs/header')).default

    // @ts-ignore
    const List = (await import('@editorjs/list')).default

    // @ts-ignore
    const NestedList = (await import('@editorjs/nested-list')).default

    // @ts-ignore
    const CheckList = (await import('@editorjs/checklist')).default

    // @ts-ignore
    const Table = (await import('@editorjs/table')).default

    // @ts-ignore
    const Quote = (await import('@editorjs/quote')).default

    // @ts-ignore
    const Delimiter = (await import('@editorjs/delimiter')).default

    // @ts-ignore
    const InlineCode = (await import('@editorjs/inline-code')).default

    // @ts-ignore
    const Code = (await import('@editorjs/code')).default

    // @ts-ignore
    const Image = (await import('@editorjs/image')).default

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          editorRef.current = editor
        },
        placeholder: 'Type here to write...',
        inlineToolbar: true,
        data: task?.description ? JSON.parse(task.description) : undefined,
        tools: {
          header: Header,
          list: List,
          nestedList: NestedList,
          checklist: CheckList,
          table: Table,
          quote: Quote,
          delimiter: Delimiter,
          inlineCode: InlineCode,
          code: Code,
          image: {
            class: Image,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const res = await getTaskImageUploadPresignedUrlAction({
                      filename: file.name,
                      contentType: file.type
                    })
                    if (res?.data) {
                      const formData = new FormData()

                      for (const [key, value] of Object.entries(
                        res.data.presigned.fields
                      )) {
                        formData.append(key, value)
                      }

                      formData.append('file', file)

                      const response = await fetch(res.data.presigned.url, {
                        method: 'POST',
                        body: formData
                      })

                      if (!response.ok)
                        throw new Error('Failed to upload image to s3')

                      const res2 = await markTaskImageUploadedAction(
                        res.data.id
                      )

                      if (!res2?.data?.success)
                        throw new Error('Failed to mark image uploaded')

                      return {
                        success: true,
                        file: {
                          id: res.data.id,
                          url: res.data.url
                        }
                      }
                    }
                    throw new Error('No success returned from server')
                  } catch (err) {
                    return {
                      success: false
                    }
                  }
                }
              }
            }
          }
        }
      })
    }
  }, [task?.description])

  useEffect(() => {
    if (typeof window !== 'undefined') setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isEditorMounted) return

    initializeEditor()

    return () => {
      editorRef.current?.destroy()
      editorRef.current = undefined
    }
  }, [isEditorMounted, initializeEditor])

  const editorHTML = useMemo(() => {
    if (!task?.description) return ''
    return edjsParser.parse(JSON.parse(task.description)).join('')
  }, [task?.description])
  console.log(editorHTML)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    try {
      const editorData = await editorRef.current?.save()
      const imageIds: string[] = []
      if (editorData?.blocks)
        for (const b of editorData.blocks)
          if (
            b.type === 'image' &&
            b.data &&
            b.data.file &&
            b.data.file.id &&
            b.data.file.url
          )
            imageIds.push(b.data.file.id)

      if (!task) {
        const res = await createTaskAction({
          ...data,
          description: editorData ? JSON.stringify(editorData) : null,
          imageIds
        })
        if (!res?.data?.success)
          throw new Error(res?.serverError || 'No success returned from server')
        if (!res?.data?.id) throw new Error('No id returned from server')
        router.replace(`/tasks/${res.data.id}`)
      } else {
        const res = await updateTaskAction({
          id: task.id,
          ...data,
          description: editorData ? JSON.stringify(editorData) : null,
          imageIds
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

      {isEditorMounted ? (
        <div className="prose prose-neutral mx-auto mt-5 w-full dark:prose-invert">
          <h3 className="w-full bg-transparent text-3xl font-bold">
            Description
          </h3>
          <div id="editor" className="min-h-[360px] w-full" />
          <p className="text-sm text-gray-500">
            Use{' '}
            <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
              /
            </kbd>{' '}
            to open the command menu.
          </p>
        </div>
      ) : undefined}

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
