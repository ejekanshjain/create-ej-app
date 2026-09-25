/**
 * Bun test preload (runs before every test file and worker).
 *
 * - In-memory PGlite Postgres (WASM) through a `~/db` mock
 * - R2 env cleared, so storage stays in base64 dev mode (no bucket I/O)
 * - `react.cache` becomes identity
 * - `getAuthSession` reads an AsyncLocalStorage (parallel-safe)
 *
 * Set `TEST_DATABASE=postgres` to use the real `DATABASE_URL` instead.
 */
import { mock } from 'bun:test'
import { AsyncLocalStorage } from 'node:async_hooks'
import { createRequire } from 'node:module'
import path from 'node:path'

// Bun loads `.env` before preload, so unsetting these is not enough: empty
// strings become undefined through `emptyStringAsUndefined` in ~/env.
for (const key of [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL'
] as const) {
  process.env[key] = ''
}

// Bun does not set the `react-server` export condition, so the real
// `server-only` package throws. Next.js client builds still fail on it.
mock.module('server-only', () => ({}))

// `start()` needs the Workflow runtime. Tests only need fire-and-forget
// side effects such as emails to no-op.
mock.module('workflow/api', () => ({
  start: async () => ({ runId: 'test-workflow-run' })
}))

// ---------------------------------------------------------------------------
// Database: PGlite (default) or real Postgres
// ---------------------------------------------------------------------------

process.env.TEST_DATABASE ??= 'pglite'

if (process.env.TEST_DATABASE === 'pglite') {
  // ~/env requires a URL even though PGlite never connects to it.
  process.env.DATABASE_URL ??= 'postgres://pglite.local/test'

  const { initPgliteDatabase } = await import('./pglite-db')
  const dbModule = { db: await initPgliteDatabase() }

  mock.module('~/db', () => dbModule)
  mock.module(
    path.resolve(import.meta.dir, '../../src/db/index.ts'),
    () => dbModule
  )
}

// ---------------------------------------------------------------------------
// Auth and request headers
// ---------------------------------------------------------------------------

type MockAuthSession = {
  user: { id: string; email: string; name: string; role?: string | null }
  session: { id: string; userId: string; impersonatedBy?: string | null }
  isAdmin: boolean
  isSuperAdmin: boolean
}

const authAls = new AsyncLocalStorage<MockAuthSession | null>()

/** Runs `fn` with `getAuthSession()` returning `session`. */
export function runWithAuthSession<T>(
  session: MockAuthSession | null,
  fn: () => Promise<T>
): Promise<T> {
  return authAls.run(session, fn)
}

const require = createRequire(import.meta.url)
const React = require('react') as typeof import('react')

mock.module('react', () => ({
  ...React,
  default: React,
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn
}))

const authModuleMock = {
  getAuthSession: async () => authAls.getStore() ?? null,
  auth: null as unknown
}

mock.module('~/lib/auth', () => authModuleMock)
mock.module(
  path.resolve(import.meta.dir, '../../src/lib/auth.ts'),
  () => authModuleMock
)

mock.module('next/headers', () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    get: () => undefined,
    getAll: () => [],
    has: () => false,
    set: () => {},
    delete: () => {}
  })
}))
