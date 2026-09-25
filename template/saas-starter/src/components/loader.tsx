/**
 * @fileoverview Page Transition Loader Component
 *
 * Top progress bar shown during navigation, using the theme primary color.
 *
 * @module components/loader
 */

'use client'

import NextTopLoader from 'nextjs-toploader'

import { FC } from 'react'

/**
 * Page Loader Component
 *
 * Renders the NextTopLoader with preset configuration.
 * Should be included once near the root layout.
 *
 * @returns {JSX.Element} Top loading bar component
 */
export const Loader: FC = () => {
  return (
    <NextTopLoader
      color="var(--primary)"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={true}
      easing="ease"
      speed={200}
      shadow="0 0 10px var(--primary), 0 0 5px var(--primary)"
      template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      zIndex={10000}
      showAtBottom={false}
    />
  )
}
