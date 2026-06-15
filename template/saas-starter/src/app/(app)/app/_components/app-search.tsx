'use client'

import { FC } from 'react'
import { NavigationSearch } from '~/components/navigation-search'
import { getAppNavigation } from '~/lib/app-navigation'

export const AppSearch: FC<{ orgId: string; role: string }> = ({
  orgId,
  role
}) => {
  return (
    <NavigationSearch
      groups={getAppNavigation(orgId, role)}
      dialogDescription="Search across this organization's pages and settings."
    />
  )
}
