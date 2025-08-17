import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ========================================
// SUPABASE CLIENT CONFIGURATION
// ========================================
// Using environment variables only
// Production: Set in Vercel environment variables
// Development: Must be set in .env.local
// ========================================

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null

const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Use environment variables only
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: supabaseUrl ? 'Set' : 'Missing',
      key: supabaseAnonKey ? 'Set' : 'Missing'
    })
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.')
  }

  console.log('Initializing Supabase client with URL:', supabaseUrl)

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'tuinbeheer-app',
        'X-Compliance': 'banking-grade'
      }
    },
    db: {
      schema: 'public'
    }
  })

  return supabaseInstance
}

// Admin client for server-side operations (required for banking compliance)
let supabaseAdminInstance: SupabaseClient | null = null

const getSupabaseAdminClient = (): SupabaseClient => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables. Required for banking compliance operations.')
  }

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'tuinbeheer-admin',
        'X-Compliance': 'banking-grade'
      }
    },
    db: {
      schema: 'public'
    }
  })

  return supabaseAdminInstance
}

// Export the functions only
export { getSupabaseClient, getSupabaseAdminClient }

// Backward compatibility aliases
export const supabaseAdmin = getSupabaseAdminClient

// ========================================
// VISUAL GARDEN CONSTANTS
// ========================================
export const VISUAL_GARDEN_CONSTANTS = {
  DEFAULT_COLORS: {
    PLANT_BED: '#8B4513'
  }
} as const
