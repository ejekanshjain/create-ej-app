'use client'

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import type { SafeActionResult } from 'next-safe-action'

/** Type helper for any server action function */
export type AnyAction = (
  ...args: any[]
) => Promise<SafeActionResult<any, any, any, any, any>>

/** Extracts the input type from a server action */
type ActionInput<T extends AnyAction> = Parameters<T>[0]

/** Extracts the data type from a server action result */
type ActionData<T extends AnyAction> = Awaited<ReturnType<T>>['data']

/**
 * Client-side error for server action failures.
 * Carries the user-facing `serverError` string (including unmasked AppError
 * messages) and optional Zod validation errors.
 */
class SafeActionError extends Error {
  constructor(
    public message: string,
    public validationErrors?: Record<string, string[] | undefined>
  ) {
    super(message)
    this.name = 'SafeActionError'
  }
}

/**
 * React Query hook for server actions that fetch data
 * Wraps server actions with proper error handling and caching support
 *
 * @param key - Unique query key for caching
 * @param action - Server action function to execute
 * @param input - Input parameters for the server action (optional)
 * @param options - React Query options (staleTime, refetchInterval, etc.)
 *
 * @returns React Query result with data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useSafeActionQuery('cart-items', getCartItems)
 * ```
 */
export function useSafeActionQuery<TAction extends AnyAction>(
  key: string,
  action: TAction,
  input?: ActionInput<TAction>,
  options?: Omit<UseQueryOptions<ActionData<TAction>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [key, input],
    queryFn: async () => {
      const result = await action(input)

      if (result?.serverError) {
        throw new SafeActionError(result.serverError)
      }

      if (result?.validationErrors) {
        throw new SafeActionError(
          'Check the highlighted fields and try again.',
          result.validationErrors
        )
      }

      return result?.data
    },
    ...options
  })
}

/**
 * React Query mutation hook for server actions that modify data
 * Wraps server actions with proper error handling and optimistic updates support
 *
 * @param action - Server action function to execute
 * @param options - React Query mutation options (onSuccess, onError, etc.)
 *
 * @returns React Query mutation result with mutate function and states
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useSafeActionMutation(addToCart, {
 *   onSuccess: (data) => {
 *     toastSuccessMessage('Added to cart!')
 *     queryClient.invalidateQueries({ queryKey: ['cart-items'] })
 *   },
 *   onError: (error) => {
 *     toastActionError(error, 'Failed to add to cart')
 *   }
 * })
 * ```
 */
export function useSafeActionMutation<TAction extends AnyAction>(
  action: TAction,
  options?: UseMutationOptions<ActionData<TAction>, Error, ActionInput<TAction>>
) {
  return useMutation({
    mutationFn: async (input: ActionInput<TAction>) => {
      const result = await action(input)

      if (result?.serverError) {
        throw new SafeActionError(result.serverError)
      }

      if (result?.validationErrors) {
        throw new SafeActionError(
          'Check the highlighted fields and try again.',
          result.validationErrors
        )
      }

      return result?.data
    },
    ...options
  })
}
