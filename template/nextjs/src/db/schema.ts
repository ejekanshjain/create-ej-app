/**
 * @fileoverview Drizzle table definitions.
 *
 * Reusable column helpers live in `./common.ts`. Put Postgres enums in a
 * sibling `./enums.ts` and re-export them from here.
 * Every foreign key leads an index and declares an explicit `onDelete`;
 * `tests/db/fk-indexes.test.ts` enforces both.
 */
import { boolean, index, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { commonFieldDefs } from './common'

// ─── Auth (Better Auth) ─────────────────────────────────────────

export const usersTable = pgTable(
  'users',
  {
    id: commonFieldDefs.id('user'),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    role: text('role'),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: commonFieldDefs.date('ban_expires'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.createdAt), index().on(table.role)]
)

export const sessionsTable = pgTable(
  'sessions',
  {
    id: commonFieldDefs.id('session'),
    expiresAt: commonFieldDefs.date('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.userId)]
)

export const accountsTable = pgTable(
  'accounts',
  {
    id: commonFieldDefs.id('account'),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: commonFieldDefs.date('access_token_expires_at'),
    refreshTokenExpiresAt: commonFieldDefs.date('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.userId)]
)

export const verificationsTable = pgTable(
  'verifications',
  {
    id: commonFieldDefs.id('verification'),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: commonFieldDefs.date('expires_at').notNull(),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.identifier)]
)

// ─── Seed ───────────────────────────────────────────────────────

/**
 * Singleton marker for a successful `seedDatabase` run. While
 * {@link SEED_RUN_MARKER_ID} exists, the seed script does nothing.
 */
export const SEED_RUN_MARKER_ID = 'seed_run_default'

export const seedRunsTable = pgTable('seed_runs', {
  id: varchar('id').primaryKey(),
  ...commonFieldDefs.dates
})
