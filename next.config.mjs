/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Build configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Simple webpack configuration
  webpack: (config, { isServer }) => {
    // Basic Node.js polyfills for client-side
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
