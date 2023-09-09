'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/cn'
import { FC } from 'react'

type IconKeys = keyof typeof Icons

interface SideNavProps {
  items: {
    title: string
    href?: string | null
    disabled?: boolean | null
    icon?: IconKeys | null
  }[]
}

export const SideNav: FC<SideNavProps> = ({ items }) => {
  const path = usePathname()

  if (!items?.length) return null

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || 'arrowRight']
        return (
          item.href && (
            <Link key={index} href={item.disabled ? '/' : item.href}>
              <span
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  path.includes(item.href)
                    ? 'bg-accent'
                    : 'transparent underline-offset-4 hover:underline',
                  item.disabled && 'cursor-not-allowed opacity-80'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </span>
            </Link>
          )
        )
      })}
    </nav>
  )
}
