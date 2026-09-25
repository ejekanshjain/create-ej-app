import { afterEach, describe, test } from 'bun:test'
import { createUser, getUsers, updateUser } from '~/app/(admin)/actions/users'
import {
  asAnonymous,
  asUser,
  expectData,
  expectServerError,
  Fixtures
} from '../helpers'

describe('admin user management', () => {
  const fx = new Fixtures()
  afterEach(() => fx.cleanup())

  test('signed-out and regular users cannot reach admin actions', async () => {
    const user = await fx.user()

    expectServerError(
      await asAnonymous(() => getUsers({ page: 1, limit: 10 })),
      'sign in'
    )
    expectServerError(
      await asUser(user, () => getUsers({ page: 1, limit: 10 })),
      'permission'
    )
  })

  test('a superadmin cannot remove their own superadmin role', async () => {
    const superadmin = await fx.platformUser('superadmin')

    const result = await asUser(superadmin, () =>
      updateUser({
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email,
        role: 'admin'
      })
    )

    expectServerError(result, 'your own superadmin role')
  })

  test('admins cannot manage users; superadmins can', async () => {
    const admin = await fx.platformUser('admin')
    const superadmin = await fx.platformUser('superadmin')

    expectServerError(
      await asUser(admin, () => getUsers({ page: 1, limit: 10 })),
      'permission'
    )
    expectData(await asUser(superadmin, () => getUsers({ page: 1, limit: 10 })))
  })

  test('creating a user with a taken email explains the conflict', async () => {
    const superadmin = await fx.platformUser('superadmin')
    const existing = await fx.user()

    const result = await asUser(superadmin, () =>
      createUser({ name: 'Duplicate', email: existing.email, role: 'user' })
    )

    expectServerError(result, 'already uses this email')
  })
})
