import { LayoutGrid } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'
import { siteConfig } from '~/lib/siteConfig'

export default function AppPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading
        title={`Welcome to ${siteConfig.name}`}
        description="Build your product here."
        icon={LayoutGrid}
      />
    </div>
  )
}
