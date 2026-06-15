'use client'

import { LayoutGrid } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'
import { useOrganizationContext } from '../../_components/organization-context'

export default function Page() {
  const org = useOrganizationContext()

  return (
    <div className="space-y-6">
      <PageHeading
        title={org.name}
        description="Your organization's home base."
        icon={LayoutGrid}
      />
      Hello, World!
    </div>
  )
}
