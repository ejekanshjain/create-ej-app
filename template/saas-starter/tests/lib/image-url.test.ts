import { describe, expect, test } from 'bun:test'
import { canPersistImageValue, isStoredImageValue } from '~/lib/image-url'

const OWN_KEY = 'uploads/organizations/organization_abc123/logo_1.png'
const DATA_URL = 'data:image/png;base64,iVBORw0KGgo='

describe('stored image values', () => {
  test('accepts organization upload keys and image data URLs', () => {
    expect(isStoredImageValue(OWN_KEY)).toBe(true)
    expect(isStoredImageValue(DATA_URL)).toBe(true)
  })

  test('rejects external URLs, scripts, other types, and path traversal', () => {
    for (const value of [
      'https://example.com/logo.png',
      'javascript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      'data:image/svg+xml;base64,PHN2Zz4=',
      'uploads/organizations/../other/logo.png',
      'uploads/organizations/organization_abc123/logo.html'
    ]) {
      expect(isStoredImageValue(value)).toBe(false)
    }
  })

  test('data URLs are stored only while R2 is off', () => {
    expect(canPersistImageValue(DATA_URL, false)).toBe(true)
    expect(canPersistImageValue(DATA_URL, true)).toBe(false)
    expect(canPersistImageValue(OWN_KEY, true)).toBe(true)
  })
})
