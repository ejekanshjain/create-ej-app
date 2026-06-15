import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { ImpersonationBanner } from '~/components/impersonation-banner'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { TooltipProvider } from '~/components/ui/tooltip'
import { getAuthSession } from '~/lib/auth'
import { getUserOrganizationsCached } from '~/lib/organization-access'
import { AppHeader } from './_components/app-header'
import { AppSidebar } from './_components/app-sidebar'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const authSession = await getAuthSession()

  if (!authSession) {
    return redirect('/login')
  }

  const cookieStore = await cookies()
  const sidebarStateCookie = cookieStore.get('sidebar_state')?.value
  const defaultOpen = sidebarStateCookie !== 'false'

  const organizations = await getUserOrganizationsCached()

  return (
    <TooltipProvider>
      <NuqsAdapter>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar organizations={organizations} />
          <SidebarInset>
            {authSession.session.impersonatedBy ? (
              <ImpersonationBanner />
            ) : null}
            <AppHeader
              user={{
                name: authSession.user.name,
                email: authSession.user.email,
                image: authSession.user.image
              }}
              organizations={organizations}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </NuqsAdapter>
    </TooltipProvider>
  )
}
