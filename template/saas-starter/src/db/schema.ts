/**
 * @fileoverview Drizzle table definitions.
 *
 * Enums live in `./enums.ts` and reusable column helpers in `./common.ts`.
 * Every foreign key leads an index and declares an explicit `onDelete`;
 * `tests/db/fk-indexes.test.ts` enforces both.
 */
import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core'
import { commonFieldDefs, nonNegativeCheck } from './common'
import {
  organizationSubscriptionIntervalEnum,
  organizationSubscriptionPlanEnum,
  organizationSubscriptionStatusEnum,
  supportTicketPriorityEnum,
  supportTicketStatusEnum
} from './enums'

export * from './enums'

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
    activeOrganizationId: text('active_organization_id'),
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

// ─── Organizations (Better Auth) ────────────────────────────────

export const organizationsTable = pgTable('organizations', {
  id: commonFieldDefs.id('organization'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  ...commonFieldDefs.dates
})

export const membersTable = pgTable(
  'members',
  {
    id: commonFieldDefs.id('member'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    ...commonFieldDefs.dates
  },
  table => [
    uniqueIndex().on(table.organizationId, table.userId),
    index().on(table.userId)
  ]
)

export const invitationsTable = pgTable(
  'invitations',
  {
    id: commonFieldDefs.id('invitation'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: commonFieldDefs.date('expires_at'),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.organizationId),
    index().on(table.email),
    index().on(table.inviterId),
    uniqueIndex()
      .on(table.organizationId, table.email)
      .where(sql`${table.status} = 'pending'`)
  ]
)

// ─── Billing ────────────────────────────────────────────────────

export const organizationSubscriptionsTable = pgTable(
  'organization_subscriptions',
  {
    id: commonFieldDefs.id('organization_subscription'),
    organizationId: text('organization_id')
      .notNull()
      .unique()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    plan: organizationSubscriptionPlanEnum('plan').notNull().default('free'),
    status: organizationSubscriptionStatusEnum('status')
      .notNull()
      .default('free'),
    interval: organizationSubscriptionIntervalEnum('interval'),
    billingEmail: text('billing_email'),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    hasUsedTrial: boolean('has_used_trial').notNull().default(false),
    trialEndsAt: commonFieldDefs.date('trial_ends_at'),
    currentPeriodEnd: commonFieldDefs.date('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    ...commonFieldDefs.dates
  }
)

/** One row per Stripe event, so a redelivered webhook is processed once. */
export const stripeWebhooksEventsTable = pgTable('stripe_webhooks_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: commonFieldDefs.date('received_at').notNull().defaultNow(),
  processed: boolean('processed').notNull().default(false),
  processedAt: commonFieldDefs.date('processed_at'),
  error: text('error'),
  // Stored only when processing fails, for replay and debugging.
  payload: jsonb('payload')
})

// ─── Support ────────────────────────────────────────────────────

/** Single-row counter behind `TICKET-000001` numbers; see `scripts/setup-db.ts`. */
export const supportTicketCounterTable = pgTable(
  'support_ticket_counter',
  {
    id: integer('id').primaryKey().default(1),
    counter: integer('counter').notNull().default(0)
  },
  table => [
    nonNegativeCheck('support_ticket_counter_counter_non_negative', [
      table.counter
    ])
  ]
)

/**
 * A ticket with an `organizationId` belongs to that organization's managers.
 * A ticket without one is an account ticket, visible only to its author.
 * Platform admins see both.
 */
export const supportTicketsTable = pgTable(
  'support_tickets',
  {
    id: commonFieldDefs.id('support_ticket'),
    // The database fills this in from a trigger; see `scripts/setup-db.ts`.
    ticketNumber: varchar('ticket_number')
      .notNull()
      .unique()
      .$defaultFn(() => ''),
    organizationId: varchar('organization_id').references(
      () => organizationsTable.id,
      { onDelete: 'set null' }
    ),
    userId: varchar('user_id').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    subject: varchar('subject').notNull(),
    status: supportTicketStatusEnum('status').notNull().default('open'),
    priority: supportTicketPriorityEnum('priority'),
    resolvedAt: commonFieldDefs.date('resolved_at'),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.userId, table.createdAt),
    index().on(table.organizationId, table.createdAt),
    index().on(table.status),
    index().on(table.priority)
  ]
)

export const supportTicketMessagesTable = pgTable(
  'support_ticket_messages',
  {
    id: commonFieldDefs.id('support_ticket_message'),
    ticketId: varchar('ticket_id')
      .notNull()
      .references(() => supportTicketsTable.id, { onDelete: 'cascade' }),
    userId: varchar('user_id').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    message: text('message').notNull(),
    /** True when the support team wrote it, even if the author is also a customer. */
    isAdmin: boolean('is_admin').notNull().default(false),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.ticketId), index().on(table.userId)]
)

export const feedbacksTable = pgTable(
  'feedbacks',
  {
    id: commonFieldDefs.id('feedback'),
    userId: varchar('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    organizationId: varchar('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.userId),
    index().on(table.organizationId, table.createdAt),
    index().on(table.createdAt),
    check('feedbacks_rating_range', sql`${table.rating} BETWEEN 1 AND 5`)
  ]
)

export const contactLeadsTable = pgTable(
  'contact_leads',
  {
    id: commonFieldDefs.id('contact_lead'),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    phone: varchar('phone'),
    subject: varchar('subject').notNull(),
    message: text('message').notNull(),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.createdAt)]
)

// ─── Uploads ────────────────────────────────────────────────────

export const fileUploadsTable = pgTable(
  'file_uploads',
  {
    id: commonFieldDefs.id('file_upload'),
    // Object key, such as uploads/organizations/<organizationId>/<file>.jpg
    key: text('key').notNull().unique(),
    originalName: varchar('original_name').notNull(),
    mimeType: varchar('mime_type').notNull(),
    // In bytes
    size: integer('size').notNull(),
    isTemp: boolean('is_temp').notNull().default(true),
    uploadedBy: varchar('uploaded_by').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    // `restrict` forces organization deletion to remove the R2 objects first;
    // see `deleteOrganizationUploads`.
    organizationId: varchar('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'restrict' }),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.uploadedBy),
    index().on(table.organizationId),
    index().on(table.isTemp, table.createdAt),
    nonNegativeCheck('file_uploads_size_non_negative', [table.size])
  ]
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
