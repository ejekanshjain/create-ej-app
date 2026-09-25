import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ErrorDisplay } from '~/components/error'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { getAuthSession } from '~/lib/auth'
import { sanitizeCallbackUrl } from '~/lib/callback-url'
import { privatePageRobots } from '~/lib/seo'
import { getOrganizationsCached } from '../actions/organizations'
import { AppHeader } from './_components/app-header'
import { AppSidebar } from './_components/app-sidebar'

export const metadata: Metadata = {
  robots: privatePageRobots
}

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  const authSession = await getAuthSession()

  if (!authSession) {
    const headerStore = await headers()
    const callbackUrl =
      sanitizeCallbackUrl(headerStore.get('x-pathname') ?? undefined) ?? '/app'
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  const organizations = await getOrganizationsCached()

  if (!organizations?.data) {
    return (
      <ErrorDisplay
        title="Organizations Failed to Load"
        message="Refresh the page to try again."
        link={{ href: '/app', text: 'Retry' }}
      />
    )
  }

  const cookieStore = await cookies()
  const sidebarStateCookie = cookieStore.get('sidebar_state')?.value
  const defaultOpen = sidebarStateCookie !== 'false'

  return (
    <NuqsAdapter>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar organizations={organizations.data} />
        <SidebarInset>
          <AppHeader
            user={authSession.user}
            organizations={organizations.data}
            isSuperAdmin={authSession.isSuperAdmin}
            isImpersonating={!!authSession.session.impersonatedBy}
          />
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </NuqsAdapter>
  )
}
