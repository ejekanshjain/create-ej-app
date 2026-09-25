import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '~/components/logo'
import { UserMenu } from '~/components/user-menu'
import { getAuthSession } from '~/lib/auth'
import { sanitizeCallbackUrl } from '~/lib/callback-url'
import { privatePageRobots } from '~/lib/seo'

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
        <Link href="/app" className="flex shrink-0 items-center">
          <Logo size={32} priority className="text-lg" />
        </Link>
        <UserMenu
          user={authSession.user}
          isSuperAdmin={authSession.isSuperAdmin}
          isImpersonating={!!authSession.session.impersonatedBy}
        />
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
