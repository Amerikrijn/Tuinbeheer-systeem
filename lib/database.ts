import { DatabaseService } from "./services/database.service"
import { supabase } from "./supabase"
import type { Plantvak, Tuin, LogbookEntry, Bloem, Task, User, PlantvakWithBloemen, PlantWithPosition } from "./types/index"
import { PlantvakService } from "./services/plantvak.service"

// Type aliases for backward compatibility
type PlantBed = Plantvak
type Garden = Tuin
type Plant = Bloem
type PlantBedWithPlants = PlantvakWithBloemen & {
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
  rotation: number
  z_index: number
  color_code: string
  visual_updated_at: string
}

// Retry configuration - Optimized for Supabase free tier
const RETRY_CONFIG = {
  maxRetries: 1,          // Reduced from 3 to avoid rate limit spiral
  initialDelay: 100,      // 100ms instead of 1000ms
  maxDelay: 500,          // 500ms instead of 5000ms
  backoffMultiplier: 2
}

// Error logger that only logs in development
function logError(message: string, error: any) {
  if (process.env.NODE_ENV === 'development') {

  }
  // In production, errors could be sent to a monitoring service
}

// Helper function to check if error is a missing relation
function isMissingRelation(err: { code?: string } | null): boolean {
  return !!err && err.code === "42P01"
}

// Retry wrapper for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: any
  let delay = RETRY_CONFIG.initialDelay

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on certain errors (expanded list for free tier)
      if (error?.code === 'PGRST116' || // RLS violation
          error?.code === '23505' || // Unique constraint violation
          error?.code === '23503' || // Foreign key violation
          error?.code === '42P01' || // Table doesn't exist
          error?.code === '57014' || // Statement timeout
          error?.code === '53300' || // Too many connections
          error?.code === '53400' || // Configuration limit exceeded
          error?.message?.includes('rate limit') ||
          error?.message?.includes('too many requests')) {
        throw error // Don't retry rate limits - it makes things worse!
      }

      // If this is the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxRetries) {
        logError(`${operationName} failed after ${attempt} attempts:`, error)
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
      delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay)
    }
  }

  throw lastError
}

// Garden functions
export async function getGardens(): Promise<Garden[]> {
  return withRetry(async () => {
    const result = await DatabaseService.Tuin.getAll()
    
    if (!result.success) {
      logError("Error fetching gardens:", result.error)
      return []
    }

    return result.data?.data || []
  }, 'getGardens')
}

export async function getGarden(id?: string): Promise<Garden | null> {
  return withRetry(async () => {
    if (!id) {
      // Get the first active garden if no ID provided
      const result = await DatabaseService.Tuin.getAll()
      
      if (!result.success || !result.data || result.data.data.length === 0) {
        logError("Error fetching default garden:", result.error)
        return null
      }

      return result.data.data[0]
    }

    const result = await DatabaseService.Tuin.getById(id)
    
    if (!result.success) {
      logError("Error fetching garden:", result.error)
      return null
    }

    return result.data
  }, 'getGarden')
}

