'use client'

import { FC } from 'react'
import { NavigationSearch } from '~/components/navigation-search'
import { getAdminNavigation } from '~/lib/admin-navigation'

export const AdminSearch: FC<{ isSuperAdmin: boolean }> = ({
  isSuperAdmin
}) => {
  return (
    <NavigationSearch
      groups={getAdminNavigation(isSuperAdmin)}
      dialogDescription="Search across all admin pages and settings."
    />
  )
}
