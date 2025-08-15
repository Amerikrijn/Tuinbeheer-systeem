import { createClient } from '@supabase/supabase-js';

// Get configuration based on environment
function getSupabaseConfig() {
  // Check if we're in test environment
  const isTest = process.env.APP_ENV === 'test' || process.env.NODE_ENV === 'test';

  if (isTest) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL_TEST || 'https://dwsgwqosmihsfaxuheji.supabase.co',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHV1aGVqaSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUyNTEyNzUwLCJleHAiOjIwNjgwODg3NTB9.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    };
  } else {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
    };
  }
}

function getCurrentEnvironment() {
  return process.env.APP_ENV === 'test' || process.env.NODE_ENV === 'test' ? 'test' : 'prod';
}

// Get environment-specific configuration
const config = getSupabaseConfig();

// Validate configuration
if (!config.url || !config.anonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ===================================================================
// SUPABASE CLIENT SETUP
// ===================================================================

export const supabase = createClient(config.url, config.anonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  config.url,
  process.env.SUPABASE_SERVICE_ROLE_KEY || config.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// ===================================================================
// CORE TYPES
// ===================================================================

export interface Garden {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  location?: string;
  climate_zone?: string;
  soil_type?: string;
  sun_exposure?: string;
  water_frequency?: string;
  maintenance_level?: string;
  garden_style?: string;
  color_scheme?: string;
  season_interest?: string;
  special_features?: string;
  notes?: string;
  image_url?: string;
  thumbnail_url?: string;
  status: 'active' | 'archived' | 'deleted';
  archived_at?: string;
  deleted_at?: string;
  soft_delete: boolean;
}

export interface PlantBed {
  id: string;
  name: string;
  description?: string;
  garden_id: string;
  created_at: string;
  updated_at: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'circle' | 'oval' | 'freeform';
  color?: string;
  border_style?: string;
  border_color?: string;
  fill_pattern?: string;
  size?: string;
  sun_exposure?: string;
  soil_type?: string;
  status: 'active' | 'archived' | 'deleted';
  archived_at?: string;
  deleted_at?: string;
  soft_delete: boolean;
}

export interface Plant {
  id: string;
  name: string;
  scientific_name?: string;
  common_name?: string;
  plant_bed_id: string;
  created_at: string;
  updated_at: string;
  position_x: number;
  position_y: number;
  size: number;
  color?: string;
  height?: number;
  variety?: string;
  plants_per_sqm?: number;
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade';
  planting_date?: string;
  expected_harvest_date?: string;
  status: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst';
  care_instructions?: string;
  watering_frequency?: string;
  fertilizer_schedule?: string;
  emoji?: string;
  image_url?: string;
  notes?: string;
}

export interface PlantBedWithPlants extends PlantBed {
  plants: Plant[];
}

export interface PlantWithPosition extends Plant {
  bed: PlantBed;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
  status: 'active' | 'inactive' | 'suspended';
}

export interface GardenAccess {
  id: string;
  user_id: string;
  garden_id: string;
  access_level: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
  granted_by?: string;
  expires_at?: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  garden_id: string;
  plant_bed_id?: string;
  plant_id?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  task_type?: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'planting' | 'pest_control' | 'general';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: string;
  notes?: string;
}

// ===================================================================
// API TYPES
// ===================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BulkUpdatePositionsRequest {
  positions: Array<{
    id: string;
    position_x: number;
    position_y: number;
  }>;
}

export interface UpdatePositionRequest {
  position_x: number;
  position_y: number;
}

// ===================================================================
// VISUAL GARDEN CONSTANTS
// ===================================================================

export const VISUAL_GARDEN_CONSTANTS = {
  GRID_SIZE: 20,
  MIN_PLANT_SIZE: 1,
  MAX_PLANT_SIZE: 5,
  DEFAULT_PLANT_SIZE: 2,
  CANVAS_PADDING: 20,
  PLANT_SPACING: 2,
  BED_MIN_SIZE: 3,
  BED_MAX_SIZE: 10
} as const;

// ===================================================================
// DATABASE TYPES
// ===================================================================

export interface Database {
  public: {
    Tables: {
      gardens: {
        Row: Garden;
        Insert: Omit<Garden, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Garden, 'id' | 'created_at' | 'updated_at'>>;
      };
      plant_beds: {
        Row: PlantBed;
        Insert: Omit<PlantBed, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlantBed, 'id' | 'created_at' | 'updated_at'>>;
      };
      plants: {
        Row: Plant;
        Insert: Omit<Plant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Plant, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      garden_access: {
        Row: GardenAccess;
        Insert: Omit<GardenAccess, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GardenAccess, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ===================================================================
// LEGACY TYPES (for backward compatibility)
// ===================================================================

// Type aliases for backward compatibility
export type Plantvak = PlantBed;
export type PlantvakWithBloemen = PlantBedWithPlants;
export type Bloem = Plant;

// ===================================================================
// EXPORT ALL TYPES
// ===================================================================

// All types are already exported above, no need to re-export