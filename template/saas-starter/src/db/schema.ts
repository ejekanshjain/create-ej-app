import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core'
import { commonFieldDefs } from './common'
import {
  organizationSubscriptionIntervalEnum,
  organizationSubscriptionPlanEnum,
  organizationSubscriptionStatusEnum
} from './enums'

export * from './enums'

export const usersTable = pgTable('users', {
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
})

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

export const verificationsTable = pgTable('verifications', {
  id: commonFieldDefs.id('verification'),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: commonFieldDefs.date('expires_at').notNull(),
  ...commonFieldDefs.dates
})

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
  table => [index().on(table.organizationId), index().on(table.userId)]
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
      .references(() => usersTable.id, {
        onDelete: 'cascade'
      }),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.organizationId),
    index().on(table.email),
    uniqueIndex()
      .on(table.organizationId, table.email)
      .where(sql`${table.status} = 'pending'`)
  ]
)

export const organizationSubscriptionsTable = pgTable(
  'organization_subscriptions',
  {
    id: commonFieldDefs.id('organization_subscription'),
    organizationId: text('organization_id')
      .notNull()
      .unique()
      .references(() => organizationsTable.id),
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

export const stripeWebhooksEventsTable = pgTable('stripe_webhooks_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: commonFieldDefs.date('received_at').notNull().defaultNow(),
  processed: boolean('processed').notNull().default(false),
  processedAt: commonFieldDefs.date('processed_at'),
  error: text('error'),
  payload: jsonb('payload') // store only on error
})

export const fileUploadsTable = pgTable(
  'file_uploads',
  {
    id: varchar('id').primaryKey(),
    // Object path e.g. uploads/organizations/organizationId/filename.jpg
    key: text('key').notNull().unique(),
    originalName: varchar('original_name').notNull(),
    mimeType: varchar('mime_type').notNull(),
    // In Bytes
    size: integer('size').notNull(),
    isTemp: boolean('is_temp').notNull().default(true),
    uploadedBy: varchar('uploaded_by').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    // Nullable: scopes upload to a organization for cleanup purposes
    organizationId: varchar('organization_id').references(
      () => organizationsTable.id
    ),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.uploadedBy),
    index().on(table.isTemp, table.createdAt)
  ]
)
