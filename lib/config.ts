// Environment configuration for different deployment stages

export type Environment = 'dev' | 'test' | 'prod'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

// Get current environment from environment variables
export function getCurrentEnvironment(): Environment {
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV
  
  if (appEnv === 'test') return 'test'
  if (appEnv === 'production') return 'prod'
  return 'dev'
}

// Get Supabase configuration based on environment
export function getSupabaseConfig(): SupabaseConfig {
  const env = getCurrentEnvironment()
  
  switch (env) {
    case 'test':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_TEST || 'https://your-test-url.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST || 'your-test-anon-key'
      }
    case 'prod':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
      }
    case 'dev':
    default:
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_DEV || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
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
  
  console.log(`🔧 Supabase Configuration [${env.toUpperCase()}]:`)
  console.log('  URL:', config.url.substring(0, 50) + '...')
  console.log('  Key length:', config.anonKey.length)
  console.log('  Key prefix:', config.anonKey.substring(0, 20) + '...')
}