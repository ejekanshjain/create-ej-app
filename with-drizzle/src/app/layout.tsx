import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

import { siteConfig } from '@/lib/siteConfig'
import './globals.css'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
