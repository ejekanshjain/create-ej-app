'use client'

import { Building2, ChevronsUpDown, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar'
import type { UserOrganization } from '~/lib/app-navigation'

function OrganizationLogo({
  logo,
  name,
  size
}: {
  logo: string | null
  name: string
  size: 'sm' | 'lg'
}) {
  if (logo) {
    return (
      <div
        className={
          size === 'lg'
            ? 'relative aspect-square size-8 shrink-0 overflow-hidden rounded-lg'
            : 'relative size-full overflow-hidden rounded-sm'
        }
      >
        <Image
          src={logo}
          alt={name}
          fill
          sizes={size === 'lg' ? '32px' : '24px'}
          className="object-cover"
          unoptimized={logo.startsWith('data:')}
        />
      </div>
    )
  }

  return size === 'lg' ? (
    <div className="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
      <Building2 className="size-4" />
    </div>
  ) : (
    <Building2 className="size-4 shrink-0" />
  )
}

export function OrganizationSwitcher({
  organizations
}: {
  organizations: UserOrganization[]
}) {
  const router = useRouter()
  const params = useParams()
  const activeOrgId = params?.orgId as string | undefined

  const activeOrg = useMemo(
    () => organizations.find(o => o.id === activeOrgId) ?? organizations[0],
    [organizations, activeOrgId]
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <OrganizationLogo
                logo={activeOrg?.logo ?? null}
                name={activeOrg?.name ?? ''}
                size="lg"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg?.name ?? 'Select organization'}
                </span>
                {activeOrg ? (
                  <span className="text-muted-foreground truncate text-xs capitalize">
                    {activeOrg.role}
                  </span>
                ) : null}
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {organizations.map(org => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => router.push(`/app/${org.id}/dashboard`)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center overflow-hidden rounded-sm border">
                  <OrganizationLogo logo={org.logo} name={org.name} size="sm" />
                </div>
                <span className="truncate">{org.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push('/app/onboarding')}
            >
              <div className="bg-background text-muted-foreground flex size-6 items-center justify-center rounded-md border">
                <PlusCircle className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Create organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
