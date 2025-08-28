/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ Intelligente caching headers (vervangt middleware caching)
  headers: async () => {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, must-revalidate',
          },
        ],
      },
    ]
  },
  
  // ✅ Performance optimalisaties
  compress: true,
  
  // ✅ Image optimalisatie
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // ✅ Bundle splitting optimalisatie
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // ✅ Webpack optimalisaties
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Productie optimalisaties
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 30,
          },
        },
      }
      
      // ✅ Tree shaking optimalisatie
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }
    
    // ✅ Performance monitoring
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'process.env.PERFORMANCE_MONITORING': JSON.stringify(process.env.NODE_ENV === 'development'),
      })
    )
    
    return config
  },
}

export default nextConfig
