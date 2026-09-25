/** Origin used only to resolve a candidate callback and check where it lands. */
const RESOLUTION_ORIGIN = 'https://callback.invalid'

/**
 * Narrow a caller-supplied `?callbackUrl=` down to a same-origin path.
 *
 * Returns the normalised path, or null when the value could leave the site.
 * A leading `/` is not enough on its own: `//evil.com`, `/\evil.com`, and
 * `/<tab>/evil.com` all resolve cross-origin in a browser, the last because
 * URL parsing strips tabs and newlines first. The shape checks below reject
 * the known forms, and resolving against a throwaway origin catches the rest.
 */
export function sanitizeCallbackUrl(
  value: string | string[] | undefined
): string | null {
  if (typeof value !== 'string') return null
  if (!/^\/(?![/\\])/.test(value)) return null
  if (/[\t\n\r]/.test(value)) return null

  try {
    const resolved = new URL(value, RESOLUTION_ORIGIN)
    if (resolved.origin !== RESOLUTION_ORIGIN) return null

    return `${resolved.pathname}${resolved.search}${resolved.hash}`
  } catch {
    return null
  }
}
