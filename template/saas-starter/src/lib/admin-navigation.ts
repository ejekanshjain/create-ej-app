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
    items: [
      {
        title: 'Users & Roles',
        url: '/admin/settings/users',
        icon: Users
      }
    ]
  }
]

export const getAdminNavigation = (isSuperAdmin: boolean): SidebarNavGroup[] =>
  isSuperAdmin
    ? adminNavigation
    : adminNavigation.filter(group => !group.superadminOnly)
