import { DatabaseService } from "./services/database.service"
import { supabase, type Garden, type PlantBed, type Plant, type PlantBedWithPlants, type PlantWithPosition } from "./supabase"

function isMissingRelation(err: { code?: string } | null): boolean {
  return !!err && err.code === "42P01"
}

// Garden functions
export async function getGardens(): Promise<Garden[]> {
  console.log("Fetching gardens...")
  const result = await DatabaseService.Tuin.getAll()
  
  if (!result.success) {
    console.error("Error fetching gardens:", result.error)
    return []
  }

  console.log("Gardens fetched successfully:", result.data?.length || 0)
  return result.data || []
}

export async function getGarden(id?: string): Promise<Garden | null> {
  if (!id) {
    // Get the first active garden if no ID provided
    const result = await DatabaseService.Tuin.getAll()
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.error("Error fetching default garden:", result.error)
      return null
    }

    return result.data[0]
  }

  const result = await DatabaseService.Tuin.getById(id)
  
  if (!result.success) {
    console.error("Error fetching garden:", result.error)
    return null
  }

  return result.data
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
  console.log("Creating garden with data:", garden)

  // Test if table exists first
  const { data: testData, error: testError } = await supabase.from("gardens").select("id").limit(1)

  if (testError) {
    console.error("Table test failed:", testError)
    if (isMissingRelation(testError)) {
      throw new Error("Database tables not found. Please run the migration first.")
    }
    throw testError
  }

  console.log("Table exists, proceeding with insert...")

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
    console.error("Supabase insert error (gardens):", {
      error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw error
  }

  console.log("Garden created successfully:", data)
  return data
}

export async function updateGarden(id: string, updates: Partial<Garden>): Promise<Garden | null> {
  const { data, error } = await supabase.from("gardens").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating garden:", error)
    throw error
  }

  return data
}

export async function deleteGarden(id: string): Promise<void> {
  const { error } = await supabase.from("gardens").update({ is_active: false }).eq("id", id)

  if (error) {
    console.error("Error deleting garden:", error)
    throw error
  }
}

// Plant bed functions
export async function getPlantBeds(gardenId?: string): Promise<PlantBedWithPlants[]> {
  let query = supabase.from("plant_beds").select("*").eq("is_active", true).order("id")

  if (gardenId) {
    query = query.eq("garden_id", gardenId)
  }

  const { data: plantBeds, error: plantBedsError } = await query

  if (plantBedsError) {
    if (isMissingRelation(plantBedsError)) {
      console.warn("Supabase table `plant_beds` not found yet – returning empty list until the migration is applied.")
      return []
    }
    console.error("Error fetching plant beds:", plantBedsError)
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

      if (plantsError) {
        console.error("Error fetching plants for bed:", bed.id, plantsError)
        return { ...bed, plants: [] }
      }

      return { ...bed, plants: plants || [] }
    }),
  )

  return plantBedsWithPlants
}

export async function getPlantBed(id: string): Promise<PlantBedWithPlants | null> {
  const { data: plantBed, error: plantBedError } = await supabase
    .from("plant_beds")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (plantBedError) {
    if (isMissingRelation(plantBedError)) {
      console.warn("Supabase table `plant_beds` not found yet – returning null until the migration is applied.")
      return null
    }
    console.error("Error fetching plant bed:", plantBedError)
    return null
  }

  const { data: plants, error: plantsError } = await supabase
    .from("plants")
    .select("*")
    .eq("plant_bed_id", id)
    .order("created_at", { ascending: false })

  if (plantsError) {
    console.error("Error fetching plants:", plantsError)
    return { ...plantBed, plants: [] }
  }

  return { ...plantBed, plants: plants || [] }
}

