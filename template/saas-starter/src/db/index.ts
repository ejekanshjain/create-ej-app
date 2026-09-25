import 'server-only'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '~/env'
import * as relations from './relations'
import * as schema from './schema'

// In development, Next.js hot-reloading can re-evaluate modules frequently.
// Keep a single postgres-js client on `globalThis` to avoid opening multiple
// database connections during local development.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>
}

// Prefer the cached client (dev) and fall back to creating a new one.
// `prepare: false` disables prepared statements, which transaction-mode
// poolers such as PgBouncer and Neon's pooler reject.
const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false,
    // For neon.tech postgres db, as its serverless
    ...(env.DATABASE_URL.includes('neon.tech')
      ? {
          max: 5,
          idle_timeout: 30, // seconds an idle connection is kept before closing
          max_lifetime: 60 * 5, // recycle a connection after 5 minutes
          connect_timeout: 60 // seconds to wait for a connection (Neon cold start)
        }
      : {})
  })

// Only cache the client outside production to avoid unexpected cross-request
// state retention in long-lived production processes.
if (env.APP_ENV !== 'production') globalForDb.client = client

/**
 * Drizzle ORM database client for PostgreSQL.
 *
 * Backed by a postgres-js client configured via `env.DATABASE_URL`, and wired
 * up with schema + relations so you get typed query helpers.
 *
 * Use this instance throughout the app for all database operations.
 *
 * @example
 * const users = await db.query.usersTable.findMany()
 * const newUser = await db.insert(usersTable).values({ email: 'user@example.com' })
 *
 * @example
 * await db.transaction(async (tx) => {
 *   await tx.insert(usersTable).values({ email: 'user@example.com' })
 * })
 */
export const db = drizzle(client, {
  schema: { ...schema, ...relations }
})

/** The transaction client type passed into `db.transaction(async (tx) => ...)`. */
export type DbTx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
