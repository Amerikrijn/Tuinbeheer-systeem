import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.CUSTOM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Database {
  public: {
    Tables: {
      gardens: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string
          total_area: string | null
          length: string | null
          width: string | null
          garden_type: string | null
          maintenance_level: string | null
          soil_condition: string | null
          watering_system: string | null
          established_date: string | null
          created_at: string
          updated_at: string
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location: string
          total_area?: string | null
          length?: string | null
          width?: string | null
          garden_type?: string | null
          maintenance_level?: string | null
          soil_condition?: string | null
          watering_system?: string | null
          established_date?: string | null
          created_at?: string
          updated_at?: string
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string
          total_area?: string | null
          length?: string | null
          width?: string | null
          garden_type?: string | null
          maintenance_level?: string | null
          soil_condition?: string | null
          watering_system?: string | null
          established_date?: string | null
          created_at?: string
          updated_at?: string
          notes?: string | null
          is_active?: boolean
        }
      }
      plant_beds: {
        Row: {
          id: string
          garden_id: string
          name: string
          location: string | null
          size: string | null
          soil_type: string | null
          sun_exposure: "full-sun" | "partial-sun" | "shade"
          description: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          garden_id: string
          name: string
          location?: string | null
          size?: string | null
          soil_type?: string | null
          sun_exposure?: "full-sun" | "partial-sun" | "shade"
          description?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          garden_id?: string
          name?: string
          location?: string | null
          size?: string | null
          soil_type?: string | null
          sun_exposure?: "full-sun" | "partial-sun" | "shade"
          description?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      plants: {
        Row: {
          id: string
          plant_bed_id: string
          name: string
          scientific_name: string | null
          variety: string | null
          color: string | null
          height: number | null
          planting_date: string | null
          expected_harvest_date: string | null
          status: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
          notes: string | null
          care_instructions: string | null
          watering_frequency: number | null
          fertilizer_schedule: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plant_bed_id: string
          name: string
          scientific_name?: string | null
          variety?: string | null
          color?: string | null
          height?: number | null
          planting_date?: string | null
          expected_harvest_date?: string | null
          status?: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
          notes?: string | null
          care_instructions?: string | null
          watering_frequency?: number | null
          fertilizer_schedule?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plant_bed_id?: string
          name?: string
          scientific_name?: string | null
          variety?: string | null
          color?: string | null
          height?: number | null
          planting_date?: string | null
          expected_harvest_date?: string | null
          status?: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
          notes?: string | null
          care_instructions?: string | null
          watering_frequency?: number | null
          fertilizer_schedule?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Garden = Database["public"]["Tables"]["gardens"]["Row"]
export type PlantBed = Database["public"]["Tables"]["plant_beds"]["Row"]
export type Plant = Database["public"]["Tables"]["plants"]["Row"]

export type PlantBedWithPlants = PlantBed & {
  plants: Plant[]
}
