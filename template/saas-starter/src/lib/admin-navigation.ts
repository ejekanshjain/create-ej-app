/**
 * @fileoverview Admin panel navigation, shared by the sidebar and the
 * command search.
 *
 * @module lib/admin-navigation
 */

import { Home, MessageCircle, MessageSquare, Ticket, Users } from 'lucide-react'
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
    label: 'Customers',
    items: [
      {
        title: 'Support Tickets',
        url: '/admin/support-tickets',
        icon: Ticket
      },
      {
        title: 'Feedback',
        url: '/admin/feedbacks',
        icon: MessageCircle
      },
      {
        title: 'Contact Leads',
        url: '/admin/contact-leads',
        icon: MessageSquare
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
