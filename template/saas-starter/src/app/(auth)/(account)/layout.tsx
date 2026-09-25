import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Logo } from '~/components/logo'
import { SiteFooter } from '~/components/site-footer'
import { Button } from '~/components/ui/button'
import { UserMenu } from '~/components/user-menu'
import { getAuthSession } from '~/lib/auth'
import { sanitizeCallbackUrl } from '~/lib/callback-url'
import { privatePageRobots } from '~/lib/seo'
import { siteConfig } from '~/lib/siteConfig'

export const metadata: Metadata = {
  robots: privatePageRobots
}

export default async function AccountLayout({
  children
}: {
  children: React.ReactNode
}) {
  const authSession = await getAuthSession()

  if (!authSession) {
    const headerStore = await headers()
    const callbackUrl =
      sanitizeCallbackUrl(headerStore.get('x-pathname') ?? undefined) ??
      '/profile'
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  return (
    <NuqsAdapter>
      <div className="flex min-h-screen flex-col">
        <header className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <Link href="/" className="flex shrink-0 items-center">
            <Logo size={32} priority className="text-lg" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/app">
                <ArrowLeft className="size-4" />
                Back to App
              </Link>
            </Button>
            <UserMenu
              user={authSession.user}
              isSuperAdmin={authSession.isSuperAdmin}
              isImpersonating={!!authSession.session.impersonatedBy}
            />
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <SiteFooter name={siteConfig.name} />
      </div>
    </NuqsAdapter>
  )
}
