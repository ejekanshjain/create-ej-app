'use client'

import { useParams } from 'next/navigation'
import { NavigationSidebar } from '~/components/navigation-sidebar'
import { getAppNavigation, type UserOrganization } from '~/lib/app-navigation'
import { OrganizationSwitcher } from './organization-switcher'

export function AppSidebar({
  organizations
}: {
  organizations: UserOrganization[]
}) {
  const params = useParams()
  const orgId = params?.orgId as string | undefined
  const role = organizations.find(o => o.id === orgId)?.role

  if (!orgId || !role) {
    return null
  }

  return (
    <NavigationSidebar
      groups={getAppNavigation(orgId, role)}
      header={<OrganizationSwitcher organizations={organizations} />}
    />
  )
}
