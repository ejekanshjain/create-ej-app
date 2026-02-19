/**
 * Shared / reusable column definitions for Drizzle schemas.
 *
 * Centralising common column definitions here keeps every table
 * consistent (same naming, same types, same defaults) and eliminates
 * duplication across schema files.
 */
import { timestamp, uuid } from 'drizzle-orm/pg-core'

export const commonFieldDefs = {
  /**
   * Standard UUID primary key column.
   * The database generates a random UUID v4 by default.
   */
  id: uuid('id').primaryKey().defaultRandom(),

  /**
   * Factory for a single timezone-aware timestamp column.
   * @param name – The underlying database column name.
   */
  date: (name: string) =>
    timestamp(name, {
      mode: 'date',
      withTimezone: true
    }),

  /**
   * Standard `created_at` / `updated_at` audit columns.
   * Both default to the current time at insert; `updated_at` should
   * be refreshed on every UPDATE (via application logic or a trigger).
   */
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
      .defaultNow()
  }
}
