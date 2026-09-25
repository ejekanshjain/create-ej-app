/**
 * @fileoverview Reusable Drizzle column definitions shared across tables.
 *
 * Centralises common patterns (prefixed CUID primary keys, timestamps) so
 * every table stays consistent. Add CHECK helpers here as tables need them.
 */
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { boolean, timestamp, varchar } from 'drizzle-orm/pg-core'

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
