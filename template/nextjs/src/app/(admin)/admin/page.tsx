import { LayoutDashboard } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'

export default function AdminPage() {
  return (
    <PageHeading
      title="Dashboard"
      description="Add the pages your team uses to run the product here."
      icon={LayoutDashboard}
    />
  )
}
