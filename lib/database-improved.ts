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
  // In production, you could send to a monitoring service here
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
    const { data: testData, error: testError } = await supabase
      .from("gardens")
      .select("id")
      .limit(1)

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
    const { data, error } = await supabase
      .from("gardens")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logError("Error updating garden:", error)
      throw error
    }

    return data
  }, 'updateGarden')
}

export async function deleteGarden(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from("gardens")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      logError("Error deleting garden:", error)
      throw error
    }
  }, 'deleteGarden')
}

// Plant bed functions
export async function getPlantBeds(gardenId?: string): Promise<PlantBedWithPlants[]> {
  return withRetry(async () => {
    let query = supabase
      .from("plant_beds")
      .select("*")
      .eq("is_active", true)
      .order("id")
      .limit(100) // Added limit for performance

    if (gardenId) {
      query = query.eq("garden_id", gardenId)
    }

    const { data: plantBeds, error: plantBedsError } = await query

    if (plantBedsError) {
      if (isMissingRelation(plantBedsError)) {
        return []
      }
      logError("Error fetching plant beds:", plantBedsError)
      return []
    }

    // Fetch plants for each plant bed
    const plantBedsWithPlants = await Promise.all(
      (plantBeds || []).map(async (bed) => {
        const { data: plants, error: plantsError } = await supabase
          .from("plants")
          .select("*")
          .eq("plant_bed_id", bed.id)
          .order("created_at", { ascending: false })
          .limit(50) // Added limit - max 50 plants per bed

        if (plantsError) {
          logError("Error fetching plants for bed:", plantsError)
          return { ...bed, plants: [] }
        }

        return { ...bed, plants: plants || [] }
      }),
    )

    return plantBedsWithPlants
  }, 'getPlantBeds')
}

export async function getPlantBed(id: string): Promise<PlantBedWithPlants | null> {
  return withRetry(async () => {
    const { data: plantBed, error: plantBedError } = await supabase
      .from("plant_beds")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (plantBedError) {
      if (isMissingRelation(plantBedError)) {
        return null
      }
      logError("Error fetching plant bed:", plantBedError)
      return null
    }

    const { data: plants, error: plantsError } = await supabase
      .from("plants")
      .select("*")
      .eq("plant_bed_id", id)
      .order("created_at", { ascending: false })
      .limit(100) // Added limit for performance

    if (plantsError) {
      logError("Error fetching plants:", plantsError)
      return { ...plantBed, plants: [] }
    }

    return { ...plantBed, plants: plants || [] }
  }, 'getPlantBed')
}

export async function createPlantBed(plantBed: {
  garden_id: string
  name: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: string
  description?: string
}): Promise<PlantBed | null> {
  return withRetry(async () => {
    // Generate the next letter code
    const letterCode = await PlantvakService.generateNextLetterCode(plantBed.garden_id)
    
    const { data, error } = await supabase
      .from("plant_beds")
      .insert({
        ...plantBed,
        name: letterCode,
        letter_code: letterCode,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      logError("Error creating plant bed:", error)
      throw error
    }

    return data
  }, 'createPlantBed')
}

export async function updatePlantBed(id: string, updates: Partial<PlantBed>): Promise<PlantBed | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("plant_beds")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logError("Error updating plant bed:", error)
      throw error
    }

    return data
  }, 'updatePlantBed')
}

export async function deletePlantBed(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from("plant_beds")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      logError("Error deleting plant bed:", error)
      throw error
    }
  }, 'deletePlantBed')
}

// Plant functions
export async function getPlants(plantBedId?: string): Promise<Plant[]> {
  return withRetry(async () => {
    let query = supabase.from("plants").select("*")

    if (plantBedId) {
      query = query.eq("plant_bed_id", plantBedId)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(200) // Added limit

    if (error) {
      if (isMissingRelation(error)) {
        return []
      }
      logError("Error fetching plants:", error)
      return []
    }

    return data || []
  }, 'getPlants')
}

export async function getPlant(id: string): Promise<Plant | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (isMissingRelation(error)) {
        return null
      }
      logError("Error fetching plant:", error)
      return null
    }

    return data
  }, 'getPlant')
}

export async function createPlant(plant: Omit<Plant, "id" | "created_at" | "updated_at">): Promise<Plant | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("plants")
      .insert(plant)
      .select()
      .single()

    if (error) {
      logError("Error creating plant:", error)
      throw error
    }

    return data
  }, 'createPlant')
}

export async function updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("plants")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logError("Error updating plant:", error)
      throw error
    }

    return data
  }, 'updatePlant')
}

export async function deletePlant(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from("plants")
      .delete()
      .eq("id", id)

    if (error) {
      logError("Error deleting plant:", error)
      throw error
    }
  }, 'deletePlant')
}

