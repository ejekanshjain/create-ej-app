import { type NextRequest, NextResponse } from 'next/server'

/**
 * Proxy middleware function
 *
 * Forwards the request pathname (+ search) as `x-pathname` so server layouts
 * can build a same-origin login callback without losing deep links.
 * @returns NextResponse that continues the request chain
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    'x-pathname',
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )

  return NextResponse.next({
    request: { headers: requestHeaders }
  })
}

/**
 * Middleware configuration
 *
 * Defines which routes this middleware should be applied to using the matcher pattern.
 */
export const config = {
  matcher: [
    {
      /**
       * Route matching pattern
       *
       * This regex pattern matches all routes EXCEPT:
       * - /_next/static - Next.js static assets
       * - /_next/image - Next.js image optimization
       * - /favicon.ico - Browser favicon
       * - /.well-known/workflow/ - Internal workflow paths
       *
       * Excluding these paths ensures that:
       * 1. Static assets load efficiently without middleware overhead
       * 2. Image optimization is not interrupted
       * 3. Workflow execution and resumption function correctly
       */
      source:
        '/((?!_next/static|_next/image|favicon.ico|.well-known/workflow/).*)'
    }
  ]
}
