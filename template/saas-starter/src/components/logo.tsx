import Image from 'next/image'
import { cn } from '~/lib/cn'
import { siteConfig } from '~/lib/siteConfig'

/**
 * Brand mark, with the wordmark beside it unless `showName` is false.
 *
 * Two SVG files rather than one: the mark uses two colors, so `currentColor`
 * cannot recolor it for both themes.
 */
export function Logo({
  className,
  size = 36,
  showName = true,
  priority = false
}: {
  className?: string
  size?: number
  showName?: boolean
  priority?: boolean
}) {
  const dimensions = { width: size, height: size }

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Image
        src={siteConfig.logo}
        alt=""
        aria-hidden
        {...dimensions}
        style={dimensions}
        className="shrink-0 dark:hidden"
        priority={priority}
      />
      <Image
        src={siteConfig.logoDark}
        alt=""
        aria-hidden
        {...dimensions}
        style={dimensions}
        className="hidden shrink-0 dark:block"
        priority={priority}
      />
      <span className={cn('font-bold tracking-tight', !showName && 'sr-only')}>
        {siteConfig.name}
      </span>
    </span>
  )
}
