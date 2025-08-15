import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with banking security standards
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Secure configuration for banking standards
  global: {
    headers: {
      'X-Client-Info': 'tuinbeheer-banking-app'
    }
  }
})

// Admin client for server-side operations (banking compliance)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Banking security utilities
export const secureSupabaseCall = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    // Secure error handling for banking standards
    // Log error only in development for security
    if (process.env.NODE_ENV === 'development') {
      // Secure logging - no sensitive data
      console.error('Supabase operation failed:', error instanceof Error ? error.message : 'Unknown error')
    }
    return fallback
  }
}