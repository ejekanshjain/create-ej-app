'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentType, ReactNode } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '~/components/ui/sidebar'

type NavigationSidebarProps = {
  header: ReactNode
  groups: SidebarNavGroup[]
}

export type SidebarNavIcon = ComponentType<{ className?: string }>

export type SidebarNavSubItem = {
  title: string
  url: string
  exact?: boolean
}

export type SidebarNavItem = {
  title: string
  url: string
  icon?: SidebarNavIcon
  exact?: boolean
  items?: SidebarNavSubItem[]
}

export type SidebarNavGroup = {
  label: string
  items: SidebarNavItem[]
  /** When true, the group is only shown to superadmins. */
  superadminOnly?: boolean
}

export function NavigationSidebar({ header, groups }: NavigationSidebarProps) {
  const pathname = usePathname()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const allItems = groups.flatMap(g => g.items)

  const isItemActive = (item: { url: string; exact?: boolean }) => {
    if (item.exact) {
      return pathname === item.url
    }

    if (pathname !== item.url && !pathname.startsWith(`${item.url}/`)) {
      return false
    }

    // Yield to a more specific sibling that also matches
    const moreSpecificExists = allItems.some(
      other =>
        other.url !== item.url &&
        other.url.length > item.url.length &&
        other.url.startsWith(item.url) &&
        (pathname === other.url || pathname.startsWith(`${other.url}/`))
    )

    return !moreSpecificExists
  }

  const isSubItemActive = (
    item: SidebarNavSubItem,
    siblings: SidebarNavSubItem[]
  ) => {
    if (!isItemActive(item)) {
      return false
    }

    return !siblings.some(
      sibling =>
        sibling.url !== item.url &&
        isItemActive(sibling) &&
        sibling.url.length > item.url.length
    )
  }

  const isGroupActive = (item: SidebarNavItem) => {
    if (isItemActive(item)) {
      return true
    }

    return item.items?.some(subItem => isItemActive(subItem)) ?? false
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>{header}</SidebarHeader>
      <SidebarContent>
        {groups.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item =>
                  item.items ? (
                    isCollapsed ? (
                      <SidebarMenuItem key={item.title}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={isGroupActive(item)}
                            >
                              {item.icon ? <item.icon /> : null}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            sideOffset={4}
                          >
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {item.items.map(subItem => (
                              <DropdownMenuItem
                                key={subItem.url}
                                asChild
                                className={
                                  isSubItemActive(subItem, item.items!)
                                    ? 'bg-accent font-medium'
                                    : ''
                                }
                              >
                                <Link
                                  href={subItem.url}
                                  onClick={handleLinkClick}
                                >
                                  {subItem.title}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ) : (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={isGroupActive(item)}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={isGroupActive(item)}
                            >
                              {item.icon ? <item.icon /> : null}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map(subItem => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubItemActive(
                                      subItem,
                                      item.items!
                                    )}
                                  >
                                    <Link
                                      href={subItem.url}
                                      onClick={handleLinkClick}
                                    >
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isItemActive(item)}
                      >
                        <Link href={item.url} onClick={handleLinkClick}>
                          {item.icon ? <item.icon /> : null}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
