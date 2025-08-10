/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Environment variables - only expose public ones to client
  env: {
    // Only NEXT_PUBLIC_* variables are exposed to client
    // Server-only variables like SUPABASE_SERVICE_ROLE_KEY are never exposed
  },
  
  // Security: Remove cache headers to let middleware handle them
  // This prevents conflicts with our security headers
  headers: async () => {
    return [
      {
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
  
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Webpack config to ensure no server secrets leak to client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side build: ensure server-only modules are not included
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
