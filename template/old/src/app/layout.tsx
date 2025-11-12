import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'

import { Toaster } from '@/components/ui/sonner'
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
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextTopLoader color="#777" />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
