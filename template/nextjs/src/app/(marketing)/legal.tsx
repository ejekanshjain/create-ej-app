import type { ReactNode } from 'react'
import { siteConfig } from '~/lib/siteConfig'

/** Page shell shared by the privacy policy and the terms of service. */
export function LegalPage({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:px-0">
      <h1 className="mb-8 text-4xl font-bold">{title}</h1>
      <div className="text-muted-foreground space-y-6 leading-relaxed">
        <p className="text-foreground font-medium">
          Last updated: {siteConfig.legal.lastUpdated}
        </p>
        {children}
      </div>
    </article>
  )
}

/** One numbered section of a legal page. Number the title yourself. */
export function LegalSection({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-foreground mt-8 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

/** Bulleted list styled for legal page body copy. */
export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6">{children}</ul>
}

const linkClassName =
  'text-primary focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 focus-visible:ring-3 focus-visible:outline-none'

/** Inline mailto link to the support address. */
export function ContactEmailLink() {
  return (
    <a href={`mailto:${siteConfig.contact.email}`} className={linkClassName}>
      {siteConfig.contact.email}
    </a>
  )
}
