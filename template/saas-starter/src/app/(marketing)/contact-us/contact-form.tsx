'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import { submitContactForm } from './actions'
import { contactFormSchema } from './validation'

type ContactFormValues = z.infer<typeof contactFormSchema>

const FIELDS = [
  { name: 'name', label: 'Full name', autoComplete: 'name', type: 'text' },
  {
    name: 'email',
    label: 'Email address',
    autoComplete: 'email',
    type: 'email'
  },
  {
    name: 'phone',
    label: 'Phone number (optional)',
    autoComplete: 'tel',
    type: 'tel'
  },
  { name: 'subject', label: 'Subject', autoComplete: 'off', type: 'text' }
] as const

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  })

  const { mutate, isPending } = useSafeActionMutation(submitContactForm, {
    onSuccess: () => {
      toastSuccessMessage("We received your message. We'll reply by email.")
      form.reset()
    },
    onError: error =>
      toastActionError(
        error,
        "Your message wasn't sent. Check your connection and try again."
      )
  })

  return (
    <form
      onSubmit={form.handleSubmit(values => mutate(values))}
      className="mt-8 space-y-5"
      aria-busy={isPending}
    >
      {FIELDS.map(item => (
        <Controller
          key={item.name}
          control={form.control}
          name={item.name}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>
              <Input
                id={field.name}
                type={item.type}
                autoComplete={item.autoComplete}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />
      ))}

      <Controller
        control={form.control}
        name="message"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Message</FieldLabel>
            <Textarea
              id={field.name}
              className="min-h-32"
              placeholder="How can we help…"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
        {isPending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
