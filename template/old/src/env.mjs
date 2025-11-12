import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']),
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      str => process.env.VERCEL_URL ?? str,
      process.env.VERCEL ? z.string().min(1) : z.string().url()
    ),
    EMAIL_SERVER_HOST: z.string().min(1),
    EMAIL_SERVER_PORT: z.number(),
    EMAIL_SERVER_USER: z.string().min(1),
    EMAIL_SERVER_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    GOOGLE_ID: z.string().min(1),
    GOOGLE_SECRET: z.string().min(1),
    GITHUB_ID: z.string().min(1),
    GITHUB_SECRET: z.string().min(1),
    S3_REGION: z.string().min(1),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(1)
  },

  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: parseInt(process.env.EMAIL_SERVER_PORT || ''),
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true
})
