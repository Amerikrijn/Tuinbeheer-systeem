import { createClient, type SupabaseClient, AuthError } from '@supabase/supabase-js'
import { env } from '@/lib/env'

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Create mock client for development when env vars are missing
const createMockClient = (): SupabaseClient => {
  console.warn('⚠️ Using mock Supabase client - environment variables not set')
  
  // Create a minimal mock client that satisfies the SupabaseClient interface
  const mockClient = createClient('https://mock.supabase.co', 'mock-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
  
  // Override methods to return mock responses that match the expected types
  mockClient.auth.getSession = async () => ({ data: { session: null }, error: null })
  mockClient.auth.onAuthStateChange = () => ({ 
    data: { 
      subscription: { 
        id: 'mock-subscription',
        callback: () => {},
        unsubscribe: () => {} 
      } 
    } 
  })
  mockClient.auth.signInWithPassword = async () => ({ 
    data: { user: null, session: null }, 
    error: new AuthError('Mock client - set environment variables', { status: 400, name: 'AuthError' })
  })
  mockClient.auth.signOut = async () => ({ data: {}, error: null })
  mockClient.auth.resetPasswordForEmail = async () => ({ data: {}, error: null })
  
  return mockClient
}

// Get or create Supabase client instance
const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are missing!')
    console.error('Please set the following in your Vercel environment:')
    console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
    
    // In development, use mock client
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Development mode: Using mock Supabase client')
      supabaseInstance = createMockClient()
      return supabaseInstance
    }
    
    throw new Error('Supabase environment variables are required in production')
  }
  
  console.log('🔧 Creating Supabase client with URL:', supabaseUrl)
  console.log('🔑 Anon key present:', !!supabaseAnonKey)
  
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

// Get or create Supabase admin client instance
const getSupabaseAdminClient = (): SupabaseClient => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Development mode: Using mock admin client')
      supabaseAdminInstance = createMockClient()
      return supabaseAdminInstance
    }
    throw new Error('Supabase admin environment variables are required in production')
  }
  
  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  return supabaseAdminInstance
}

// Export singleton instances
export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()

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