export async function createPlantBed(plantBed: {
  garden_id: string
  name: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
  description?: string
}): Promise<PlantBed | null> {
  console.log("🌱 Creating plant bed:", plantBed)
  
  // Check if garden exists first
  const { data: gardenExists, error: gardenCheckError } = await supabase
    .from("gardens")
    .select("id")
    .eq("id", plantBed.garden_id)
    .single()
  
  if (gardenCheckError || !gardenExists) {
    console.error("❌ Garden does not exist:", { garden_id: plantBed.garden_id, error: gardenCheckError })
    throw new Error(`Garden with id ${plantBed.garden_id} does not exist`)
  }
  
  console.log("✅ Garden exists, proceeding with plant bed creation")
  
  // Generate a unique ID for the plant bed
  // Get existing plant bed IDs for this garden to generate next available ID
  const { data: existingBeds, error: fetchError } = await supabase
    .from("plant_beds")
    .select("id")
    .eq("garden_id", plantBed.garden_id)
    .order("id")
  
  if (fetchError) {
    console.error("❌ Error fetching existing plant beds:", fetchError)
    throw fetchError
  }
  
  // Generate next available ID (A1, A2, B1, B2, etc.)
  const generateNextId = (existingIds: string[]): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    for (const letter of letters) {
      let number = 1
      let candidateId = `${letter}${number}`
      
      while (existingIds.includes(candidateId)) {
        number++
        candidateId = `${letter}${number}`
      }
      
      // If we found an available ID with this letter, use it
      if (!existingIds.includes(candidateId)) {
        return candidateId
      }
    }
    
    // Fallback: use timestamp-based ID if all letters are exhausted
    return `BED${Date.now().toString().slice(-6)}`
  }
  
  const existingIds = existingBeds?.map(bed => bed.id) || []
  const newId = generateNextId(existingIds)
  
  console.log("🆔 Generated plant bed ID:", newId)
  
  // Insert with the generated ID
  const { data, error } = await supabase.from("plant_beds").insert({
    id: newId,
    garden_id: plantBed.garden_id,
    name: plantBed.name,
    location: plantBed.location || null,
    size: plantBed.size || null,
    soil_type: plantBed.soil_type || null,
    sun_exposure: plantBed.sun_exposure || 'full-sun',
    description: plantBed.description || null,
    is_active: true
  }).select().single()

  if (error) {
    console.error("❌ Error creating plant bed - DETAILED:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: JSON.stringify(error, null, 2)
    })
    console.error("❌ Plant bed data that failed:", JSON.stringify({
      id: newId,
      garden_id: plantBed.garden_id,
      name: plantBed.name,
      location: plantBed.location || null,
      size: plantBed.size || null,
      soil_type: plantBed.soil_type || null,
      sun_exposure: plantBed.sun_exposure || 'full-sun',
      description: plantBed.description || null,
      is_active: true
    }, null, 2))
    if (isMissingRelation(error)) {
      console.warn(
        "Supabase table `plant_beds` not found yet – cannot create a plant bed until the migration is applied.",
      )
      throw error
    }
    throw error
  }

  console.log("✅ Plant bed created successfully:", data)
  return data
}

export async function updatePlantBed(id: string, updates: Partial<PlantBed>): Promise<PlantBed | null> {
  const { data, error } = await supabase.from("plant_beds").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating plant bed:", error)
    throw error
  }

  return data
}

export async function deletePlantBed(id: string): Promise<void> {
  const { error } = await supabase.from("plant_beds").update({ is_active: false }).eq("id", id)

  if (error) {
    console.error("Error deleting plant bed:", error)
    throw error
  }
}

// Plant functions
export async function createPlant(plant: {
  plant_bed_id: string
  name: string
  scientific_name?: string
  variety?: string
  color?: string
  height?: number
  stem_length?: number
  photo_url?: string
  category?: string
  bloom_period?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
}): Promise<Plant | null> {
  const { data, error } = await supabase.from("plants").insert(plant).select().single()

  if (error) {
    console.error("Error creating plant:", error)
    throw error
  }

  return data
}

export async function updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | null> {
  const { data, error } = await supabase.from("plants").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating plant:", error)
    throw error
  }

  return data
}

export async function deletePlant(id: string): Promise<void> {
  const { error } = await supabase.from("plants").delete().eq("id", id)

  if (error) {
    console.error("Error deleting plant:", error)
    throw error
  }
}

export async function getPlant(id: string): Promise<Plant | null> {
  const { data, error } = await supabase.from("plants").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching plant:", error)
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

  if (error) {
    console.error("Error fetching plants with positions:", error)
    return []
  }

  // Convert to PlantWithPosition format with defaults
  return (plants || []).map(plant => ({
    ...plant,
    position_x: plant.position_x ?? Math.random() * 400,
    position_y: plant.position_y ?? Math.random() * 300,
    visual_width: plant.visual_width ?? 40,
    visual_height: plant.visual_height ?? 40,
    emoji: plant.emoji ?? '🌸'
  })) as PlantWithPosition[]
}

// Create plant for visual designer
export async function createVisualPlant(plant: {
  plant_bed_id: string
  name: string
  color: string
  status: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
  emoji: string
  is_custom?: boolean
  category?: string
  notes?: string
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
    is_custom: plant.is_custom,
    category: plant.category,
    notes: plant.notes,
  }).select().single()

  if (error) {
    console.error("Error creating visual plant:", error)
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
  status?: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  emoji?: string
  is_custom?: boolean
  category?: string
  notes?: string
}): Promise<PlantWithPosition | null> {
  const { data, error } = await supabase
    .from("plants")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating plant position:", error)
    throw error
  }

  return data as PlantWithPosition
}
