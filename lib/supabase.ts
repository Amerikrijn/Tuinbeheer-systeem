import { createClient } from '@supabase/supabase-js'

// 🚨 TEMPORARY FIX: Disabled for Cursor release issue
// TODO: Re-enable after environment variables are properly configured

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with banking security standards
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true
//   },
//   // Secure configuration for banking standards
//   global: {
//     headers: {
//       'X-Client-Info': 'tuinbeheer-banking-app'
//     }
//   }
// })

// 🚨 TEMPORARY: Mock Supabase client
export const supabase = {
  auth: {
    signIn: async () => ({ error: null, data: { user: null, session: null } }),
    signOut: async () => ({ error: null }),
    signUp: async () => ({ error: null, data: { user: null, session: null } }),
    resetPasswordForEmail: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ error: null, data: { session: null } }),
    getUser: async () => ({ error: null, data: { user: null } })
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ error: null, data: null }) }) }),
    insert: () => ({ select: () => ({ single: async () => ({ error: null, data: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ error: null, data: null }) }) }) }),
    delete: () => ({ eq: async () => ({ error: null }) })
  }),
  storage: {
    getBucket: async () => ({ error: null, data: null }),
    createBucket: async () => ({ error: null, data: null })
  },
  rpc: async () => ({ error: null, data: null })
} as any

// Admin client for server-side operations (banking compliance)
// export const supabaseAdmin = createClient(
//   supabaseUrl,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!,
//   {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false
//     }
//   }
// )

// 🚨 TEMPORARY: Mock admin client
export const supabaseAdmin = supabase

// Banking security utilities
export const secureSupabaseCall = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    // Secure error handling for banking standards - no console logging in production
    return fallback
  }
}

// Type definitions for compatibility
export interface Plant {
  id: string
  plant_bed_id: string
  name: string
  scientific_name?: string
  latin_name?: string
  variety?: string
  color?: string
  plant_color?: string
  height?: number
  plant_height?: number
  stem_length?: number
  plants_per_sqm?: number
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  photo_url?: string
  category?: string
  bloom_period?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst'
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
  // Visual designer properties
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  emoji?: string
  is_custom?: boolean
  created_at: string
  updated_at: string
}

export interface Garden {
  id: string
  name: string
  description?: string
  location: string
  total_area?: string
  length?: string
  width?: string
  garden_type?: string
  established_date?: string
  season_year: number
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Visual properties
  canvas_width?: number
  canvas_height?: number
  grid_size?: number
  default_zoom?: number
  show_grid?: boolean
  snap_to_grid?: boolean
  background_color?: string
}

export interface PlantBedWithPlants extends PlantBed {
  plants: Plant[]
}

export interface PlantWithPosition extends Plant {
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

export interface PlantBed {
  id: string
  name: string
  garden_id: string
  letter_code?: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
  season_year: number
  description?: string
  is_active?: boolean
  created_at: string
  updated_at: string
  // Visual properties
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  rotation?: number
  z_index?: number
  color_code?: string
  visual_updated_at?: string
}

export interface PlantBedWithPosition extends PlantBed {
  position_x?: number
  position_y?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
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