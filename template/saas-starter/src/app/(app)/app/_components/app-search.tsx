'use client'

import { useParams } from 'next/navigation'
import { NavigationSearch } from '~/components/navigation-search'
import { getAppNavigation } from '~/lib/app-navigation'

export function AppSearch({
  organizations
}: {
  organizations: { id: string; role: string }[]
}) {
  const params = useParams()
  const orgId = params?.orgId as string | undefined
  const role = organizations.find(o => o.id === orgId)?.role

  if (!orgId || !role) {
    return null
  }

  return (
    <NavigationSearch
      groups={getAppNavigation(orgId, role)}
      dialogDescription="Search this organization's pages and settings."
    />
  )
}
