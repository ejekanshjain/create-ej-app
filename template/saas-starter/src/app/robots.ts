import type { MetadataRoute } from 'next'
import { env } from '~/env'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  // Block all crawlers in staging to prevent accidental indexing
  if (env.APP_ENV === 'staging') {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/'
        }
      ]
    }
  }

  const baseUrl = env.BETTER_AUTH_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/app/', '/accept-invitation/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
