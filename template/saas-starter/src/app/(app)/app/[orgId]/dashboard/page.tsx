'use client'

import { LayoutGrid } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'
import { useOrganizationContext } from '../../_components/organization-context'

export default function DashboardPage() {
  const org = useOrganizationContext()

  return (
    <PageHeading
      title={org.name}
      description="Your organization's home. Build your product here."
      icon={LayoutGrid}
    />
  )
}
