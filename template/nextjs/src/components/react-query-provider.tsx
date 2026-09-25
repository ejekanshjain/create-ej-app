/**
 * @fileoverview React Query Provider Component
 *
 * Wraps the application with TanStack Query's QueryClientProvider.
 * Enables data fetching, caching, and server state management.
 *
 * **Features Enabled:**
 * - Automatic background refetching
 * - Request deduplication
 * - Cache management
 * - Optimistic updates
 * - useSafeActionQuery/useSafeActionMutation hooks
 *
 * @module components/react-query-provider
 * @see https://tanstack.com/query/latest
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, ReactNode, useState } from 'react'

/** Default: treat list/admin data as fresh for 30s so focus does not re-hit every action. */
const DEFAULT_STALE_TIME_MS = 30_000

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS
      }
    }
  })
}

/**
 * React Query Provider Component
 *
 * Creates one QueryClient for the provider lifetime and wraps children.
 * Place near the root of the client tree.
 *
 * Global `staleTime` is 30s. Live surfaces should pass `staleTime: 0`;
 * heavy dashboards and static options can pass a longer value.
 */
export const ReactQueryProvider: FC<{
  children?: ReactNode
}> = ({ children }) => {
  const [client] = useState(createQueryClient)

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
