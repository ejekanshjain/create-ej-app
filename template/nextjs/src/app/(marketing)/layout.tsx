import Link from 'next/link'
import { Logo } from '~/components/logo'
import { SiteFooter } from '~/components/site-footer'
import { Button } from '~/components/ui/button'
import { siteConfig } from '~/lib/siteConfig'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="bg-background text-foreground focus:ring-ring/50 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-200 focus:rounded-md focus:px-4 focus:py-2 focus:ring-3"
      >
        Skip to content
      </a>
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
        <nav
          aria-label="Primary"
          className="container flex h-14 items-center justify-between gap-4"
        >
          <Link href="/" className="flex items-center">
            <Logo size={28} priority className="text-lg" />
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="focus-visible:outline-primary flex-1 focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        {children}
      </main>
      <SiteFooter name={siteConfig.name} />
    </div>
  )
}
