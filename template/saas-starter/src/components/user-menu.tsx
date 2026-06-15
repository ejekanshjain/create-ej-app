'use client'

import { LogOut, UserCog } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '~/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { signOut } from '~/lib/auth-client'

type UserMenuProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  fallbackName?: string
  fallbackInitials?: string
  wrapperClassName?: string
}

export function UserMenu({
  user,
  fallbackName = 'Unknown',
  fallbackInitials = 'NA',
  wrapperClassName = 'flex items-center gap-2'
}: UserMenuProps) {
  const router = useRouter()

  const initials =
    user.name
      ?.split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('') || fallbackInitials

  return (
    <div className={wrapperClassName}>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative size-8 rounded-full">
            <Avatar className="size-8 cursor-pointer">
              <AvatarFallback className="text-foreground">
                {initials}
              </AvatarFallback>
              {user.image ? <AvatarImage src={user.image} alt="User" /> : null}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-foreground text-sm leading-none font-medium">
                {user.name ?? fallbackName}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {user.email ?? ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCog className="mr-2 size-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await signOut()
              router.push('/login')
            }}
          >
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
