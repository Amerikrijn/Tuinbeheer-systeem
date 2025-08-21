import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ========================================
// SUPABASE CLIENT CONFIGURATION
// ========================================
// Environment variable loading with better Vercel support
// Production: Set in Vercel environment variables
// Development: Must be set in .env.local
// ========================================

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null

// Better environment variable loading
const getEnvironmentVariables = () => {
  // Try multiple ways to get environment variables
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    (typeof window !== 'undefined' ? window.__ENV__?.NEXT_PUBLIC_SUPABASE_URL : undefined)
    
  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? window.__ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined)

  return { supabaseUrl, supabaseAnonKey }
}

const getSupabaseClient = (): SupabaseClient => {
  console.log('🔍 DEBUG: getSupabaseClient called')
  
  if (supabaseInstance) {
    console.log('🔍 DEBUG: Returning existing supabase instance')
    return supabaseInstance
  }

  // Get environment variables with better fallback support
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables()

  console.log('🔍 DEBUG: Environment check:', {
    url: supabaseUrl ? '✅ Set' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    // In development, show helpful error
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ ERROR: Missing Supabase environment variables:', {
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseAnonKey ? 'Set' : 'Missing'
      })
      throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
    } else {
      // In production (Vercel), this should not happen if variables are set correctly
      console.error('❌ ERROR: Missing Supabase environment variables in production')
      throw new Error('Supabase configuration error. Please check Vercel environment variables.')
    }
  }

  console.log('🔍 DEBUG: Initializing Supabase client with URL:', supabaseUrl)

  try {
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

    console.log('🔍 DEBUG: Supabase client created successfully')
    
    // Test connection immediately (but don't fail if test fails)
    testConnection(supabaseInstance).catch(error => {
      console.warn('⚠️ WARNING: Initial connection test failed, but client created:', error)
    })
    
    return supabaseInstance
  } catch (error) {
    console.error('❌ ERROR: Failed to create Supabase client:', error)
    throw error
  }
}

// Test database connection
const testConnection = async (client: SupabaseClient) => {
  console.log('🔍 DEBUG: Testing database connection...')
  const start = Date.now()
  
  try {
    const { data, error } = await client
      .from('users')
      .select('count')
      .limit(1)
    
    const duration = Date.now() - start
    
    if (error) {
      console.error('❌ ERROR: Database connection test failed:', error)
      console.error('❌ ERROR: Connection test took:', duration, 'ms')
    } else {
      console.log('✅ SUCCESS: Database connection test passed in', duration, 'ms')
    }
  } catch (error) {
    const duration = Date.now() - start
    console.error('❌ ERROR: Database connection test exception:', error)
    console.error('❌ ERROR: Connection test took:', duration, 'ms')
  }
}

// Admin client for server-side operations (required for banking compliance)
let supabaseAdminInstance: SupabaseClient | null = null

const getSupabaseAdminClient = (): SupabaseClient => {
  console.log('🔍 DEBUG: getSupabaseAdminClient called')
  
  if (supabaseAdminInstance) {
    console.log('🔍 DEBUG: Returning existing supabase admin instance')
    return supabaseAdminInstance
  }

  const { supabaseUrl } = getEnvironmentVariables()
  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    (typeof window !== 'undefined' ? window.__ENV__?.SUPABASE_SERVICE_ROLE_KEY : undefined)
  
  console.log('🔍 DEBUG: Admin environment check:', {
    url: supabaseUrl ? '✅ Set' : '❌ Missing',
    serviceKey: serviceRoleKey ? '✅ Set' : '❌ Missing'
  })
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ ERROR: Missing Supabase admin environment variables')
    throw new Error('Missing Supabase admin environment variables. Required for banking compliance operations.')
  }

  try {
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

    console.log('🔍 DEBUG: Supabase admin client created successfully')
    
    // Test admin connection
    testAdminConnection(supabaseAdminInstance).catch(error => {
      console.warn('⚠️ WARNING: Admin connection test failed, but client created:', error)
    })
    
    return supabaseAdminInstance
  } catch (error) {
    console.error('❌ ERROR: Failed to create Supabase admin client:', error)
    throw error
  }
}

// Test admin database connection
const testAdminConnection = async (client: SupabaseClient) => {
  console.log('🔍 DEBUG: Testing admin database connection...')
  const start = Date.now()
  
  try {
    const { data, error } = await client
      .from('users')
      .select('count')
      .limit(1)
    
    const duration = Date.now() - start
    
    if (error) {
      console.error('❌ ERROR: Admin database connection test failed:', error)
      console.error('❌ ERROR: Admin connection test took:', duration, 'ms')
    } else {
      console.log('✅ SUCCESS: Admin database connection test passed in', duration, 'ms')
    }
  } catch (error) {
    const duration = Date.now() - start
    console.error('❌ ERROR: Admin database connection test exception:', error)
    console.error('❌ ERROR: Admin connection test took:', duration, 'ms')
  }
}

// Export the functions only
export { getSupabaseClient, getSupabaseAdminClient }

// ========================================
// VISUAL GARDEN CONSTANTS
// ========================================
export const VISUAL_GARDEN_CONSTANTS = {
  DEFAULT_COLORS: {
    PLANT_BED: '#8B4513'
  }
} as const

// Type declaration for window.__ENV__ (if needed)
declare global {
  interface Window {
    __ENV__?: {
      NEXT_PUBLIC_SUPABASE_URL?: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
      SUPABASE_SERVICE_ROLE_KEY?: string
    }
  }
}
