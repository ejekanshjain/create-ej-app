import { PGlite } from '@electric-sql/pglite'
import { describe, expect, test } from 'bun:test'
import { pushSchema } from 'drizzle-kit/api'
import { drizzle } from 'drizzle-orm/pglite'
import * as relations from '~/db/relations'
import * as schema from '~/db/schema'
import { seedDatabase } from '~/scripts/seed'

/**
 * The seed writes straight through the schema, around Zod, so it exercises
 * constraints and foreign keys against realistic data.
 *
 * It runs on its own PGlite instance: seeded rows would otherwise leak into
 * every other suite in the same worker and break their counts.
 */
describe('seed script', () => {
  test('applies cleanly once, then skips', async () => {
    // Same Emscripten proc_exit side effect as tests/setup/pglite-db.ts.
    const exitCodeBeforePglite = process.exitCode

    const client = new PGlite()
    const db = drizzle({ client, schema: { ...schema, ...relations } })

    const { apply, hasDataLoss } = await pushSchema(
      schema,
      db as unknown as Parameters<typeof pushSchema>[1]
    )
    expect(hasDataLoss).toBe(false)
    await apply()

    const seed = () =>
      seedDatabase(db as unknown as Parameters<typeof seedDatabase>[0])

    expect((await seed()).skipped).toBe(false)

    const users = await db.select().from(schema.usersTable)
    expect(users.map(user => user.role).sort()).toEqual(['superadmin', 'user'])

    expect((await seed()).skipped).toBe(true)
    expect(await db.select().from(schema.usersTable)).toHaveLength(2)

    if (process.exitCode === 99) {
      process.exitCode =
        exitCodeBeforePglite !== undefined && exitCodeBeforePglite !== 99
          ? exitCodeBeforePglite
          : 0
    }
  }, 120_000)
})
