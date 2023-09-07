'use client'

import Link from 'next/link'
import { FC, useState } from 'react'

import { Icons } from '@/components/icons'
import { MobileNav } from '@/components/mobile-nav'

interface MainNavProps {
  logoLink?: string
}

export const MainNav: FC<MainNavProps> = ({ logoLink = '/' }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="flex">
      <Link href={logoLink} className="hidden items-center space-x-2 md:flex">
        <Icons.logo />
        <span className="hidden font-bold sm:inline-block">The Next QR</span>
      </Link>
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(prev => !prev)}
      >
        {showMobileMenu ? <Icons.close /> : <Icons.logo />}
        <span className="font-bold">Menu</span>
      </button>
      {showMobileMenu && <MobileNav items={[]} />}
    </div>
  )
}
