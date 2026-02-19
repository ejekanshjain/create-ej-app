/**
 * Database schema definitions.
 *
 * All Drizzle table definitions live here and are imported by both the
 * Drizzle client (`db/index.ts`) and the Drizzle Kit config
 * (`drizzle.config.ts`) so that migrations stay in sync with the code.
 */
import { pgTable, text } from 'drizzle-orm/pg-core'
import { commonFieldDefs } from './fields'

/**
 * `todos` table – stores individual todo items.
 */
export const todosTable = pgTable('todos', {
  id: commonFieldDefs.id,
  title: text('title').notNull(),
  content: text('content'),
  ...commonFieldDefs.dates
})
