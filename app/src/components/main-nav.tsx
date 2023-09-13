'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { FC, useState } from 'react'

import { Icons } from '@/components/icons'
import { MobileNav } from '@/components/mobile-nav'
import { cn } from '@/lib/cn'
import { siteConfig } from '@/lib/siteConfig'

type MainNavItem = {
  title: string
  href: string
  disabled?: boolean
}

type MainNavProps = {
  logoLink?: string
  items?: MainNavItem[]
}

export const MainNav: FC<MainNavProps> = ({ logoLink = '/', items }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const segment = useSelectedLayoutSegment()

  return (
    <div className="flex md:gap-10">
      <Link href={logoLink} className="hidden items-center space-x-2 md:flex">
        <Icons.logo />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, i) => (
            <Link
              key={i}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm',
                item.href.startsWith(`/${segment}`)
                  ? 'text-foreground'
                  : 'text-foreground/60',
                item.disabled && 'cursor-not-allowed opacity-80'
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(prev => !prev)}
      >
        {showMobileMenu ? <Icons.close /> : <Icons.logo />}
        <span className="font-bold">Menu</span>
      </button>
      {showMobileMenu && items?.length && <MobileNav items={items} />}
    </div>
  )
}
