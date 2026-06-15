'use client'

import { FC } from 'react'
import { DashboardHeader } from '~/components/dashboard-header'
import { AdminSearch } from './admin-search'

export const AdminHeader: FC<{
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  isSuperAdmin: boolean
}> = ({ user, isSuperAdmin }) => {
  return (
    <DashboardHeader
      user={user}
      search={<AdminSearch isSuperAdmin={isSuperAdmin} />}
    />
  )
}
