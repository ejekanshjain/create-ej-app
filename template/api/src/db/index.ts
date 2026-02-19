/**
 * Drizzle ORM database client.
 *
 * Creates and exports the singleton `db` instance that is used
 * throughout the application to interact with the PostgreSQL database.
 * The Bun-native SQL driver (`bun-sql`) is used for maximum performance.
 *
 * All table definitions from the schema are passed in so that Drizzle's
 * relational query API (`db.query.*`) is fully typed.
 */
import { drizzle } from 'drizzle-orm/bun-sql'
import { env } from '~/env'
import * as schema from './schema'

// Instantiate the Drizzle client with the validated DATABASE_URL and the
// full schema so relational queries (db.query.todosTable.*) are available.
export const db = drizzle(env.DATABASE_URL, {
  schema: {
    ...schema
  }
})
