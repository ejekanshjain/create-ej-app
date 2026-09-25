import { CreditCard, Home, Settings, Ticket, Users } from 'lucide-react'
import { SidebarNavGroup } from '~/components/navigation-sidebar'
import { isManagerRole } from './rbac'

/**
 * Sidebar and command-search entries for one organization. Managers (owner
 * and admin) also get support and settings pages.
 */
export function getAppNavigation(
  organizationId: string,
  role: string
): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [
    {
      label: 'Workspace',
      items: [
        {
          title: 'Dashboard',
          url: `/app/${organizationId}/dashboard`,
          icon: Home
        }
      ]
    }
  ]

  if (isManagerRole(role)) {
    groups.push(
      {
        label: 'Help',
        items: [
          {
            title: 'Support',
            url: `/app/${organizationId}/support-tickets`,
            icon: Ticket
          }
        ]
      },
      {
        label: 'Settings',
        items: [
          {
            title: 'General',
            url: `/app/${organizationId}/settings`,
            icon: Settings,
            exact: true
          },
          {
            title: 'Members',
            url: `/app/${organizationId}/settings/members`,
            icon: Users
          },
          {
            title: 'Billing',
            url: `/app/${organizationId}/settings/billing`,
            icon: CreditCard
          }
        ]
      }
    )
  }

  return groups
}
