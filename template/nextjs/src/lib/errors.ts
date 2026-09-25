/**
 * Expected, user-safe action failures.
 *
 * Throw these for domain and authorization failures. The safe-action
 * `handleServerError` returns {@link AppError.message} to the client and
 * records the code on the active span. Unexpected errors stay masked.
 *
 * Do not put stack traces, SQL, or internal IDs in `message`.
 */
export const AppErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  FEATURE_NOT_INCLUDED: 'FEATURE_NOT_INCLUDED',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL: 'INTERNAL'
} as const

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode]

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly meta?: Record<string, unknown>

  constructor(
    code: AppErrorCode,
    message: string,
    meta?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.meta = meta
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * The Postgres SQLSTATE of a failed query. Drizzle wraps driver errors and
 * keeps the original on `cause`, so read both.
 */
function postgresCode(error: unknown, depth = 0): unknown {
  // Drizzle adds one layer; the cap stops an error whose cause points back at
  // itself from looping forever.
  if (depth > 5 || typeof error !== 'object' || error === null) return undefined
  if ('code' in error && typeof error.code === 'string') return error.code
  return 'cause' in error ? postgresCode(error.cause, depth + 1) : undefined
}

export function isUniqueViolation(error: unknown): boolean {
  return postgresCode(error) === '23505'
}

/**
 * True when a delete or update is refused because another row still points at
 * the row: a foreign key violation, or a `restrict` violation for keys declared
 * `onDelete: 'restrict'`.
 */
export function isForeignKeyViolation(error: unknown): boolean {
  const code = postgresCode(error)
  return code === '23503' || code === '23001'
}

export function rethrowUniqueViolation(error: unknown, message: string): never {
  if (isUniqueViolation(error)) {
    throw new AppError(AppErrorCode.CONFLICT, message)
  }
  throw error
}
