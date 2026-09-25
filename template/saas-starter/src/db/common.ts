/**
 * @fileoverview Reusable Drizzle column definitions shared across tables.
 *
 * Centralises common patterns (prefixed CUID primary keys, timestamps) so
 * every table stays consistent.
 */
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  timestamp,
  varchar,
  type AnyPgColumn
} from 'drizzle-orm/pg-core'

export const commonFieldDefs = {
  /** Generates a prefixed CUID2 primary key, such as `user_clx1234567890`. */
  id: (prefix: string) =>
    varchar('id')
      .primaryKey()
      .$defaultFn(() => prefix + '_' + createId()),
  /** Nullable timezone-aware timestamp column. */
  date: (name: string) =>
    timestamp(name, {
      mode: 'date',
      withTimezone: true
    }),
  /** Auto-populated `created_at` and `updated_at` timestamp pair. */
  dates: {
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true
    })
      .notNull()
      .$onUpdate(() => sql`NOW()`)
      .defaultNow()
  },
  /** Boolean `is_active` flag, defaults to `true`. */
  isActive: boolean('is_active').notNull().default(true)
}

/**
 * CHECK constraint holding every listed column at zero or above.
 *
 * Invariants belong in the database, not only in Zod: the seed script, a
 * `psql` session, and Drizzle Studio all write around Zod. Nullable columns
 * still pass, since a CHECK rejects only a definitively false result.
 */
export const nonNegativeCheck = (name: string, columns: AnyPgColumn[]) =>
  check(
    name,
    sql.join(
      columns.map(column => sql`${column} >= 0`),
      sql` AND `
    )
  )
