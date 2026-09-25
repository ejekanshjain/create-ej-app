/**
 * @fileoverview Brand identity and site-wide copy.
 *
 * Layouts, emails, legal pages, and metadata read from here. Never hardcode
 * the product name anywhere else.
 *
 * @module lib/siteConfig
 */
export const siteConfig = {
  name: 'Project Name',
  description: 'Project Description',
  logo: '/logo.svg',
  logoDark: '/logo-dark.svg',
  contact: {
    email: 'hello@example.com'
  },
  legal: {
    lastUpdated: 'September 25, 2026'
  }
}
