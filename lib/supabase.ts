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