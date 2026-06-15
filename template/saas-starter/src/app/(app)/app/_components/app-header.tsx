'use client'

import { useParams } from 'next/navigation'
import { FC } from 'react'
import { DashboardHeader } from '~/components/dashboard-header'
import type { UserOrganization } from '~/lib/app-navigation'
import { AppSearch } from './app-search'

export const AppHeader: FC<{
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  organizations: UserOrganization[]
}> = ({ user, organizations }) => {
  const params = useParams()
  const orgId = params?.orgId as string | undefined
  const role = organizations.find(o => o.id === orgId)?.role

  return (
    <DashboardHeader
      user={user}
      search={
        orgId && role ? <AppSearch orgId={orgId} role={role} /> : undefined
      }
    />
  )
}
