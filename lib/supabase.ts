import { createClient, type SupabaseClient, AuthError } from '@supabase/supabase-js'

// ========================================
// SUPABASE CLIENT CONFIGURATION
// ========================================
// Using environment variables only
// Production: Set in Vercel environment variables
// Development: Must be set in .env.local
// ========================================

// Global variables to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Create client only once - prevents multiple instances
const createSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'visual-garden-app'
      }
    },
    db: {
      schema: 'public'
    }
  })
}

// Create admin client only once
const createSupabaseAdminClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'visual-garden-app-admin'
      }
    },
    db: {
      schema: 'public'
    }
  })
}

// Getter functions that ensure single instance
const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

const getSupabaseAdminClient = (): SupabaseClient => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createSupabaseAdminClient()
  }
  return supabaseAdminInstance
}

// Export the functions
export { getSupabaseClient, getSupabaseAdminClient }

// Export single instances - these are created only once
export const supabase = getSupabaseClient()

// Export supabaseAdmin for server-side operations ONLY
export const supabaseAdmin = (() => {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    console.warn('supabaseAdmin should not be used on the client side')
    return null
  }
  return getSupabaseAdminClient()
})()

// ========================================
// VISUAL GARDEN CONSTANTS
// ========================================
export const VISUAL_GARDEN_CONSTANTS = {
  DEFAULT_COLORS: {
    PLANT_BED: '#8B4513'
  }
} as const
