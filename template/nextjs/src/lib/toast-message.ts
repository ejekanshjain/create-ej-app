'use client'

import { toast } from 'sonner'

const DEFAULT_ERROR = 'The request did not finish. Try again in a few minutes.'

type ActionResultLike = {
  serverError?: string
  validationErrors?: unknown
}

/**
 * Displays a success toast notification to the user.
 */
export const toastSuccessMessage = (message: string) =>
  toast.success(message, {
    richColors: true,
    position: 'top-center'
  })

/**
 * Displays an informational toast (neutral, non-error feedback).
 */
export const toastInfoMessage = (message: string) =>
  toast.info(message, {
    richColors: true,
    position: 'top-center'
  })

/**
 * Displays an error toast. Uses a default message when none is provided.
 */
export const toastErrorMessage = (message?: string) =>
  toast.error(message || DEFAULT_ERROR, {
    richColors: true,
    position: 'top-center'
  })

/**
 * Toast an action failure from `await someAction(...)`.
 * Returns true when a toast was shown so callers can bail.
 *
 * @example
 * const result = await upsertTableAction(values)
 * if (toastIfActionFailed(result)) return
 */
export function toastIfActionFailed(
  result: ActionResultLike | undefined | null
): boolean {
  if (!result) return false
  if (result.serverError) {
    toastErrorMessage(result.serverError)
    return true
  }
  if (result.validationErrors) {
    toastErrorMessage('Check the highlighted fields and try again.')
    return true
  }
  return false
}

/**
 * Toast a failure from hooks (`useSafeActionMutation`, `useAction`) or a thrown Error.
 *
 * Accepts:
 * - `SafeActionError` / `Error` (`message`)
 * - `useAction` error bag (`{ serverError, validationErrors }`)
 * - plain string
 *
 * @example
 * onError: error => toastActionError(error, 'Failed to save')
 * onError: ({ error }) => toastActionError(error, 'Failed to save')
 */
export function toastActionError(
  error: unknown,
  fallback = DEFAULT_ERROR
): void {
  if (typeof error === 'string' && error.trim()) {
    toastErrorMessage(error)
    return
  }

  if (error && typeof error === 'object') {
    const bag = error as ActionResultLike & { message?: string }

    if (typeof bag.serverError === 'string' && bag.serverError) {
      toastErrorMessage(bag.serverError)
      return
    }
    if (bag.validationErrors) {
      toastErrorMessage('Check the highlighted fields and try again.')
      return
    }
    if (typeof bag.message === 'string' && bag.message.trim()) {
      toastErrorMessage(bag.message)
      return
    }
  }

  toastErrorMessage(fallback)
}
