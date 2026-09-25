/**
 * @fileoverview Site Footer Component
 *
 * Global footer displayed on all pages.
 * Contains copyright notice and links to legal pages.
 *
 * @module components/site-footer
 */

import Link from 'next/link'

/**
 * Site Footer Component
 *
 * Displays copyright and legal navigation links.
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Company name for copyright
 * @returns {JSX.Element} Footer element with copyright and links
 */
export const SiteFooter = ({ name }: { name: string }) => {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground container flex flex-col items-center justify-between gap-4 py-6 text-sm sm:flex-row">
        <p>
          &copy; {new Date().getUTCFullYear()} {name}. All rights reserved.
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
