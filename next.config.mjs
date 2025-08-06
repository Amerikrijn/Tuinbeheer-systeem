/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone for proper Next.js app deployment
  output: 'standalone',
  
  // Build configuration - only ignore errors during build, not at runtime
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Webpack configuration for client-side polyfills
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
