'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateNameAction } from './actions'
import { userSchema } from './validation'

type FormData = z.infer<typeof userSchema>

export const Render: FC<{ name: string }> = ({ name }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    const res = await updateNameAction({
      ...data
    })

    if (res?.data) {
      toast('Your name has been updated.')
      router.refresh()
    } else {
      toast('Internal Server Error', {
        description: 'Please try again later.'
      })
    }

    setIsSaving(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Your Name</CardTitle>
            <CardDescription>
              Please enter your full name or a display name you are comfortable
              with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="max-w-[400px]">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Your Name"
                      autoComplete="name"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.save className="mr-2 h-4 w-4" />
              )}
              <span>Save</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
