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
  isImpersonating: boolean
}> = ({ user, isSuperAdmin, isImpersonating }) => {
  return (
    <DashboardHeader
      user={user}
      isSuperAdmin={isSuperAdmin}
      isImpersonating={isImpersonating}
      search={<AdminSearch isSuperAdmin={isSuperAdmin} />}
    />
  )
}
