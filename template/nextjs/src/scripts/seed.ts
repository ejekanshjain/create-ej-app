/**
 * @fileoverview Seeds a local database with a superadmin and a regular user.
 *
 * Sign in with a magic link sent to either seeded address, so point them at
 * inboxes you control. A successful run writes a `seed_runs` marker and later
 * runs do nothing; reset the database to seed again. Everything runs in one
 * transaction, so a failure leaves no partial data.
 */

import { db } from '~/db'
import { SEED_RUN_MARKER_ID, seedRunsTable, usersTable } from '~/db/schema'

/** Seeds `database` once. Returns `skipped: true` when a seed already ran. */
export async function seedDatabase(
  database: typeof db = db
): Promise<{ skipped: boolean }> {
  const [existingSeedRun] = await database
    .select({ id: seedRunsTable.id })
    .from(seedRunsTable)
    .limit(1)

  if (existingSeedRun) return { skipped: true }

  await database.transaction(async tx => {
    const superadminId = usersTable.id.defaultFn!()
    const userId = usersTable.id.defaultFn!()

    await tx.insert(usersTable).values([
      {
        id: superadminId,
        name: 'Super Admin',
        email: 'superadmin@example.com',
        emailVerified: true,
        role: 'superadmin'
      },
      {
        id: userId,
        name: 'Demo User',
        email: 'user@example.com',
        emailVerified: true,
        role: 'user'
      }
    ])

    // Marker last, so a failed seed never blocks a retry.
    await tx.insert(seedRunsTable).values({ id: SEED_RUN_MARKER_ID })
  })

  return { skipped: false }
}

if (import.meta.main) {
  seedDatabase(db)
    .then(result => {
      if (result.skipped) console.info('Database already seeded; skipping.')
      process.exit(0)
    })
    .catch(err => {
      console.error('Error running seed:', err)
      process.exit(1)
    })
}
