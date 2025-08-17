import { createClient, type SupabaseClient, AuthError } from '@supabase/supabase-js'

// ========================================
// SUPABASE CREDENTIALS (Preview Environment)
// ========================================
// These are the actual credentials for your preview environment
// Connected to: https://dwsgwqosmihsfaxuheji.supabase.co
// ========================================

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Get or create Supabase client instance
const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Use environment variables with fallbacks for development
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwsgwqosmihsfaxuheji.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
  
  // Console logging removed for production stability
  
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwsgwqosmihsfaxuheji.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMjc1MCwiZXhwIjoyMDY4MDg4NzUwfQ.Bc26dsmPHzjetITmfjcvvIl9gDYkBfmSbSETQWv4AQY'
  
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