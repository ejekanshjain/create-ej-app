import { expect } from 'bun:test'
import { UNEXPECTED_ERROR_MESSAGE } from '~/lib/safe-action'

type ActionResult = {
  data?: unknown
  serverError?: string
  validationErrors?: unknown
}

const MASKED = UNEXPECTED_ERROR_MESSAGE

export function expectData<T>(
  result: ActionResult | undefined
): asserts result is { data: T } {
  if (!result) throw new Error('Expected action result, got undefined')
  if (result.serverError) {
    throw new Error(`Expected success, got serverError: ${result.serverError}`)
  }
  if (result.validationErrors) {
    throw new Error(
      `Expected success, got validationErrors: ${JSON.stringify(result.validationErrors)}`
    )
  }
  if (result.data === undefined) {
    throw new Error('Expected action data, got undefined')
  }
}

/** Action returned null/undefined data (some actions swallow errors). */
export function expectNoData(result: ActionResult | undefined) {
  expect(result?.data ?? null).toBeNull()
}

/** Action was rejected by its input schema, before any handler ran. */
export function expectValidationError(result: ActionResult | undefined) {
  if (!result?.validationErrors) {
    throw new Error(
      `Expected validationErrors, got: ${JSON.stringify(result ?? null)}`
    )
  }
  return result.validationErrors
}

/**
 * Action failed with a serverError.
 * next-safe-action can mask thrown Error messages as a generic string.
 * In that case, this helper only asserts that a failure occurred.
 */
export function expectServerError(
  result: ActionResult | undefined,
  messageIncludes?: string | RegExp
) {
  if (!result?.serverError) {
    throw new Error(
      `Expected serverError, got: ${JSON.stringify(result ?? null)}`
    )
  }
  if (
    messageIncludes &&
    result.serverError.toLowerCase() !== MASKED.toLowerCase()
  ) {
    if (typeof messageIncludes === 'string') {
      expect(result.serverError.toLowerCase()).toContain(
        messageIncludes.toLowerCase()
      )
    } else {
      expect(result.serverError).toMatch(messageIncludes)
    }
  }
  return result.serverError
}
