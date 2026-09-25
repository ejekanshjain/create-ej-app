'use client'

import { useEffect } from 'react'
import { RouteError } from '~/components/route-error'
import { siteConfig } from '~/lib/siteConfig'
import { geistMono, geistSans } from './fonts'
import './globals.css'

/**
 * Root layout error boundary.
 *
 * Replaces the entire root layout when an error is thrown there.
 * Must define its own document shell (`html` / `body`) and styles.
 */
export default function GlobalError({
  error,
  unstable_retry
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary:', error)
  }, [error])

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <title>This Page Failed to Load | {siteConfig.name}</title>
        <RouteError error={error} onRetry={unstable_retry} />
      </body>
    </html>
  )
}
