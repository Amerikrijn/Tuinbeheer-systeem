/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation to prevent useContext SSR errors
  trailingSlash: false,
  // Disable image optimization to prevent build issues
  images: {
    unoptimized: true
  },
  // Experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Ensure dynamic rendering
  poweredByHeader: false
}

module.exports = nextConfig
