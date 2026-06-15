import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    APP_ENV: z.enum(['development', 'staging', 'production']),
    ANALYZE: z.string().optional(),
    DATABASE_URL: z.url(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_GITHUB_ID: z.string(),
    BETTER_AUTH_GITHUB_SECRET: z.string(),
    BETTER_AUTH_GOOGLE_ID: z.string(),
    BETTER_AUTH_GOOGLE_SECRET: z.string(),
    EMAIL_SERVER_USER: z.string(),
    EMAIL_SERVER_PASSWORD: z.string(),
    EMAIL_SERVER_HOST: z.string(),
    EMAIL_SERVER_PORT: z.string(),
    EMAIL_FROM: z.email(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    STRIPE_PRICE_PRO_MONTHLY: z.string(),
    STRIPE_PRICE_PRO_ANNUAL: z.string(),
    STRIPE_PRICE_ULTIMATE_MONTHLY: z.string(),
    STRIPE_PRICE_ULTIMATE_ANNUAL: z.string(),
    STRIPE_PORTAL_CONFIGURATION_ID: z.string(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: z.url().optional()
  },

  client: {},

  runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    ANALYZE: process.env.ANALYZE,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GITHUB_ID: process.env.BETTER_AUTH_GITHUB_ID,
    BETTER_AUTH_GITHUB_SECRET: process.env.BETTER_AUTH_GITHUB_SECRET,
    BETTER_AUTH_GOOGLE_ID: process.env.BETTER_AUTH_GOOGLE_ID,
    BETTER_AUTH_GOOGLE_SECRET: process.env.BETTER_AUTH_GOOGLE_SECRET,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_FROM: process.env.EMAIL_FROM,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_PRICE_PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL,
    STRIPE_PRICE_ULTIMATE_MONTHLY: process.env.STRIPE_PRICE_ULTIMATE_MONTHLY,
    STRIPE_PRICE_ULTIMATE_ANNUAL: process.env.STRIPE_PRICE_ULTIMATE_ANNUAL,
    STRIPE_PORTAL_CONFIGURATION_ID: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL
  },

  emptyStringAsUndefined: true
})
