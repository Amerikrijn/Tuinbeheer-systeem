/** @type {import('next').NextConfig} */ 
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // SECURE: No environment variables exposed to client
  // All configuration is handled securely in lib/config.ts
  // Only hardcoded test/prod Supabase configurations are allowed
}

export default nextConfig
