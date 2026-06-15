import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { ImpersonationBanner } from '~/components/impersonation-banner'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { TooltipProvider } from '~/components/ui/tooltip'
import { getAuthSession } from '~/lib/auth'
import { siteConfig } from '~/lib/siteConfig'
import { AdminHeader } from './_components/admin-header'
import { AdminSidebar } from './_components/admin-sidebar'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const authSession = await getAuthSession()

  if (!authSession) {
    return notFound()
  }

  if (!authSession.isAdmin) {
    return redirect('/app')
  }

  const cookieStore = await cookies()
  const sidebarStateCookie = cookieStore.get('sidebar_state')?.value
  const defaultOpen = sidebarStateCookie !== 'false'

  return (
    <TooltipProvider>
      <NuqsAdapter>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AdminSidebar
            companyName={siteConfig.name}
            isSuperAdmin={authSession.isSuperAdmin}
          />
          <SidebarInset>
            {authSession.session.impersonatedBy ? (
              <ImpersonationBanner />
            ) : null}
            <AdminHeader
              user={{
                name: authSession.user.name,
                email: authSession.user.email,
                image: authSession.user.image
              }}
              isSuperAdmin={authSession.isSuperAdmin}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </NuqsAdapter>
    </TooltipProvider>
  )
}
