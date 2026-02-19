/**
 * Validated environment configuration.
 *
 * Uses @t3-oss/env-core together with Zod to parse and validate all
 * required environment variables at startup.  The application will
 * throw a descriptive error and refuse to start if any variable is
 * missing or fails its validation rule.
 */
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive(),
    APP_ENV: z.enum(['development', 'staging', 'production']),
    DATABASE_URL: z.url()
  },

  // Read all variables directly from process.env
  runtimeEnv: process.env,

  // Treat empty strings the same as missing (undefined) variables
  emptyStringAsUndefined: true
})
