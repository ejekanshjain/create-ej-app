import { sql } from 'drizzle-orm'
import { db } from '~/db'
import { env } from '~/env'

const resetDb = async () => {
  if (env.APP_ENV === 'production') {
    throw new Error('Cannot reset database in production environment.')
  }

  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`)
  await db.execute(sql`CREATE SCHEMA public;`)
}

if (import.meta.main) {
  try {
    await resetDb()
    process.exit(0)
  } catch (err) {
    console.error('Error running reset-db:', err)
    process.exit(1)
  }
}
