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
  console.log('🔍 DEBUG: getSupabaseClient called')
  
  if (supabaseInstance) {
    console.log('🔍 DEBUG: Returning existing supabase instance')
    return supabaseInstance
  }

  // Use environment variables only
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 DEBUG: Environment check:', {
    url: supabaseUrl ? '✅ Set' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
    nodeEnv: process.env.NODE_ENV
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERROR: Missing Supabase environment variables:', {
      url: supabaseUrl ? 'Set' : 'Missing',
      key: supabaseAnonKey ? 'Set' : 'Missing'
    })
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.')
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
    
    // Test connection immediately
    testConnection(supabaseInstance)
    
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
      .timeout(10000) // 10 second timeout
    
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
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
    testAdminConnection(supabaseAdminInstance)
    
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
      .timeout(10000) // 10 second timeout
    
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
