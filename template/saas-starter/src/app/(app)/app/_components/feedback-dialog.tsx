'use client'

import { MessageCircle, Star } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useState } from 'react'
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
import { Textarea } from '~/components/ui/textarea'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import { createFeedbackAction } from '../../actions/feedbacks'

export function FeedbackDialog() {
  const params = useParams()
  const organizationId =
    typeof params?.orgId === 'string' ? params.orgId : undefined
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { execute, isExecuting } = useAction(createFeedbackAction, {
    onSuccess: () => {
      toastSuccessMessage('Thanks for the feedback')
      setOpen(false)
      setRating(5)
      setComment('')
    },
    onError: ({ error }) => {
      toastActionError(error, 'Your feedback was not sent. Try again.')
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={organizationId ? 'inline-flex' : 'hidden'}
          aria-label="Share feedback"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Feedback</DialogTitle>
          <DialogDescription>
            Tell us what works well and what should improve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1
              return (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star rating`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      value <= rating
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              )
            })}
          </div>

          <Textarea
            value={comment}
            onChange={event => setComment(event.target.value)}
            placeholder="Write your feedback…"
            className="min-h-32"
          />
        </div>

        <DialogFooter>
          <Button
            onClick={() =>
              organizationId && execute({ organizationId, rating, comment })
            }
            disabled={isExecuting || !comment.trim()}
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
