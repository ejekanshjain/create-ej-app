import { Metadata } from 'next'
import { ReactNode } from 'react'

import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Settings' + ' | ' + siteConfig.name
}

const Layout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

export default Layout