// Logbook functions
export async function getLogbookEntries(plantBedId?: string): Promise<LogbookEntry[]> {
  return withRetry(async () => {
    let query = supabase.from("logbook_entries").select("*")

    if (plantBedId) {
      query = query.eq("plant_bed_id", plantBedId)
    }

    const { data, error } = await query.order("entry_date", { ascending: false }).limit(100) // Added limit

    if (error) {
      if (isMissingRelation(error)) {
        return []
      }
      logError("Error fetching logbook entries:", error)
      return []
    }

    return data || []
  }, 'getLogbookEntries')
}

export async function getLogbookEntry(id: string): Promise<LogbookEntry | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("logbook_entries")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (isMissingRelation(error)) {
        return null
      }
      logError("Error fetching logbook entry:", error)
      return null
    }

    return data
  }, 'getLogbookEntry')
}

export async function createLogbookEntry(
  entry: Omit<LogbookEntry, "id" | "created_at" | "updated_at">
): Promise<LogbookEntry | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("logbook_entries")
      .insert(entry)
      .select()
      .single()

    if (error) {
      logError("Error creating logbook entry:", error)
      throw error
    }

    return data
  }, 'createLogbookEntry')
}

export async function updateLogbookEntry(id: string, updates: Partial<LogbookEntry>): Promise<LogbookEntry | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("logbook_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logError("Error updating logbook entry:", error)
      throw error
    }

    return data
  }, 'updateLogbookEntry')
}

export async function deleteLogbookEntry(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from("logbook_entries")
      .delete()
      .eq("id", id)

    if (error) {
      logError("Error deleting logbook entry:", error)
      throw error
    }
  }, 'deleteLogbookEntry')
}

// Task functions
export async function getTasks(gardenId?: string): Promise<Task[]> {
  return withRetry(async () => {
    let query = supabase.from("tasks").select("*")

    if (gardenId) {
      query = query.eq("garden_id", gardenId)
    }

    const { data, error } = await query.order("due_date", { ascending: true }).limit(100) // Added limit

    if (error) {
      if (isMissingRelation(error)) {
        return []
      }
      logError("Error fetching tasks:", error)
      return []
    }

    return data || []
  }, 'getTasks')
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single()

    if (error) {
      logError("Error creating task:", error)
      throw error
    }

    return data
  }, 'createTask')
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logError("Error updating task:", error)
      throw error
    }

    return data
  }, 'updateTask')
}

export async function deleteTask(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) {
      logError("Error deleting task:", error)
      throw error
    }
  }, 'deleteTask')
}

// User functions
export async function getUsers(): Promise<User[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500) // Added limit - reasonable for user management

    if (error) {
      logError("Error fetching users:", error)
      return []
    }

    return data || []
  }, 'getUsers')
}

// Plant bed position functions
export async function updatePlantBedPositions(
  gardenId: string,
  positions: Array<{
    id: string
    position_x: number
    position_y: number
    visual_width: number
    visual_height: number
    rotation: number
    z_index: number
    color_code: string
  }>
): Promise<boolean> {
  return withRetry(async () => {
    const updates = positions.map((pos) => ({
      id: pos.id,
      garden_id: gardenId,
      position_x: pos.position_x,
      position_y: pos.position_y,
      visual_width: pos.visual_width,
      visual_height: pos.visual_height,
      rotation: pos.rotation,
      z_index: pos.z_index,
      color_code: pos.color_code,
      visual_updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("plant_beds").upsert(updates)

    if (error) {
      logError("Error updating plant bed positions:", error)
      throw error
    }

    return true
  }, 'updatePlantBedPositions')
}

// Plant position functions
export async function getPlantsByBedId(bedId: string): Promise<PlantWithPosition[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("plant_bed_id", bedId)
      .order("created_at", { ascending: false })

    if (error) {
      logError("Error fetching plants by bed id:", error)
      return []
    }

    return data || []
  }, 'getPlantsByBedId')
}

export async function updatePlantPositions(
  plantBedId: string,
  positions: Array<{
    id: string
    position_x: number
    position_y: number
    visual_width?: number
    visual_height?: number
  }>
): Promise<boolean> {
  return withRetry(async () => {
    const updates = positions.map((pos) => ({
      id: pos.id,
      plant_bed_id: plantBedId,
      position_x: pos.position_x,
      position_y: pos.position_y,
      visual_width: pos.visual_width || 40,
      visual_height: pos.visual_height || 40,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("plants").upsert(updates)

    if (error) {
      logError("Error updating plant positions:", error)
      throw error
    }

    return true
  }, 'updatePlantPositions')
}

// Export all functions for backward compatibility
export * from "./services/database.service"
export * from "./services/plantvak.service"