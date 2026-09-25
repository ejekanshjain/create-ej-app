'use client'

import {
  House,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  UserCog,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '~/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { admin, signOut } from '~/lib/auth-client'
import { cn } from '~/lib/cn'

type UserMenuProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  fallbackName?: string
  fallbackInitials?: string
  wrapperClassName?: string
  /** Superadmins work in both panels, so they get a way to cross over. */
  isSuperAdmin?: boolean
  /** This session is an admin acting as someone else. */
  isImpersonating?: boolean
}

export function UserMenu({
  user,
  fallbackName = 'Unknown',
  fallbackInitials = 'NA',
  wrapperClassName = 'flex items-center gap-2',
  isSuperAdmin = false,
  isImpersonating = false
}: UserMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isStopping, setIsStopping] = useState(false)

  // One entry, pointing at the panel you are not in. Account pages sit outside
  // both, and lead back to the admin panel.
  const inAdminPanel = pathname?.startsWith('/admin') ?? false
  const switchTo = inAdminPanel
    ? { href: '/app', label: 'Switch to App', Icon: LayoutGrid }
    : { href: '/admin', label: 'Switch to Admin', Icon: ShieldCheck }

  const displayName = user.name ?? fallbackName
  const initials =
    user.name
      ?.split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('') || fallbackInitials

  async function stopImpersonating() {
    setIsStopping(true)
    try {
      await admin.stopImpersonating()
      // Back to the admin panel: the restored session may have no access to the
      // page the impersonated user was looking at.
      router.push('/admin')
      router.refresh()
    } catch {
      setIsStopping(false)
    }
  }

  return (
    <div className={wrapperClassName}>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative size-8 rounded-full"
            aria-label={
              isImpersonating
                ? `Account menu, impersonating ${displayName}`
                : 'Account menu'
            }
          >
            <Avatar
              className={cn(
                'size-8',
                isImpersonating &&
                  'ring-warning ring-offset-background ring-2 ring-offset-2'
              )}
            >
              <AvatarFallback className="text-foreground">
                {initials}
              </AvatarFallback>
              {user.image ? (
                <AvatarImage src={user.image} alt={displayName} />
              ) : null}
            </Avatar>
            {isImpersonating ? (
              <span className="bg-warning text-warning-foreground ring-background absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full ring-2">
                <UserX className="size-2.5" aria-hidden="true" />
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-foreground text-sm leading-none font-medium">
                {displayName}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {user.email ?? ''}
              </p>
            </div>
          </DropdownMenuLabel>

          {isImpersonating ? (
            <>
              <DropdownMenuSeparator />
              <div className="border-warning/40 bg-warning/10 mx-1 mb-1 flex items-start gap-2 rounded-md border px-2 py-1.5">
                <UserX
                  className="text-warning mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-foreground text-xs leading-snug">
                  You are signed in as this user. Anything you do is recorded
                  against their account.
                </p>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isStopping}
                  onSelect={event => {
                    // Hold the menu open while the session swaps back.
                    event.preventDefault()
                    void stopImpersonating()
                  }}
                >
                  <UserX className="mr-2 size-4" />
                  <span>{isStopping ? 'Stopping…' : 'Stop Impersonating'}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}

          {isSuperAdmin ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={switchTo.href}>
                    <switchTo.Icon className="mr-2 size-4" />
                    <span>{switchTo.label}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/">
                <House className="mr-2 size-4" />
                <span>Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserCog className="mr-2 size-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={async () => {
                await signOut()
                router.push('/login')
              }}
            >
              <LogOut className="mr-2 size-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
