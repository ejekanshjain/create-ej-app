import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import { withWorkflow } from 'workflow/next'
import { env } from '~/env'
import { MAX_IMAGE_URL_LENGTH } from '~/lib/constants'

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  experimental: {
    serverActions: {
      // Without R2, a logo reaches its server action as a base64 data URL.
      // Next's 1 MB default would reject most of the images the upload allows.
      bodySizeLimit: `${Math.ceil(MAX_IMAGE_URL_LENGTH / 1024 / 1024) + 1}mb`
    }
  },
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'lh3.googleusercontent.com' },
      ...(env.R2_PUBLIC_URL
        ? [{ hostname: new URL(env.R2_PUBLIC_URL).hostname }]
        : [])
    ]
  }
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: env.ANALYZE === 'true'
})

export default withWorkflow(withBundleAnalyzer(nextConfig))
