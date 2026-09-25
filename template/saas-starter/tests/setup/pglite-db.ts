/**
 * In-memory Postgres for Bun tests via Electric PGlite (WASM).
 *
 * One instance per Bun worker process:
 *   1. Start PGlite
 *   2. pushSchema from Drizzle table definitions
 *   3. Install functions and triggers (same as production setup-db)
 */
import { PGlite } from '@electric-sql/pglite'
import { pushSchema } from 'drizzle-kit/api'
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite'
import * as relations from '~/db/relations'
import * as schema from '~/db/schema'
import { setupDatabase } from '~/scripts/setup-db'

const fullSchema = { ...schema, ...relations }

type TestDatabase = PgliteDatabase<typeof fullSchema>

let initPromise: Promise<TestDatabase> | null = null

async function bootstrap(): Promise<TestDatabase> {
  // PGlite's Emscripten runtime sets process.exitCode to 99 via proc_exit on
  // the first WASM query. bun test then exits with that code even when every
  // assertion passed. Snapshot first, restore only the spurious 99, and leave
  // any real non-zero code alone.
  const exitCodeBeforePglite = process.exitCode

  const client = new PGlite()
  const db = drizzle({ client, schema: fullSchema })

  const { apply, warnings, hasDataLoss } = await pushSchema(
    schema,
    db as unknown as Parameters<typeof pushSchema>[1]
  )
  if (warnings.length) {
    console.warn('[pglite] schema push warnings:', warnings)
  }
  if (hasDataLoss) {
    throw new Error(
      '[pglite] schema push reported data loss on a fresh database. Aborting.'
    )
  }
  await apply()

  await setupDatabase(db as unknown as Parameters<typeof setupDatabase>[0])

  if (process.exitCode === 99) {
    process.exitCode =
      exitCodeBeforePglite !== undefined && exitCodeBeforePglite !== 99
        ? exitCodeBeforePglite
        : 0
  }

  return db
}

/**
 * Idempotent: first call boots PGlite + schema; later calls return the same db.
 * Safe to await from preload (once per worker).
 */
export function initPgliteDatabase(): Promise<TestDatabase> {
  if (!initPromise) {
    initPromise = bootstrap()
  }
  return initPromise
}
