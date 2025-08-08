/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Security: Disable build errors during security fixes
  typescript: {
    ignoreBuildErrors: false, // Enable in production for security
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable in production for security
  },
  
  // Performance optimizations
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'pg', 'winston'],
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'date-fns'],
    serverActions: {
      allowedOrigins: ['localhost:3000', 'tuinbeheer.vercel.app'],
    },
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [], // Add allowed domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Secure headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          // Remove server information
          {
            key: 'X-Powered-By',
            value: '',
          },
        ],
      },
      // Static assets caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
  
  // Redirects for security
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://tuinbeheer.vercel.app/:path*',
        permanent: true,
      },
    ]
  },
  
  // Rewrites for API versioning
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  
  // Webpack configuration for security and performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Security: Prevent client-side access to server-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    
    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      )
    }
    
    // Performance: Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    }
    
    // Security: Content Security Policy for inline scripts
    config.plugins.push(
      new webpack.DefinePlugin({
        __CSP_NONCE__: JSON.stringify(process.env.CSP_NONCE || ''),
      })
    )
    
    return config
  },
  
  // Environment variables validation
  env: {
    // Only expose safe environment variables
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Tuinbeheer Systeem',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV || 'development',
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // React strict mode
    reactStrictMode: true,
    
    // SWC minification
    swcMinify: true,
  },
  
  // Output configuration
  distDir: '.next',
  generateEtags: false, // Disable ETags for security
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Enable React DevTools
    reactStrictMode: true,
    // Hot reload configuration
    webpack: (config, options) => {
      if (options.dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        }
      }
      return config
    },
  }),
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Disable source maps in production for security
    productionBrowserSourceMaps: false,
    
    // Optimize images
    optimizeFonts: true,
    
    // Enable gzip compression
    compress: true,
    
    // Strict CSP in production
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // TODO: Remove unsafe-* after nonce implementation
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: blob: https:",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "object-src 'none'",
                "upgrade-insecure-requests",
              ].join('; '),
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
          ],
        },
      ]
    },
  }),
}

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Security: Validate Supabase configuration
if (process.env.NODE_ENV === 'production') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  WARNING: Supabase configuration missing in production')
  }
  
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    throw new Error('Supabase URL must use HTTPS in production')
  }
}

export default nextConfig
