import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import { SiteFooter } from '@/components/site-footer'
import { getAuthSession } from '@/lib/auth'

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
