'use client'

import { ReactNode } from 'react'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { UserMenu } from '~/components/user-menu'

type DashboardHeaderProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  search?: ReactNode
  actions?: ReactNode
  fallbackName?: string
  fallbackInitials?: string
}

export function DashboardHeader({
  user,
  search,
  actions,
  fallbackName,
  fallbackInitials
}: DashboardHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger className="-ml-1 hidden sm:inline-flex" />
        </TooltipTrigger>
        <TooltipContent side="right">
          Toggle Sidebar{' '}
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>B
          </kbd>
        </TooltipContent>
      </Tooltip>
      <SidebarTrigger className="-ml-1 sm:hidden" />

      {search ? (
        <>
          <Separator orientation="vertical" className="mr-2" />
          {search}
        </>
      ) : null}

      <div className="flex flex-1 items-center justify-end gap-2">
        {actions}
        <UserMenu
          user={user}
          fallbackName={fallbackName}
          fallbackInitials={fallbackInitials}
        />
      </div>
    </header>
  )
}
