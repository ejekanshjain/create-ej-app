'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SidebarNavGroup,
  SidebarNavItem,
  SidebarNavSubItem
} from '~/components/navigation-sidebar'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '~/components/ui/command'

type NavigationSearchProps = {
  groups: SidebarNavGroup[]
  dialogDescription: string
  emptyMessage?: string
  buttonLabel?: string
  buttonClassName?: string
}

export function NavigationSearch({
  groups,
  dialogDescription,
  emptyMessage = 'No results found.',
  buttonLabel = 'Search...',
  buttonClassName = 'text-muted-foreground relative h-9 w-36 justify-start rounded-md text-sm sm:w-64 sm:pr-12'
}: NavigationSearchProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const navigate = useCallback(
    (url: string) => {
      setSearchOpen(false)
      router.push(url)
    },
    [router]
  )

  const hasGroups = groups.length > 0

  const normalizedGroups = useMemo(
    () =>
      groups.map(group => ({
        label: group.label,
        items: group.items.flatMap((item: SidebarNavItem) => {
          if (item.items?.length) {
            return item.items.map((subItem: SidebarNavSubItem) => ({
              key: subItem.url,
              label: `${item.title} › ${subItem.title}`,
              value: `${group.label} ${item.title} ${subItem.title}`,
              url: subItem.url,
              icon: item.icon
            }))
          }

          return [
            {
              key: item.url,
              label: item.title,
              value: `${group.label} ${item.title}`,
              url: item.url,
              icon: item.icon
            }
          ]
        })
      })),
    [groups]
  )

  return (
    <>
      <Button
        variant="outline"
        className={buttonClassName}
        onClick={() => setSearchOpen(true)}
        disabled={!hasGroups}
      >
        <Search className="mr-2 size-4" />
        <span>{buttonLabel}</span>
        <kbd className="bg-muted pointer-events-none absolute top-[50%] right-1.5 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search"
        description={dialogDescription}
      >
        <Command>
          <CommandInput placeholder="Type to search..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {normalizedGroups.map((group, groupIndex) => (
              <div key={group.label}>
                {groupIndex > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group.label}>
                  {group.items.map(item => (
                    <CommandItem
                      key={item.key}
                      value={item.value}
                      onSelect={() => navigate(item.url)}
                    >
                      {item.icon ? <item.icon className="mr-2 size-4" /> : null}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
