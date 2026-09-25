'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupportTicketAction } from '~/app/actions/support-tickets'
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
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import {
  supportPriorityOptions,
  type SupportTicketPriority
} from './support-ticket-shared'

export function CreateSupportTicketDialog({
  children,
  organizationId,
  redirectBasePath
}: {
  children: React.ReactNode
  /** Omit to raise an account ticket rather than an organization one. */
  organizationId?: string
  redirectBasePath: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<SupportTicketPriority>('medium')
  const [message, setMessage] = useState('')

  const { execute, isExecuting } = useAction(createSupportTicketAction, {
    onSuccess: ({ data }) => {
      toastSuccessMessage('Support ticket created')
      setOpen(false)
      setSubject('')
      setMessage('')
      if (data?.id) {
        router.push(`${redirectBasePath}/${data.id}`)
      } else {
        router.refresh()
      }
    },
    onError: ({ error }) => {
      toastActionError(error, 'The support ticket was not created. Try again.')
    }
  })

  const handleSubmit = () => {
    execute({
      organizationId: organizationId ?? null,
      subject,
      priority,
      message
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Support Ticket</DialogTitle>
          <DialogDescription>
            Describe the problem, including what you expected and what happened.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={subject}
            onChange={event => setSubject(event.target.value)}
            placeholder="Subject"
          />
          <Select
            value={priority}
            onValueChange={value => setPriority(value as SupportTicketPriority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {supportPriorityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={message}
            onChange={event => setMessage(event.target.value)}
            placeholder="What can we help with?"
            className="min-h-32"
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isExecuting}>
            Create ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
