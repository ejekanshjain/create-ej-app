'use client'

import { LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'
import { NavigationSidebar } from '~/components/navigation-sidebar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar'
import { getAdminNavigation } from '~/lib/admin-navigation'

export const AdminSidebar: FC<{
  companyName: string
  isSuperAdmin: boolean
}> = ({ companyName, isSuperAdmin }) => {
  return (
    <NavigationSidebar
      groups={getAdminNavigation(isSuperAdmin)}
      header={
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
                  <LayoutGrid className="size-4" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">{companyName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      }
    />
  )
}
