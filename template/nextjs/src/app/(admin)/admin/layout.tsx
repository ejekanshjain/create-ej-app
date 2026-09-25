import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { AdminHeader } from '~/app/(admin)/admin/_components/admin-header'
import { AdminSidebar } from '~/app/(admin)/admin/_components/admin-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { getAuthSession } from '~/lib/auth'
import { privatePageRobots } from '~/lib/seo'

export const metadata: Metadata = {
  robots: privatePageRobots
}

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
    <NuqsAdapter>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AdminSidebar isSuperAdmin={authSession.isSuperAdmin} />
        <SidebarInset>
          <AdminHeader
            user={{
              name: authSession.user?.name,
              email: authSession.user?.email,
              image: authSession.user?.image
            }}
            isSuperAdmin={authSession.isSuperAdmin}
            isImpersonating={!!authSession.session.impersonatedBy}
          />
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </NuqsAdapter>
  )
}
