// Environment configuration for TEST and PROD deployment

export type Environment = 'test' | 'prod'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

// Get current environment from environment variables
export function getCurrentEnvironment(): Environment {
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV
  
  // Handle Vercel-specific environments - PREVIEW IS TREATED AS PRODUCTION
  if (vercelEnv === 'preview' || vercelEnv === 'production') {
    return 'prod' // Preview and production should use IDENTICAL prod config
  }
  
  // Explicit check for test environment
  if (appEnv === 'test') return 'test'
  
  // Default to prod for safety (better to be safe than sorry)
  return 'prod'
}

// Get Supabase configuration based on environment
export function getSupabaseConfig(): SupabaseConfig {
  const env = getCurrentEnvironment()
  
  switch (env) {
    case 'test':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_TEST || 'https://dwsgwqosmihsfaxuheji.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
      }
    case 'prod':
    default:
      // PRODUCTION CONFIGURATION - Used by both PROD and PREVIEW
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
      }
  }
}

// Validate configuration
export function validateSupabaseConfig(config: SupabaseConfig): void {
  if (!config.url.startsWith('https://') || config.url.includes('CREATE TABLE') || config.url.includes('--')) {
    console.error('❌ Invalid Supabase URL detected:', config.url)
    throw new Error('Invalid Supabase URL - contains SQL code instead of URL')
  }

  if (!config.anonKey.startsWith('eyJ')) {
    console.error('❌ Invalid Supabase API key detected')
    throw new Error('Invalid Supabase API key format')
  }
}

// Log current configuration for debugging
export function logCurrentConfig(): void {
  const env = getCurrentEnvironment()
  const config = getSupabaseConfig()
  const vercelEnv = process.env.VERCEL_ENV
  const isPreview = vercelEnv === 'preview'
  
  console.log(`🔧 Supabase Configuration [${env.toUpperCase()}]:`)
  console.log('  APP_ENV:', process.env.APP_ENV)
  console.log('  NODE_ENV:', process.env.NODE_ENV)
  console.log('  VERCEL_ENV:', vercelEnv)
  
  if (isPreview) {
    console.log('  🚨 PREVIEW MODE: Using PRODUCTION configuration')
  }
  
  console.log('  Database URL:', config.url)
  console.log('  Key length:', config.anonKey.length)
  console.log('  Key prefix:', config.anonKey.substring(0, 20) + '...')
  
  // Validate that preview is using production config
  if (isPreview && !config.url.includes('qrotadbmnkhhwhshijdy')) {
    console.error('❌ PREVIEW ERROR: Not using production database!')
    throw new Error('Preview environment must use production database')
  }
}