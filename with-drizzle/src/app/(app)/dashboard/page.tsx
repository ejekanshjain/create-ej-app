import { Metadata } from 'next'

import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Dashboard' + ' | ' + siteConfig.name
}

const DashboardPage = () => {
  return (
    <Shell>
      <Heading heading="Dashboard" />
    </Shell>
  )
}

export default DashboardPage
