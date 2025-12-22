'use client'

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import type { SafeActionResult } from 'next-safe-action'

type AnyAction = (
  ...args: any[]
) => Promise<SafeActionResult<any, any, any, any, any>>
type ActionInput<T extends AnyAction> = Parameters<T>[0]
type ActionData<T extends AnyAction> = Awaited<ReturnType<T>>['data']

export function useSafeActionQuery<TAction extends AnyAction>(
  action: TAction,
  input: ActionInput<TAction>,
  options?: Omit<UseQueryOptions<ActionData<TAction>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [`${action.name}`, input],
    queryFn: async () => {
      const result = await action(input)
      if (result?.serverError) throw new Error(result.serverError)
      if (result?.validationErrors) throw new Error('Validation failed')
      return result?.data
    },
    ...options
  })
}

export function useSafeActionMutation<TAction extends AnyAction>(
  action: TAction,
  options?: UseMutationOptions<ActionData<TAction>, Error, ActionInput<TAction>>
) {
  return useMutation({
    mutationFn: async (input: ActionInput<TAction>) => {
      const result = await action(input)
      if (result?.serverError) throw new Error(result.serverError)
      if (result?.validationErrors) throw new Error('Validation failed')
      return result?.data
    },
    ...options
  })
}
