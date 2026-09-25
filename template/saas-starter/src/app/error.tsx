'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { RouteError } from '~/components/route-error'

/**
 * Root segment error boundary.
 *
 * Catches runtime errors in pages and nested layouts under the root layout.
 * Does not catch errors thrown in the root layout itself; see `global-error.tsx`.
 */
export default function Error({
  error,
  unstable_retry
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const pathname = usePathname()
  const homeHref =
    pathname?.startsWith('/admin') && pathname !== '/admin' ? '/admin' : '/'
  const homeLabel = homeHref === '/admin' ? 'Back to Admin' : 'Go Home'

  useEffect(() => {
    console.error('Route error boundary:', error)
  }, [error])

  return (
    <RouteError
      error={error}
      onRetry={unstable_retry}
      homeHref={homeHref}
      homeLabel={homeLabel}
    />
  )
}
