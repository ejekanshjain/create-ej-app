/**
 * @fileoverview Admin panel navigation, shared by the sidebar and the
 * command search.
 *
 * @module lib/admin-navigation
 */

import { Home, Users } from 'lucide-react'
import { SidebarNavGroup } from '~/components/navigation-sidebar'

const adminNavigation: SidebarNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        exact: true,
        icon: Home
      }
    ]
  },
  {
    label: 'Settings',
    superadminOnly: true,
    items: [
      {
        title: 'Users & Roles',
        url: '/admin/settings/users',
        icon: Users
      }
    ]
  }
]

/**
 * The admin navigation visible to the current user. Superadmin-only groups
 * are hidden from `admin` users.
 */
export const getAdminNavigation = (isSuperAdmin: boolean): SidebarNavGroup[] =>
  isSuperAdmin
    ? adminNavigation
    : adminNavigation.filter(group => !group.superadminOnly)
