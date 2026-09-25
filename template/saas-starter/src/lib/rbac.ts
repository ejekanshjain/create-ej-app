/**
 * Organization role predicates and labels, shared by server and client.
 *
 * The roles are the Better Auth organization plugin defaults:
 *   - owner: full control, including ownership transfer and deletion
 *   - admin: manages settings, billing, and members, but not ownership
 *   - member: standard access to the organization's workspace
 */

export type OrganizationRole = 'owner' | 'admin' | 'member'

/** Roles an owner or admin can give to someone. Ownership moves only by transfer. */
export const ASSIGNABLE_ROLES = ['admin', 'member'] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

/** True for the manager tier: owner and admin. */
export function isManagerRole(role: string | null | undefined): boolean {
  return role === 'owner' || role === 'admin'
}

/** Descriptions shown when you pick a role for a member or an invitation. */
export const ROLE_DESCRIPTIONS: Record<AssignableRole, string> = {
  admin: 'Admin: manage settings, billing, and members',
  member: 'Member: use the workspace'
}

/** Shown to an owner before they transfer ownership to another member. */
export const OWNERSHIP_DEMOTION_NOTICE =
  'After the transfer, your role becomes admin: you keep every permission except ownership transfer and organization deletion.'

/** Role with its article, for sentences such as "join Acme as an admin". */
export function roleArticle(role: string): string {
  switch (role) {
    case 'owner':
      return 'an owner'
    case 'admin':
      return 'an admin'
    case 'member':
      return 'a member'
    default:
      return `a ${role}`
  }
}
