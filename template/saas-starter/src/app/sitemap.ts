import type { MetadataRoute } from 'next'
import { env } from '~/env'

export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  if (env.APP_ENV === 'staging') return []

  const baseUrl = env.BETTER_AUTH_URL
  const lastModified = new Date()

  const routes = ['/', '/privacy', '/terms', '/login']

  return routes.map(path => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7
  }))
}
