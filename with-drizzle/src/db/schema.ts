import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core'

export const Account = pgTable(
  'Accounts',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => User.id),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 })
  },
  account => ({
    userIdIdx: index('Accounts_idx_userId').on(account.userId),
    uniqueProviderAccount: unique('Accounts_uq_provider_providerAccountId').on(
      account.provider,
      account.providerAccountId
    )
  })
)

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] })
}))

export const Session = pgTable(
  'Sessions',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => User.id),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true
    }).notNull(),
    createdAt: timestamp('createdAt', {
      mode: 'date',
      withTimezone: true
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt', {
      mode: 'date',
      withTimezone: true
    })
  },
  session => ({
    userIdIdx: index('Sessions_idx_userId').on(session.userId)
  })
)

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] })
}))

export const Role = pgTable('Roles', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: true
  })
})

export const RoleRelations = relations(Role, ({ many }) => ({
  permissions: many(RolePermission),
  users: many(User)
}))

export const PermissionEnum = pgEnum('PermissionEnum', [
  'TaskList',
  'TaskView',
  'TaskCreate',
  'TaskUpdate',
  'TaskDelete'
])

export const RolePermission = pgTable(
  'RolePermissions',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    roleId: text('roleId')
      .notNull()
      .references(() => Role.id, {
        onDelete: 'cascade'
      }),
    permission: PermissionEnum('permission').notNull()
  },
  rp => ({
    roleIdIdx: index('RolePermissions_idx_roleId').on(rp.roleId),
    uniqueRolePermission: unique('RolePermissions_uq_roleId_permission').on(
      rp.roleId,
      rp.permission
    )
  })
)

export const RolePermissionRelations = relations(RolePermission, ({ one }) => ({
  role: one(Role, { fields: [RolePermission.roleId], references: [Role.id] })
}))

export const UserTypeEnum = pgEnum('UserTypeEnum', ['Root', 'Normal'])

export const User = pgTable('Users', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('emailVerified', {
    mode: 'date',
    withTimezone: true
  }),
  image: varchar('image', { length: 255 }),
  type: UserTypeEnum('type').notNull().default('Normal'),
  roleId: text('roleId').references(() => Role.id),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: true
  })
})

export const UserRelations = relations(User, ({ many, one }) => ({
  accounts: many(Account),
  sessions: many(Session),
  role: one(Role, {
    fields: [User.roleId],
    references: [Role.id]
  })
}))

export const VerificationToken = pgTable(
  'VerificationTokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true
    }).notNull()
  },
  vt => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] })
  })
)

export const TaskStatusEnum = pgEnum('TaskStatusEnum', [
  'Backlog',
  'Todo',
  'In_Progress',
  'Done',
  'Cancelled'
])

export const Task = pgTable('Tasks', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar('title', { length: 255 }).notNull(),
  status: TaskStatusEnum('status').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: true
  }),
  createdById: text('createdById')
    .notNull()
    .references(() => User.id),
  updatedById: text('updatedById').references(() => User.id)
})

export const TaskRelations = relations(Task, ({ one, many }) => ({
  createdBy: one(User, {
    fields: [Task.createdById],
    references: [User.id]
  }),
  updatedBy: one(User, {
    fields: [Task.updatedById],
    references: [User.id]
  }),
  images: many(Resource)
}))

export const Resource = pgTable(
  'Resources',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    filename: varchar('filename', { length: 255 }).notNull(),
    key: varchar('key', { length: 255 }).notNull().unique(),
    url: varchar('url', { length: 255 }).notNull().unique(),
    taskId: text('taskId').references(() => Task.id),
    createdAt: timestamp('createdAt', {
      mode: 'date',
      withTimezone: true
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt', {
      mode: 'date',
      withTimezone: true
    })
  },
  resource => ({
    taskIdIdx: index('Resources_idx_taskId').on(resource.taskId)
  })
)

export const ResourceRelations = relations(Resource, ({ one }) => ({
  task: one(Task, {
    fields: [Resource.taskId],
    references: [Task.id]
  })
}))
