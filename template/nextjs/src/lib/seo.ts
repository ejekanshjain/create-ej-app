import type { Metadata } from 'next'

/** Meta robots for authenticated or non-public surfaces. */
export const privatePageRobots = {
  index: false,
  follow: false
} satisfies NonNullable<Metadata['robots']>
