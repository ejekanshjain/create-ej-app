'use client'

// import debounce from 'lodash/debounce'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useState } from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
// import { doSearch, type SearchResult } from '../app/(app)/actions/doSearch'

export const AppNavCommand: FC = () => {
  const [open, setOpen] = useState(false)
  // const [search, setSearch] = useState('')
  // const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const { setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // useEffect(() => {
  //   if (!search) {
  //     setSearchResults([])
  //     return
  //   }
  //   doSearch(search).then(results => setSearchResults(results))
  // }, [search])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  // const debouncedSearch = useMemo(
  //   () =>
  //     debounce((search: string) => {
  //       setSearch(search)
  //     }, 500),
  //   []
  // )

  return (
    <>
      <Button
        variant="outline"
        className="relative w-36 justify-start text-sm text-muted-foreground lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="truncate">Command Menu</span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Search..."
            // onChangeCapture={e => {
            //   debouncedSearch((e.target as any)?.value || '')
            // }}
          />
          <CommandList>
            <CommandEmpty>No search results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/qr-codes'))}
              >
                <Icons.qrCode className="mr-2 h-4 w-4" />
                QR Codes
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Account">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/billing'))}
              >
                <Icons.card className="mr-2 h-4 w-4" />
                Billing
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/settings'))}
              >
                <Icons.settings className="mr-2 h-4 w-4" />
                Settings
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    signOut({
                      callbackUrl: `${window.location.origin}/login`
                    })
                  )
                }
              >
                <Icons.logout className="mr-2 h-4 w-4" />
                Sign Out
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Theme">
              <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                <Icons.sun className="mr-2 h-4 w-4" />
                Light
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                <Icons.moon className="mr-2 h-4 w-4" />
                Dark
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => setTheme('system'))}
              >
                <Icons.laptop className="mr-2 h-4 w-4" />
                System
              </CommandItem>
            </CommandGroup>
            {/* {searchResults.length ? (
              <CommandGroup heading="Search Results">
                {searchResults.map((sr, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => runCommand(() => router.push(sr.link))}
                    value={sr.id}
                  >
                    {sr.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : undefined} */}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
