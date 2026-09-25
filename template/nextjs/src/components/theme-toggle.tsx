/**
 * @fileoverview Theme Toggle Button Component
 *
 * Cycles through light, dark, and system themes.
 * Uses next-themes for theme state management.
 *
 * **Theme Cycle:**
 * light → dark → system → light…
 *
 * **Icons:**
 * - Sun: Light mode
 * - Moon: Dark mode
 * - Monitor: System preference
 *
 * **Hydration:**
 * - Waits for client mount before rendering icons
 * - Prevents hydration mismatch
 *
 * @module components/theme-toggle
 */

'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { FC, useSyncExternalStore } from 'react'
import { Button } from './ui/button'

const emptySubscribe = () => () => {}

/**
 * Theme Toggle Button
 *
 * Ghost button that cycles through available themes.
 * Shows appropriate icon for current theme state.
 *
 * **Behavior:**
 * - Click cycles: light → dark → system → light
 * - Shows nothing until mounted (prevents hydration issues)
 *
 * @returns {JSX.Element} Icon button for theme switching
 */
export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()
  // Client-only: server snapshot is false so SSR and the first client paint match.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme || 'system')
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex]!)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label="Toggle theme"
    >
      {!mounted ? null : (
        <>
          {theme === 'light' && <Sun className="size-4" />}
          {theme === 'dark' && <Moon className="size-4" />}
          {theme === 'system' && <Monitor className="size-4" />}
        </>
      )}
    </Button>
  )
}
