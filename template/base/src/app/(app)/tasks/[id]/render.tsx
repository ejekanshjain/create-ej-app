'use client'

import EditorJS from '@editorjs/editorjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskStatus } from '@prisma/client'
import edjsHTML from 'editorjs-html'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { toast } from '@/components/ui/use-toast'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import '@/styles/editor.css'
import {
  GetTaskFnDataType,
  createTask,
  deleteTask,
  updateTask
} from './actions'

const TaskSchema = z.object({
  title: z.string().nonempty(),
  status: z.nativeEnum(TaskStatus)
})

type FormData = z.infer<typeof TaskSchema>

const statuses = Object.values(TaskStatus).map(x => ({
  label: generateLabel(x),
  value: x
}))

const edjsParser = edjsHTML()

export const Render: FC<{
  task: GetTaskFnDataType | undefined
}> = ({ task }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: task?.title ?? '',
      status: task?.status || 'Todo'
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
    const Table = (await import('@editorjs/table')).default
    // @ts-ignore
    const List = (await import('@editorjs/list')).default
    // @ts-ignore
    const Image = (await import('@editorjs/image')).default
    // @ts-ignore
    const Header = (await import('@editorjs/header')).default
    // @ts-ignore
    const Quote = (await import('@editorjs/quote')).default
    // @ts-ignore
    const CheckList = (await import('@editorjs/checklist')).default
    // @ts-ignore
    const Delimiter = (await import('@editorjs/delimiter')).default

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          editorRef.current = editor
        },
        placeholder: 'Type here to write...',
        inlineToolbar: true,
        data: task?.description as any,
        tools: {
          header: Header,
          list: List,
          image: Image,
          table: Table,
          checklist: CheckList,
          quote: Quote,
          delimiter: Delimiter
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
    return edjsParser.parse(task.description as any).join('')
  }, [task?.description])
  console.log(editorHTML)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    try {
      const description = await editorRef.current?.save()
      if (!task) {
        const newId = await createTask({ ...data, description })
        router.replace(`/tasks/${newId}`)
      } else {
        await updateTask({
          id: task.id,
          ...data,
          description
        })
      }
      toast({
        title: 'Task saved'
      })
    } catch (err) {
      toast({
        title: 'Error saving task',
        variant: 'destructive'
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
            <Button type="submit" disabled={isSaving || isDeleting}>
              {isSaving ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.save className="mr-2 h-4 w-4" />
              )}
              <span>Save</span>
            </Button>
            {task ? (
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
                          await deleteTask(task.id)
                          toast({
                            title: 'Task deleted'
                          })
                          router.push('/tasks')
                        } catch (err) {
                          toast({
                            title: 'Error deleting task',
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
            {task ? (
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

          {isEditorMounted ? (
            <div className="col-span-1 md:col-span-2 w-full mt-5 prose prose-neutral mx-auto dark:prose-invert">
              <h3 className="w-full bg-transparent text-3xl font-bold">
                Description
              </h3>
              <div id="editor" className="min-h-[360px] w-full" />
              <p className="text-sm text-gray-500">
                Use{' '}
                <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
                  Tab
                </kbd>{' '}
                to open the command menu.
              </p>
            </div>
          ) : undefined}
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
              value: timesAgo(task.updatedAt)
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
              value: (
                <Link
                  href={`/users/${task.updatedBy.id}`}
                  className="underline underline-offset-4 transition-all hover:text-foreground"
                >
                  {task.updatedBy.name ?? 'Unknown'}
                </Link>
              )
            }
          ]}
        />
      ) : undefined}
    </Shell>
  )
}
