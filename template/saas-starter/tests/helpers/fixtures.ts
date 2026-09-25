/**
 * Throwaway DB fixtures and auth helpers for Bun tests.
 *
 *   const fx = new Fixtures()
 *   afterEach(() => fx.cleanup())
 *   const ws = await fx.workspace({ plan: 'pro' })
 *   await asUser(ws.owner, () => someAction(...))
 */
import { createId } from '@paralleldrive/cuid2'
import { inArray } from 'drizzle-orm'
import { db } from '~/db'
import {
  fileUploadsTable,
  membersTable,
  organizationSubscriptionsTable,
  organizationsTable,
  supportTicketsTable,
  usersTable
} from '~/db/schema'
import { runWithAuthSession } from '../setup/preload'

type User = typeof usersTable.$inferSelect
type PlanId = (typeof organizationSubscriptionsTable.$inferInsert)['plan']

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

export class Fixtures {
  private userIds: string[] = []
  private organizationIds: string[] = []

  async user(
    overrides: { name?: string; email?: string; role?: string | null } = {}
  ): Promise<User> {
    const s = uid()
    const [row] = await db
      .insert(usersTable)
      .values({
        id: `user_${createId()}`,
        name: overrides.name ?? `Test User ${s}`,
        email: overrides.email ?? `test+${s}@example.com`,
        emailVerified: true,
        role: overrides.role ?? 'user'
      })
      .returning()
    if (!row) throw new Error('Failed to create test user')
    this.userIds.push(row.id)
    return row
  }

  /** Platform user for admin-panel tests. Belongs to no organization. */
  platformUser(role: 'admin' | 'superadmin') {
    return this.user({ name: `Platform ${role}`, role })
  }

  /**
   * An organization with an owner, an admin, and a member, plus its
   * subscription row. A paid `plan` gets an active subscription.
   */
  async workspace(options: { plan?: PlanId } = {}) {
    const plan = options.plan ?? 'free'
    const owner = await this.user({ name: 'Test Owner' })
    const admin = await this.user({ name: 'Test Admin' })
    const member = await this.user({ name: 'Test Member' })

    const s = uid()
    const [organization] = await db
      .insert(organizationsTable)
      .values({ name: `Test Organization ${s}`, slug: `test-org-${s}` })
      .returning()
    if (!organization) throw new Error('Failed to create test organization')
    this.organizationIds.push(organization.id)

    await db.insert(membersTable).values([
      { organizationId: organization.id, userId: owner.id, role: 'owner' },
      { organizationId: organization.id, userId: admin.id, role: 'admin' },
      { organizationId: organization.id, userId: member.id, role: 'member' }
    ])

    await db.insert(organizationSubscriptionsTable).values({
      organizationId: organization.id,
      plan,
      status: plan === 'free' ? 'free' : 'active'
    })

    return { organization, owner, admin, member }
  }

  /** Records an upload the way `generateUploadUrl` does, without R2. */
  async upload(organizationId: string, uploadedBy: string) {
    const fileId = createId()
    const [row] = await db
      .insert(fileUploadsTable)
      .values({
        key: `uploads/organizations/${organizationId}/${fileId}.png`,
        originalName: 'logo.png',
        mimeType: 'image/png',
        size: 1024,
        uploadedBy,
        organizationId
      })
      .returning()
    if (!row) throw new Error('Failed to create test upload')
    return row
  }

  async cleanup() {
    if (this.organizationIds.length) {
      // `file_uploads` restricts organization deletes, as in production.
      await db
        .delete(fileUploadsTable)
        .where(inArray(fileUploadsTable.organizationId, this.organizationIds))
      await db
        .delete(organizationsTable)
        .where(inArray(organizationsTable.id, this.organizationIds))
      this.organizationIds = []
    }
    if (this.userIds.length) {
      await db
        .delete(supportTicketsTable)
        .where(inArray(supportTicketsTable.userId, this.userIds))
      await db.delete(usersTable).where(inArray(usersTable.id, this.userIds))
      this.userIds = []
    }
  }
}

/** Runs `fn` with `getAuthSession()` returning this user. */
export function asUser<T>(user: User, fn: () => Promise<T>): Promise<T> {
  const isSuperAdmin = user.role === 'superadmin'
  const isAdmin = user.role === 'admin' || isSuperAdmin
  return runWithAuthSession(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      session: { id: `test_session_${user.id}`, userId: user.id },
      isAdmin,
      isSuperAdmin
    },
    fn
  )
}

/** Runs `fn` signed out. */
export function asAnonymous<T>(fn: () => Promise<T>): Promise<T> {
  return runWithAuthSession(null, fn)
}
