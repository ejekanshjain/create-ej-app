import { describe, expect, test } from 'bun:test'
import { isUniqueViolation } from '~/lib/errors'

describe('postgres error codes', () => {
  test('an error whose cause points back at itself is not a match and does not hang', () => {
    const error: { message: string; cause?: unknown } = { message: 'loop' }
    error.cause = error
    expect(isUniqueViolation(error)).toBe(false)
  })
})
