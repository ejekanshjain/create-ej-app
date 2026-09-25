/**
 * Throwaway DB fixtures and auth helpers for Bun tests.
 *
 *   const fx = new Fixtures()
 *   afterEach(() => fx.cleanup())
 *   const admin = await fx.platformUser('superadmin')
 *   await asUser(admin, () => someAction(...))
 */
import { createId } from '@paralleldrive/cuid2'
import { inArray } from 'drizzle-orm'
import { db } from '~/db'
import { usersTable } from '~/db/schema'
import { runWithAuthSession } from '../setup/preload'

type User = typeof usersTable.$inferSelect

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

export class Fixtures {
  private userIds: string[] = []

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

  /** Platform user for admin-panel tests. */
  platformUser(role: 'admin' | 'superadmin') {
    return this.user({ name: `Platform ${role}`, role })
  }

  async cleanup() {
    if (this.userIds.length) {
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
