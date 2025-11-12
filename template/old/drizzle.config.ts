import { type Config } from 'drizzle-kit'

import { env } from '@/env.mjs'

export default {
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL
  }
} satisfies Config
