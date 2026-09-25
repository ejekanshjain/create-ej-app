/**
 * @fileoverview Theme provider for light/dark mode and theme hotkeys.
 *
 * Wraps the application with Next Themes provider and manages theme switching.
 * Includes a hotkey component (D key) to toggle the theme.
 *
 * **Features:**
 * - System-aware default theme preference
 * - Light/dark/system theme options
 * - Keyboard shortcut (D key) for theme toggle
 * - No theme transitions on page load
 *
 * @module components/theme-provider
 */

'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { FC, useEffect } from 'react'

/**
 * Determines if the target element is a text input field.
 * Used to avoid triggering theme hotkey when typing in inputs.
 *
 * @param target - DOM event target to check
 * @returns true if target is a contenteditable, input, textarea, or select element
 */
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

/**
 * Theme Hotkey Component
 *
 * Listens for the 'D' key and toggles between light and dark themes.
 * Ignores hotkey when user is typing in an input field.
 *
 * **Behavior:**
 * - Press 'D' anywhere to toggle light ↔ dark
 * - No effect if typing in input, textarea, or contenteditable element
 * - Requires modifier keys (Ctrl, Cmd, Alt) to NOT be pressed
 *
 * @returns {null} Does not render any elements
 */
function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    /**
     * Handles keyboard down events for theme toggle.
     * Checks conditions and prevents default if hotkey is triggered.
     */
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== 'd') {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

/**
 * Theme Provider Component
 *
 * Wraps application with Next Themes provider and mounts theme hotkey.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Provider wrapping children with theme support
 */
export const ThemeProvider: FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}
