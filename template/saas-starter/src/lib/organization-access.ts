import 'server-only'

import { and, eq, inArray } from 'drizzle-orm'
import { db } from '~/db'
import { membersTable } from '~/db/schema'
import { AppError, AppErrorCode } from './errors'
import type { OrganizationRole } from './rbac'

/**
 * The caller's membership in an organization, or null when they have none.
 */
export async function getMembership(organizationId: string, userId: string) {
  const membership = await db.query.membersTable.findFirst({
    where: and(
      eq(membersTable.organizationId, organizationId),
      eq(membersTable.userId, userId)
    ),
    columns: { id: true, role: true }
  })

  return membership ?? null
}

/**
 * Asserts the caller belongs to the organization, in any role.
 * Throws {@link AppError} with code FORBIDDEN otherwise.
 */
export async function assertMember(organizationId: string, userId: string) {
  const membership = await getMembership(organizationId, userId)
  if (!membership) {
    throw new AppError(
      AppErrorCode.FORBIDDEN,
      'You do not have access to this organization.'
    )
  }
  return membership
}

/**
 * Asserts the caller holds one of `allowedRoles` in the organization.
 */
export async function assertRole(
  organizationId: string,
  userId: string,
  allowedRoles: ReadonlyArray<OrganizationRole>
) {
  const membership = await db.query.membersTable.findFirst({
    where: and(
      eq(membersTable.organizationId, organizationId),
      eq(membersTable.userId, userId),
      inArray(membersTable.role, [...allowedRoles])
    ),
    columns: { id: true, role: true }
  })
  if (!membership) {
    throw new AppError(
      AppErrorCode.FORBIDDEN,
      'You do not have permission to perform this action.'
    )
  }
  return membership
}

/**
 * Asserts the caller can manage the organization (owner or admin). Use it for
 * settings, billing, members, and uploads.
 */
export function assertCanManageOrganization(
  organizationId: string,
  userId: string
) {
  return assertRole(organizationId, userId, ['owner', 'admin'])
}
