'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'

/**
 * Shared UI for App Router error boundaries (`error.tsx`, `global-error.tsx`).
 * Keeps recovery actions and support reference copy consistent.
 */
export function RouteError({
  error,
  onRetry,
  homeHref = '/',
  homeLabel = 'Go Home'
}: {
  error: Error & { digest?: string }
  onRetry: () => void
  homeHref?: string
  homeLabel?: string
}) {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <AlertTriangle
            className="text-muted-foreground/50 mx-auto size-16"
            aria-hidden
          />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            This Page Failed to Load
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            Refresh the page or go home and try again. If it keeps happening,
            contact support
            {error.digest ? ' with the reference below' : ''}.
          </p>
          {error.digest ? (
            <p className="text-muted-foreground mt-4 font-mono text-xs break-all">
              Reference: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={onRetry}>
              Try Again
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={homeHref}>{homeLabel}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
