import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { siteConfig } from '@/lib/siteConfig'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
