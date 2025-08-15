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

// ===================================================================
// EXISTING TYPES (Extended for Visual Garden Designer)
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
  bloom_season?: string;
  height?: number;
  spread?: number;
  sun_requirements?: string;
  water_requirements?: string;
  soil_requirements?: string;
  maintenance_level?: string;
  special_features?: string;
  notes?: string;
  image_url?: string;
  status: 'active' | 'archived' | 'deleted';
  archived_at?: string;
  deleted_at?: string;
  soft_delete: boolean;
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
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  task_type: 'watering' | 'fertilizing' | 'pruning' | 'planting' | 'harvesting' | 'maintenance' | 'other';
  recurring: boolean;
  recurrence_pattern?: string;
  estimated_duration?: number;
  actual_duration?: number;
  notes?: string;
  soft_delete: boolean;
}

export interface LogbookEntry {
  id: string;
  title: string;
  content: string;
  garden_id: string;
  plant_bed_id?: string;
  plant_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  entry_date: string;
  weather_conditions?: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  notes?: string;
  images?: string[];
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  soft_delete: boolean;
}

export interface Plantvak {
  id: string;
  name: string;
  letter_code: string;
  plant_bed_id: string;
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
  status: 'active' | 'archived' | 'deleted';
  archived_at?: string;
  deleted_at?: string;
  soft_delete: boolean;
}

export interface PlantvakWithPlants extends Plantvak {
  plants: Plant[];
}

// ===================================================================
// DATABASE SCHEMA TYPES
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
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      logbook_entries: {
        Row: LogbookEntry;
        Insert: Omit<LogbookEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LogbookEntry, 'id' | 'created_at' | 'updated_at'>>;
      };
      plantvaks: {
        Row: Plantvak;
        Insert: Omit<Plantvak, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Plantvak, 'id' | 'created_at' | 'updated_at'>>;
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
// UTILITY FUNCTIONS
// ===================================================================

export function isTestEnvironment(): boolean {
  return getCurrentEnvironment() === 'test';
}

export function getSupabaseUrl(): string {
  return config.url;
}

export function getSupabaseAnonKey(): string {
  return config.anonKey;
}

// ===================================================================
// EXPORT ALL TYPES
// ===================================================================

export type {
  Garden,
  PlantBed,
  Plant,
  PlantBedWithPlants,
  PlantWithPosition,
  User,
  GardenAccess,
  Task,
  LogbookEntry,
  Plantvak,
  PlantvakWithPlants,
  Database
};