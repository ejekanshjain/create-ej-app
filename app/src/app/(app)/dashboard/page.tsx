import { Metadata } from 'next'

import { Shell } from '@/components/shell'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Dashboard' + ' | ' + siteConfig.name
}

const DashboardPage = () => {
  return <Shell>Dashboard</Shell>
}

export default DashboardPage
