import { describe, expect, test } from 'bun:test'
import { sanitizeCallbackUrl } from '~/lib/callback-url'

// Everything sanitizeCallbackUrl rejects must be something a browser would
// resolve off-origin, so each case is checked against URL resolution too.
const APP_ORIGIN = 'https://app.example.com'

const resolvesOffOrigin = (value: string) =>
  new URL(value, APP_ORIGIN).origin !== APP_ORIGIN

describe('sanitizeCallbackUrl', () => {
  test('keeps same-origin paths, including query and hash', () => {
    expect(sanitizeCallbackUrl('/app')).toBe('/app')
    expect(sanitizeCallbackUrl('/accept-invitation/inv_abc123')).toBe(
      '/accept-invitation/inv_abc123'
    )
    expect(sanitizeCallbackUrl('/app/orders?status=open#top')).toBe(
      '/app/orders?status=open#top'
    )
  })

  test('rejects values that are not a path', () => {
    expect(sanitizeCallbackUrl(undefined)).toBeNull()
    expect(sanitizeCallbackUrl(['/app', '/admin'])).toBeNull()
    expect(sanitizeCallbackUrl('app')).toBeNull()
    expect(sanitizeCallbackUrl('https://evil.com')).toBeNull()
  })

  test('rejects the backslash and double-slash escapes out of the origin', () => {
    for (const value of ['//evil.com', '/\\evil.com', '/\\\\evil.com']) {
      expect(resolvesOffOrigin(value)).toBe(true)
      expect(sanitizeCallbackUrl(value)).toBeNull()
    }
  })

  test('rejects tabs and newlines, which URL parsing strips before resolving', () => {
    for (const value of ['/\t/evil.com', '/\n/evil.com', '/\r/evil.com']) {
      expect(resolvesOffOrigin(value)).toBe(true)
      expect(sanitizeCallbackUrl(value)).toBeNull()
    }
  })

  test('leaves lookalike hosts on the app origin instead of rejecting them', () => {
    // These stay same-origin, so they are safe to honour.
    expect(sanitizeCallbackUrl('/@evil.com')).toBe('/@evil.com')
    expect(sanitizeCallbackUrl('/%5Cevil.com')).toBe('/%5Cevil.com')
  })
})
