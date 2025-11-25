import Link from 'next/link'
import { siteConfig } from '~/lib/siteConfig'

export const SiteFooter = () => {
  return (
    <footer className="container border-t">
      <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <p>
          &copy; {new Date().getUTCFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
