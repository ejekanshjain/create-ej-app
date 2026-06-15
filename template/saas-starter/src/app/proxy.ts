import { NextResponse } from 'next/server'

export function proxy() {
  return NextResponse.next()
}

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
