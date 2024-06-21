import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import { SiteFooter } from '@/components/site-footer'
import { getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Login | ' + siteConfig.name,
  description: siteConfig.description
}

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getAuthSession()

  if (session?.user) return redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}

export default AuthLayout
