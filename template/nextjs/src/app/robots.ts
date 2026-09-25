import type { MetadataRoute } from 'next'
import { env } from '~/env'

/** Renders every request dynamically, so the environment check is live. */
export const dynamic = 'force-dynamic'

/**
 * robots.txt. Staging blocks every crawler; production keeps signed-in
 * surfaces and the API out of search results.
 */
export default function robots(): MetadataRoute.Robots {
  if (env.APP_ENV === 'staging') {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  const baseUrl = env.BETTER_AUTH_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/app', '/profile']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
