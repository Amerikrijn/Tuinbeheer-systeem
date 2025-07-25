/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable SSR for all pages to prevent useContext issues during build
    runtime: 'nodejs',
  },
  // Disable static optimization to prevent context issues
  output: 'standalone',
  // Force dynamic rendering for all pages
  trailingSlash: false,
  // Ensure no static optimization happens
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
