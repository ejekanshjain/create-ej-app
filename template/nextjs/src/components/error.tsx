/**
 * @fileoverview Reusable Error Display Component
 *
 * Generic error/empty state component for displaying user-friendly
 * error messages with optional icon and action button.
 *
 * **Use Cases:**
 * - Empty search results
 * - Data fetch failures
 * - Access denied states
 * - 404-like content not found
 *
 * @module components/error
 */

import { type LucideIcon, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'
import { Button } from '~/components/ui/button'

/**
 * Error Display Component
 *
 * Renders a centered error state with icon, message, and action.
 *
 * **Layout:**
 * - Large icon (customizable)
 * - Bold title
 * - Descriptive message
 * - Action button (customizable link)
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Error heading text
 * @param {string} props.message - Descriptive error message
 * @param {LucideIcon} [props.icon] - Custom icon (defaults to AlertTriangle)
 * @param {Object} [props.link] - Optional action button configuration
 * @param {string} [props.link.href] - Button link destination (defaults to '/')
 * @param {string} [props.link.text] - Button text (defaults to 'Browse Products')
 * @returns {JSX.Element} Centered error display
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   title="No Results Found"
 *   message="Try adjusting your search or filters"
 *   icon={Search}
 *   link={{ href: '/search', text: 'Clear Filters' }}
 * />
 * ```
 */
export const ErrorDisplay: FC<{
  title: string
  message: string
  icon?: LucideIcon
  link?: {
    href?: string
    text?: string
  }
}> = ({ title, message, icon, link }) => {
  const Icon = icon || AlertTriangle
  return (
    <div className="flex w-full flex-col items-center justify-center py-16">
      <Icon className="text-muted-foreground/50 size-16" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2">{message}</p>
      <Button className="mt-4" asChild>
        <Link href={link?.href || '/'}>{link?.text || 'Go Home'}</Link>
      </Button>
    </div>
  )
}
