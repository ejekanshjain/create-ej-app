'use client'

import Link from 'next/link'
import { FC } from 'react'
import { Logo } from '~/components/logo'
import { NavigationSidebar } from '~/components/navigation-sidebar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar'
import { getAdminNavigation } from '~/lib/admin-navigation'
import { siteConfig } from '~/lib/siteConfig'

export const AdminSidebar: FC<{
  isSuperAdmin: boolean
}> = ({ isSuperAdmin }) => {
  return (
    <NavigationSidebar
      groups={getAdminNavigation(isSuperAdmin)}
      header={
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={siteConfig.name}>
              <Link href="/admin">
                <Logo size={32} showName={false} />
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">
                    {siteConfig.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      }
    />
  )
}
