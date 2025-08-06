/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Skip build errors for deployment
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Exclude mobile app and packages from Next.js compilation
  webpack: (config, { isServer }) => {
    // Ignore mobile app and packages directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/apps/mobile/**', '**/packages/**', '**/node_modules/**']
    }
    
    return config
  },
  
  // Explicitly define environment variables for client-side
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Add headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Configure output for Vercel deployment
  output: 'standalone',
  
  // Experimental features to help with SSR issues
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Skip static optimization for all pages
    skipTrailingSlashRedirect: true,
  },
  
  // Disable static optimization to prevent pre-rendering issues
  async generateStaticParams() {
    return []
  },
};

export default nextConfig;
