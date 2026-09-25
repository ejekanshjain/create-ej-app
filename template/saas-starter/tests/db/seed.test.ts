import { PGlite } from '@electric-sql/pglite'
import { describe, expect, test } from 'bun:test'
import { pushSchema } from 'drizzle-kit/api'
import { drizzle } from 'drizzle-orm/pglite'
import * as relations from '~/db/relations'
import * as schema from '~/db/schema'
import { seedDatabase } from '~/scripts/seed'
import { setupDatabase } from '~/scripts/setup-db'

/**
 * The seed writes straight through the schema, around Zod, so it exercises
 * CHECK constraints, foreign keys, and triggers against realistic data.
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
    await setupDatabase(db as unknown as Parameters<typeof setupDatabase>[0])

    const seed = () =>
      seedDatabase(db as unknown as Parameters<typeof seedDatabase>[0])

    expect((await seed()).skipped).toBe(false)

    const [users, organizations, subscriptions] = await Promise.all([
      db.select().from(schema.usersTable),
      db.select().from(schema.organizationsTable),
      db.select().from(schema.organizationSubscriptionsTable)
    ])
    expect(users.map(user => user.role).sort()).toEqual(['superadmin', 'user'])
    expect(organizations).toHaveLength(1)
    expect(subscriptions).toHaveLength(1)

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
