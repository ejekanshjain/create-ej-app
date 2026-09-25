/**
 * @fileoverview Access-control definitions for the Better Auth admin plugin.
 *
 * The platform has three roles:
 *
 * - `superadmin`: full control of the admin panel. Can list, view, create,
 *   update, change the role of, ban and impersonate any user (including other
 *   admins and superadmins).
 * - `admin`: can open the admin panel and work with customer-facing data
 *   (support tickets, feedback, and contact leads), but is intentionally
 *   granted no user-management or impersonation permissions.
 * - `user`: a regular customer with no admin-panel access
 *
 * These statements/roles are shared by both the server (`auth.ts`) and the
 * client (`auth-client.ts`) so permission checks stay consistent everywhere.
 *
 * @module lib/auth-permissions
 */

import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements } from 'better-auth/plugins/admin/access'

/**
 * The full set of permissions available across the admin panel.
 *
 * `defaultStatements` contributes the admin plugin's built-in `user` and
 * `session` resources.
 */
export const statement = { ...defaultStatements } as const

export const ac = createAccessControl(statement)

/** Regular customer with no admin-panel privileges. */
export const user = ac.newRole({})

/**
 * Operational admin who can open the admin panel but has no
 * `user` or `session` permissions. User management and impersonation are
 * therefore denied.
 */
export const admin = ac.newRole({})

/**
 * Full-control admin who receives every built-in user/session permission,
 * including `impersonate-admins`.
 *
 * Each resource is granted explicitly rather than spreading
 * `defaultStatements` (which is the statement *definition*, not a grant).
 * This way a newly added resource is denied by default until it is
 * deliberately listed here.
 */
export const superadmin = ac.newRole({
  user: [...defaultStatements.user],
  session: [...defaultStatements.session]
})

/** Role map passed to the admin plugin on both server and client. */
export const roles = { user, admin, superadmin }

/** Roles that are allowed to reach the admin panel at all. */
export const adminRoles = ['admin', 'superadmin'] as const
