import type { Metadata } from 'next'
import { siteConfig } from '~/lib/siteConfig'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Send the ${siteConfig.name} team a message.`
}

export default function ContactUsPage() {
  return (
    <div className="container max-w-xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="text-muted-foreground mt-2">
        Send us a message and we&apos;ll reply by email within one business day.
      </p>
      <ContactForm />
    </div>
  )
}
