/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  
  // Cache busting for deployments
  generateBuildId: async () => {
    // Use timestamp + random string for unique build IDs
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  },

  // Headers for cache control
  async headers() {
    return [
      {
        // Apply cache headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Static assets can be cached longer
        source: '/:path*.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes should not be cached
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig