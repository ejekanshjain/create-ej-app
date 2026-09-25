'use client'

import { ArrowLeft, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  addSupportTicketMessageAction,
  getSupportTicketDetailsAction,
  updateSupportTicketStatusAction
} from '~/app/actions/support-tickets'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { formatDate } from '~/lib/format-date'
import {
  useSafeActionMutation,
  useSafeActionQuery
} from '~/lib/safe-action-client'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import {
  SupportPriorityBadge,
  SupportStatusBadge,
  formatSupportLabel,
  supportStatusOptions,
  type SupportTicketStatus
} from './support-ticket-shared'

export function SupportTicketConversation({
  ticketId,
  backHref,
  mode
}: {
  ticketId: string
  backHref: string
  /** `admin` answers as the support team and can change the status. */
  mode: 'app' | 'admin'
}) {
  const [message, setMessage] = useState('')
  const { data, isLoading, refetch } = useSafeActionQuery(
    `support-ticket-${ticketId}`,
    getSupportTicketDetailsAction,
    { ticketId }
  )

  const addMessage = useSafeActionMutation(addSupportTicketMessageAction, {
    onSuccess: () => {
      setMessage('')
      void refetch()
      toastSuccessMessage('Message sent')
    },
    onError: error =>
      toastActionError(error, 'Your message was not sent. Try again.')
  })

  const updateStatus = useSafeActionMutation(updateSupportTicketStatusAction, {
    onSuccess: () => {
      void refetch()
      toastSuccessMessage('Ticket status updated')
    },
    onError: error =>
      toastActionError(error, 'The status was not changed. Try again.')
  })

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const customerReplyDisabled =
    mode === 'app' && ['closed', 'resolved'].includes(data.ticket.status)
  const replyDisabled =
    customerReplyDisabled || addMessage.isPending || !message.trim()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="text-muted-foreground font-mono text-sm">
              {data.ticket.ticketNumber}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {data.ticket.subject}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SupportStatusBadge status={data.ticket.status} />
              <SupportPriorityBadge priority={data.ticket.priority} />
              <span className="text-muted-foreground text-sm">
                Created {formatDate(data.ticket.createdAt, { short: true })}
              </span>
            </div>
          </div>
        </div>

        {mode === 'admin' ? (
          <div className="min-w-52">
            <Select
              value={data.ticket.status}
              onValueChange={value =>
                updateStatus.mutate({
                  ticketId,
                  status: value as SupportTicketStatus
                })
              }
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {supportStatusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <section className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
          <div className="border-border bg-muted/30 border-b px-5 py-3">
            <h2 className="font-semibold">Conversation</h2>
          </div>
          <div className="space-y-4 p-5">
            {data.messages.map(item => {
              const mine = mode === 'admin' ? item.isAdmin : !item.isAdmin
              return (
                <div
                  key={item.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-lg border px-4 py-3 ${
                      mine
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background'
                    }`}
                  >
                    <div className="mb-1 text-xs opacity-75">
                      {item.isAdmin
                        ? 'Support Team'
                        : item.userName || item.userEmail || 'Customer'}{' '}
                      ·{' '}
                      {formatDate(item.createdAt, { short: true, time: true })}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-border bg-muted/20 space-y-3 border-t p-5">
            <Textarea
              value={message}
              disabled={customerReplyDisabled || addMessage.isPending}
              onChange={event => setMessage(event.target.value)}
              placeholder={
                customerReplyDisabled
                  ? 'This ticket is resolved or closed. Open a new one to follow up.'
                  : 'Write a reply…'
              }
              className="min-h-28"
            />
            <div className="flex justify-end">
              <Button
                disabled={replyDisabled}
                onClick={() =>
                  addMessage.mutate({
                    ticketId,
                    message,
                    asSupport: mode === 'admin'
                  })
                }
              >
                <Send className="mr-2 h-4 w-4" />
                Send message
              </Button>
            </div>
          </div>
        </section>

        <aside className="border-border bg-card h-fit rounded-lg border p-5 shadow-sm">
          <h2 className="font-semibold">Ticket Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{formatSupportLabel(data.ticket.status)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Priority</dt>
              <dd>{formatSupportLabel(data.ticket.priority)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Organization</dt>
              <dd>{data.ticket.organizationName || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Raised by</dt>
              <dd>{data.ticket.userName || data.ticket.userEmail || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Resolved</dt>
              <dd>
                {data.ticket.resolvedAt
                  ? formatDate(data.ticket.resolvedAt, { short: true })
                  : '-'}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
