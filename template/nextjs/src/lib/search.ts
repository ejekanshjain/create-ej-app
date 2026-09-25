/**
 * Escape characters that are special in SQL LIKE / ILIKE patterns.
 *
 * Postgres uses `\` as the default escape character. Without escaping, a
 * user-typed `%` or `_` becomes a wildcard and can force full-table scans.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, char => `\\${char}`)
}

/**
 * Build a case-insensitive contains pattern: `%value%` with wildcards escaped.
 */
export function likeContains(value: string): string {
  return `%${escapeLikePattern(value)}%`
}
