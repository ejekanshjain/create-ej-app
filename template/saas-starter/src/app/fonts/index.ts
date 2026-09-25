/**
 * @fileoverview Global font definitions shared across all route groups.
 *
 * Fonts are defined here in a single module so that `next/font/local` generates
 * a stable CSS module hash regardless of which layout imports them. Defining
 * fonts inside individual route-group layouts (e.g. `(marketing)` or `(admin)`)
 * causes the server and client to produce different class name hashes, leading
 * to React hydration mismatches.
 *
 * Usage:
 *   import { geistMono, geistSans } from '~/app/fonts'
 *   <body className={`${geistSans.variable} ${geistMono.variable}`}>
 *
 * @module app/fonts/index
 */

import localFont from 'next/font/local'

/**
 * Geist Sans - primary variable font for body and UI text.
 *
 * Exposed as the CSS custom property `--font-geist-sans` so it can be
 * referenced in Tailwind via `font-sans`.
 *
 * @see https://vercel.com/font/sans
 */
export const geistSans = localFont({
  src: '../fonts/geist-sans/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  weight: '100 900'
})

/**
 * Geist Mono - monospace variable font for code blocks, badges, and
 * any UI element that benefits from fixed-width rendering.
 *
 * Exposed as the CSS custom property `--font-geist-mono`.
 *
 * `adjustFontFallback` is disabled because the automatic metric adjustment
 * produces undesirable layout shifts with the custom fallback stack below.
 *
 * @see https://vercel.com/font/mono
 */
export const geistMono = localFont({
  src: '../fonts/geist-mono/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  adjustFontFallback: false,
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace'
  ],
  weight: '100 900'
})
