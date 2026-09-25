/**
 * @fileoverview Root layout: document shell, fonts, metadata, and the
 * client providers every page shares (TanStack Query, theme, tooltips,
 * toasts, and the navigation progress bar).
 *
 * @module app/layout
 */

import type { Metadata, Viewport } from 'next'
import { Loader } from '~/components/loader'
import { ReactQueryProvider } from '~/components/react-query-provider'
import { ScreenSize } from '~/components/screen-size'
import { ThemeProvider } from '~/components/theme-provider'
import { Toaster } from '~/components/ui/sonner'
import { TooltipProvider } from '~/components/ui/tooltip'
import { env } from '~/env'
import { siteConfig } from '~/lib/siteConfig'
import { geistMono, geistSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(env.BETTER_AUTH_URL),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.name,
    description: siteConfig.description
  },
  twitter: {
    card: 'summary_large_image',
    description: siteConfig.description
  }
}

/** Browser chrome colors, matching `--background` in globals.css. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <ReactQueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Loader />
              {children}
              {env.APP_ENV === 'development' ? <ScreenSize /> : null}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

/** Renders every request dynamically, so env-driven metadata stays current. */
export const dynamic = 'force-dynamic'
