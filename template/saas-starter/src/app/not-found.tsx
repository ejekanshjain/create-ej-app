/**
 * @fileoverview 404 Not Found Page
 *
 * Global catch-all page displayed when a route is not found.
 * Redirects users back to the appropriate home page based on the current route context.
 *
 * **Behavior:**
 * - Admin routes (/admin/*) redirect to /admin
 * - All other routes redirect to /
 *
 * @module app/not-found
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '~/components/ui/button'

/**
 * Not Found Page Component
 *
 * Displays a 404 error message with context-aware home button.
 * Uses the current pathname to determine the appropriate home route.
 *
 * @returns {JSX.Element} 404 error page with navigation button
 */
export default function NotFound() {
  const pathname = usePathname()
  const homeRoute =
    pathname?.startsWith('/admin') && pathname !== '/admin' ? '/admin' : '/'

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-6xl font-bold">404</h1>
          <p className="text-muted-foreground mb-8 text-xl">Page not found</p>
          <p className="text-muted-foreground mb-8 max-w-md text-base">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href={homeRoute}>Return Home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