export async function createGarden(garden: {
  name: string
  description?: string
  location: string
  total_area?: string
  length?: string
  width?: string
  garden_type?: string
  established_date?: string
  notes?: string
}): Promise<Garden | null> {
  return withRetry(async () => {
    // Test if table exists first
    const { data: testData, error: testError } = await supabase.from("gardens").select("id").limit(1)

    if (testError) {
      if (isMissingRelation(testError)) {
        throw new Error("Database tables not found. Please run the migration first.")
      }
      throw testError
    }

    // INSERT … RETURNING * (single round-trip)
    const { data, error } = await supabase
      .from("gardens")
      .insert({
        name: garden.name,
        description: garden.description || null,
        location: garden.location,
        total_area: garden.total_area || null,
        length: garden.length || null,
        width: garden.width || null,
        garden_type: garden.garden_type || null,
        established_date: garden.established_date || null,
        notes: garden.notes || null,
        is_active: true,
      })
      .select("*")
      .single()

    if (error) {
      logError("Supabase insert error (gardens):", {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    return data
  }, 'createGarden')
}

export async function updateGarden(id: string, updates: Partial<Garden>): Promise<Garden | null> {
  return withRetry(async () => {
    const { data, error } = await supabase.from("gardens").update(updates).eq("id", id).select().single()

    if (error) {
      logError("Error updating garden:", error)
      throw error
    }

    return data
  }, 'updateGarden')
}

export async function deleteGarden(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase.from("gardens").update({ is_active: false }).eq("id", id)

    if (error) {
      logError("Error deleting garden:", error)
      throw error
    }
  }, 'deleteGarden')
}

// Plant bed functions
export async function getPlantBeds(gardenId?: string): Promise<PlantBedWithPlants[]> {
  // Use JOIN query to fetch plant beds with plants in a single query
  // This avoids N+1 query problem (1 query instead of N+1)
  let query = supabase
    .from("plant_beds")
    .select(`
      *,
      plants (*)
    `)
    .eq("is_active", true)
    .order("id")
    .limit(100) // Limit plant beds to 100 for performance

  if (gardenId) {
    query = query.eq("garden_id", gardenId)
  }

  const { data: plantBedsWithPlants, error } = await query

  if (error) {
    if (isMissingRelation(error)) {
      logError("Missing relation in plant beds query", error)
      return []
    }
    logError(`Error fetching plant beds${gardenId ? ` for garden ${gardenId}` : ''}`, error)
    return []
  }

  // Transform the data to match expected format
  const transformedData = (plantBedsWithPlants || []).map(bed => ({
    ...bed,
    plants: bed.plants || []
  }))

  return transformedData
}

export async function getPlantBed(id: string): Promise<PlantBedWithPlants | null> {
  // Use JOIN query to fetch plant bed with plants in a single query
  const { data: plantBed, error } = await supabase
    .from("plant_beds")
    .select(`
      *,
      plants (*)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) {
    if (isMissingRelation(error)) {
      logError("Missing relation in plant bed query", error)
      return null
    }
    logError(`Error fetching plant bed ${id}`, error)
    return null
  }

  if (!plantBed) {
    return null
  }

  // Transform the data to match expected format
  return {
    ...plantBed,
    plants: plantBed.plants || []
  }
}

export async function createPlantBed(plantBed: {
  garden_id: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
  description?: string
}): Promise<PlantBed | null> {

  try {
    // Use the new PlantvakService for automatic letter code assignment
    const result = await PlantvakService.create({
      garden_id: plantBed.garden_id,
      location: plantBed.location,
      size: plantBed.size,
      soil_type: plantBed.soil_type,
      sun_exposure: plantBed.sun_exposure,
      description: plantBed.description
    })
    
    if (result) {

      return result
    } else {

      return null
    }
  } catch (error) {

    throw error
  }
}

export async function updatePlantBed(id: string, updates: Partial<PlantBed>): Promise<PlantBed | null> {
  const { data, error } = await supabase.from("plant_beds").update(updates).eq("id", id).select().single()

  if (error) {

    throw error
  }

  return data
}

export async function deletePlantBed(id: string): Promise<void> {

  const { data, error } = await supabase
    .from("plant_beds")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single()

  if (error) {

    throw error
  }

}

// Plant functions
export async function createPlant(plant: {
  plant_bed_id: string
  name: string
  scientific_name?: string
  latin_name?: string
  variety?: string
  color?: string
  plant_color?: string
  height?: number
  plant_height?: number
  plants_per_sqm?: number
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  stem_length?: number
  photo_url?: string
  category?: string
  bloom_period?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
  emoji?: string
}): Promise<Plant | null> {
  const { data, error } = await supabase.from("plants").insert(plant).select().single()

  if (error) {

    throw error
  }

  return data
}

export async function updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | null> {
  const { data, error } = await supabase.from("plants").update(updates).eq("id", id).select().single()

  if (error) {

    throw error
  }

  return data
}

export async function deletePlant(id: string): Promise<void> {
  const { error } = await supabase.from("plants").delete().eq("id", id)

  if (error) {

    throw error
  }
}

export async function getPlant(id: string): Promise<Plant | null> {
  const { data, error } = await supabase.from("plants").select("*").eq("id", id).single()

  if (error) {

    return null
  }

  return data
}

// ===================================================================
// VISUAL PLANT DESIGNER FUNCTIONS
// ===================================================================

// Get plants with positions for visual designer
export async function getPlantsWithPositions(plantBedId: string): Promise<PlantWithPosition[]> {
  const { data: plants, error } = await supabase
    .from("plants")
    .select("*")
    .eq("plant_bed_id", plantBedId)
    .order("created_at", { ascending: true })
    .limit(200) // Added limit for performance
    .limit(200) // Added limit - max 200 plants for visual designer

  if (error) {

    return []
  }

  // Convert to PlantWithPosition format with defaults
  return (plants || []).map(plant => ({
    ...plant,
    position_x: plant.position_x ?? Math.random() * 400,
    position_y: plant.position_y ?? Math.random() * 300,
    visual_width: plant.visual_width ?? 40,
    visual_height: plant.visual_height ?? 40,
    emoji: plant.emoji
  })) as PlantWithPosition[]
}

// Create plant for visual designer
export async function createVisualPlant(plant: {
  plant_bed_id: string
  name: string
  color: string
  status: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
  emoji?: string
  photo_url?: string | null
  is_custom?: boolean
  category?: string
  notes?: string
  latin_name?: string
  plant_color?: string
  plant_height?: number
  plants_per_sqm?: number
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  planting_date?: string
  bloom_period?: string
}): Promise<PlantWithPosition | null> {
  const { data, error } = await supabase.from("plants").insert({
    plant_bed_id: plant.plant_bed_id,
    name: plant.name,
    color: plant.color,
    status: plant.status,
    position_x: plant.position_x,
    position_y: plant.position_y,
    visual_width: plant.visual_width,
    visual_height: plant.visual_height,
    emoji: plant.emoji,
    photo_url: plant.photo_url,
    is_custom: plant.is_custom,
    category: plant.category,
    notes: plant.notes,
    latin_name: plant.latin_name,
    plant_color: plant.plant_color,
    plant_height: plant.plant_height,
    plants_per_sqm: plant.plants_per_sqm,
    sun_preference: plant.sun_preference,
    planting_date: plant.planting_date,
    bloom_period: plant.bloom_period,
  }).select().single()

  if (error) {

    throw error
  }

  return data as PlantWithPosition
}

// Update plant position and visual properties
export async function updatePlantPosition(id: string, updates: {
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  name?: string
  color?: string
  status?: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  emoji?: string
  is_custom?: boolean
  category?: string
  notes?: string
  photo_url?: string | null
  latin_name?: string
  plant_color?: string
  plant_height?: number
  plants_per_sqm?: number
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  planting_date?: string
  bloom_period?: string
}): Promise<PlantWithPosition | null> {
  const { data, error } = await supabase
    .from("plants")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {

    throw error
  }

  return data as PlantWithPosition
}
