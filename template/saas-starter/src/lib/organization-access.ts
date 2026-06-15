import 'server-only'

import { and, count, desc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '~/db'
import { membersTable, organizationsTable } from '~/db/schema'
import type { UserOrganization } from './app-navigation'
import { getAuthSession } from './auth'
import { resolveImageUrl } from './storage'

const getUserOrganizations = async (): Promise<UserOrganization[]> => {
  const session = await getAuthSession()
  if (!session) return []

  const orgs = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      slug: organizationsTable.slug,
      logo: organizationsTable.logo,
      role: membersTable.role,
      userId: membersTable.userId,
      memberId: membersTable.id
    })
    .from(membersTable)
    .innerJoin(
      organizationsTable,
      eq(membersTable.organizationId, organizationsTable.id)
    )
    .where(eq(membersTable.userId, session.user.id))
    .orderBy(desc(membersTable.createdAt))

  return orgs.map(o => ({ ...o, logo: resolveImageUrl(o.logo) }))
}

export const getUserOrganizationsCached = cache(getUserOrganizations)

export const getUserMembershipCached = cache(async (organizationId: string) => {
  const session = await getAuthSession()
  if (!session) return null

  const member = await db.query.membersTable.findFirst({
    where: and(
      eq(membersTable.organizationId, organizationId),
      eq(membersTable.userId, session.user.id)
    )
  })

  return member ?? null
})

export const getOrganizationMembers = cache(async (organizationId: string) =>
  db.query.membersTable.findMany({
    where: eq(membersTable.organizationId, organizationId),
    with: {
      user: {
        columns: { id: true, name: true, email: true, image: true }
      }
    },
    orderBy: [desc(membersTable.createdAt)]
  })
)

export const getOrganizationMemberCount = cache(
  async (organizationId: string) => {
    const [row] = await db
      .select({ count: count() })
      .from(membersTable)
      .where(eq(membersTable.organizationId, organizationId))

    return row?.count ?? 0
  }
)

export const assertUserMembership = async (organizationId: string) => {
  const membership = await getUserMembershipCached(organizationId)
  if (!membership) {
    throw new Error('User does not have access to this organization')
  }
  return membership
}

const MANAGER_ROLES = ['owner', 'admin']

export const assertUserCanManageOrganization = async (
  organizationId: string
) => {
  const membership = await getUserMembershipCached(organizationId)
  if (!membership || !MANAGER_ROLES.includes(membership.role)) {
    throw new Error('User does not have permission to manage this organization')
  }
  return membership
}
