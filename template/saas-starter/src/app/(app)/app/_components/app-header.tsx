'use client'

import { DashboardHeader } from '~/components/dashboard-header'
import { AppSearch } from './app-search'
import { FeedbackDialog } from './feedback-dialog'

export function AppHeader({
  user,
  organizations,
  isSuperAdmin,
  isImpersonating
}: {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  organizations: { id: string; role: string }[]
  isSuperAdmin: boolean
  isImpersonating: boolean
}) {
  return (
    <DashboardHeader
      user={user}
      isSuperAdmin={isSuperAdmin}
      isImpersonating={isImpersonating}
      search={<AppSearch organizations={organizations} />}
      actions={<FeedbackDialog />}
    />
  )
}
