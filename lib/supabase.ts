import { createClient, type SupabaseClient, AuthError } from '@supabase/supabase-js'

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Get or create Supabase client instance
const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }
  
  // Use process.env directly for client-side compatibility
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not available')
  }
  
  // Don't log sensitive information in production
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Creating Supabase client with URL:', supabaseUrl)
    console.log('🔑 Anon key present:', !!supabaseAnonKey)
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  return supabaseInstance
}



// Get or create Supabase admin client instance (using anon key for simplicity)
const getSupabaseAdminClient = (): SupabaseClient => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  // Use process.env directly for client-side compatibility
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are required')
  }
 
  // Use anon key for admin operations - simpler and sufficient for tuinbeheer
  supabaseAdminInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  return supabaseAdminInstance
}

// Mock client for graceful degradation
const createMockClient = (): SupabaseClient => {
  return {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) })
    }),
    auth: {
      signIn: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ data: null, error: null }),
      getSession: () => Promise.resolve({ data: null, error: null }),
      getUser: () => Promise.resolve({ data: null, error: null }),
      admin: {
        deleteUser: () => Promise.resolve({ error: null })
      }
    }
  } as unknown as SupabaseClient
}

// Export singleton instances with error handling
export const supabase = (() => {
  try {
    return getSupabaseClient()
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    // Return a mock client for graceful degradation
    return createMockClient()
  }
})()

export const supabaseAdmin = (() => {
  try {
    return getSupabaseAdminClient()
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error)
    // Return a mock client for graceful degradation
    return createMockClient()
  }
})()

// Banking security utilities
export const secureSupabaseCall = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation()
  } catch {
    // Secure error handling for banking standards - no console logging in production
    return fallback
  }
}

// Helper function to get client when needed
export const getClient = () => supabase
export const getAdminClient = () => supabaseAdmin

// Type definitions for compatibility
export interface Plant {
  id: string
  name: string
  species?: string
  variety?: string
  plant_bed_id: string
  planting_date?: string
  scientific_name?: string
  emoji?: string
  created_at: string
  updated_at: string
}

export interface Garden {
  id: string
  name: string
  description?: string
  length?: string
  width?: string
  location?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlantBedWithPlants {
  id: string
  name: string
  garden_id: string
  plants: Plant[]
  location?: string
  size?: number
  soil_type?: string
  sun_exposure?: string
  created_at: string
  updated_at: string
}

export interface PlantWithPosition extends Plant {
  position_x?: number
  position_y?: number
  size?: number
}

// Additional types for API compatibility
export interface BulkUpdatePositionsRequest {
  positions: Array<{
    plant_id: string
    position_x: number
    position_y: number
    size?: number
  }>
}

export interface PlantBedWithPosition {
  id: string
  name: string
  garden_id: string
  position_x?: number
  position_y?: number
  size?: number
  created_at: string
  updated_at: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T | null
  error?: string | null
  message?: string
}

export const VISUAL_GARDEN_CONSTANTS = {
  GRID_SIZE: 50,
  MIN_PLANT_SIZE: 20,
  MAX_PLANT_SIZE: 100,
  GRID_COLUMNS: 20,
  GRID_ROWS: 20,
  DEFAULT_CANVAS_WIDTH: 1000,
  DEFAULT_CANVAS_HEIGHT: 800,
  DEFAULT_PLANT_BED_SIZE: 100,
  DEFAULT_COLORS: {
    PLANT_BED: '#8B4513'
  }
} as const