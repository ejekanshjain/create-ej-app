import { afterEach, describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { createFeedbackAction } from '~/app/(app)/actions/feedbacks'
import { getMembers } from '~/app/(app)/actions/members'
import {
  getOrganization,
  transferOrganizationOwnershipAction,
  updateOrganizationAction
} from '~/app/(app)/actions/organizations'
import { db } from '~/db'
import { membersTable, organizationsTable } from '~/db/schema'
import {
  asUser,
  expectData,
  expectServerError,
  expectValidationError,
  Fixtures
} from '../helpers'

const PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgo='

describe('organization access', () => {
  const fx = new Fixtures()
  afterEach(() => fx.cleanup())

  test('an outsider gets no data for an organization', async () => {
    const ws = await fx.workspace()
    const outsider = await fx.user()

    const result = await asUser(outsider, () =>
      getOrganization(ws.organization.id)
    )

    expect(result?.data ?? null).toBeNull()
  })

  test('members cannot manage settings or list members', async () => {
    const ws = await fx.workspace()

    const update = await asUser(ws.member, () =>
      updateOrganizationAction({
        organizationId: ws.organization.id,
        name: 'Renamed',
        slug: 'renamed',
        logo: ''
      })
    )
    expectServerError(update, 'permission')

    const members = await asUser(ws.member, () =>
      getMembers({ organizationId: ws.organization.id, page: 1, limit: 10 })
    )
    expectServerError(members, 'permission')
  })

  test('an admin can rename the organization and set a data URL logo without R2', async () => {
    const ws = await fx.workspace()

    const result = await asUser(ws.admin, () =>
      updateOrganizationAction({
        organizationId: ws.organization.id,
        name: 'Renamed Org',
        slug: `renamed-${ws.organization.id.slice(-8)}`,
        logo: PNG_DATA_URL
      })
    )
    expectData(result)

    const org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.id, ws.organization.id)
    })
    expect(org?.name).toBe('Renamed Org')
    expect(org?.logo).toBe(PNG_DATA_URL)
  })

  test("an organization cannot use another organization's upload as its logo", async () => {
    const mine = await fx.workspace()
    const theirs = await fx.workspace()
    const foreign = await fx.upload(theirs.organization.id, theirs.owner.id)

    const result = await asUser(mine.owner, () =>
      updateOrganizationAction({
        organizationId: mine.organization.id,
        name: mine.organization.name,
        slug: mine.organization.slug,
        logo: foreign.key
      })
    )
    expectServerError(result, 'permission')
  })

  test('external image URLs are rejected before the action runs', async () => {
    const ws = await fx.workspace()

    const result = await asUser(ws.owner, () =>
      updateOrganizationAction({
        organizationId: ws.organization.id,
        name: ws.organization.name,
        slug: ws.organization.slug,
        logo: 'https://example.com/logo.png'
      })
    )
    expectValidationError(result)
  })

  test('a duplicate slug returns a message you can act on', async () => {
    const mine = await fx.workspace()
    const theirs = await fx.workspace()

    const result = await asUser(mine.owner, () =>
      updateOrganizationAction({
        organizationId: mine.organization.id,
        name: mine.organization.name,
        slug: theirs.organization.slug,
        logo: ''
      })
    )
    expectServerError(result, 'slug')
  })

  test('only the owner can transfer ownership, and they become an admin', async () => {
    const ws = await fx.workspace()
    const adminMembership = await db.query.membersTable.findFirst({
      where: eq(membersTable.userId, ws.admin.id)
    })

    const byAdmin = await asUser(ws.admin, () =>
      transferOrganizationOwnershipAction({
        organizationId: ws.organization.id,
        targetMemberId: adminMembership!.id
      })
    )
    expectServerError(byAdmin, 'permission')

    const byOwner = await asUser(ws.owner, () =>
      transferOrganizationOwnershipAction({
        organizationId: ws.organization.id,
        targetMemberId: adminMembership!.id
      })
    )
    expectData(byOwner)

    const roles = await db
      .select({ userId: membersTable.userId, role: membersTable.role })
      .from(membersTable)
      .where(eq(membersTable.organizationId, ws.organization.id))
    const roleOf = (userId: string) =>
      roles.find(row => row.userId === userId)?.role
    expect(roleOf(ws.admin.id)).toBe('owner')
    expect(roleOf(ws.owner.id)).toBe('admin')
  })

  test('feedback requires membership in the organization', async () => {
    const ws = await fx.workspace()
    const outsider = await fx.user()

    const denied = await asUser(outsider, () =>
      createFeedbackAction({
        organizationId: ws.organization.id,
        rating: 5,
        comment: 'Looks great.'
      })
    )
    expectServerError(denied, 'access')

    const allowed = await asUser(ws.member, () =>
      createFeedbackAction({
        organizationId: ws.organization.id,
        rating: 4,
        comment: 'Looks great.'
      })
    )
    expectData(allowed)
  })
})
