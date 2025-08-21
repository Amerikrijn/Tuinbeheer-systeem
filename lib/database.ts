import { getSupabaseClient } from "./supabase"

function isMissingRelation(err: { code?: string } | null): boolean {
  return !!err && err.code === "42P01"
}

// Garden functions
export async function getGardens(): Promise<any[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("gardens")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching gardens:", error)
    if (isMissingRelation(error)) {
      console.warn("Supabase table `gardens` not found yet – returning empty list until the migration is applied.")
      return []
    }
    return []
  }

  return data || []
}

export async function getGarden(id?: string): Promise<any | null> {
  if (!id) {
    // Get the first active garden if no ID provided
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("gardens")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (isMissingRelation(error)) {
        console.warn("Supabase table `gardens` not found yet – returning null until the migration is applied.")
        return null
      }
      console.error("Error fetching default garden:", error)
      return null
    }

    return data
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("gardens").select("*").eq("id", id).eq("is_active", true).single()

  if (error) {
    if (isMissingRelation(error)) {
      console.warn("Supabase table `gardens` not found yet – returning null until the migration is applied.")
      return null
    }
    console.error("Error fetching garden:", error)
    return null
  }

  return data
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
}): Promise<any | null> {

  // Test if table exists first
  const supabase = getSupabaseClient();
  const { data: testData, error: testError } = await supabase.from("gardens").select("id").limit(1)

  if (testError) {
    console.error("Table test failed:", testError)
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating garden:", error)
    throw error
  }

  return data
}

export async function updateGarden(id: string, updates: Partial<Garden>): Promise<Garden | null> {

  const { data, error } = await supabase
    .from("gardens")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single()

  if (error) {
    console.error("Error updating garden:", error)
    throw error
  }

  return data
}

export async function deleteGarden(id: string): Promise<boolean> {

  const { error } = await supabase
    .from("gardens")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error deleting garden:", error)
    throw error
  }

  return true
}

// Plant Bed functions
export async function getPlantBeds(gardenId?: string): Promise<PlantBed[]> {

  const supabase = getSupabaseClient()
  let query = supabase
    .from("plant_beds")
    .select("*")
    .eq("is_active", true)

  if (gardenId) {
    query = query.eq("garden_id", gardenId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching plant beds:", error)
    if (isMissingRelation(error)) {
      console.warn("Supabase table `plant_beds` not found yet – returning empty list until the migration is applied.")
      return []
    }
    return []
  }

  return data || []
}

export async function getPlantBed(id: string): Promise<PlantBed | null> {

  const { data, error } = await supabase
    .from("plant_beds")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) {
    if (isMissingRelation(error)) {
      console.warn("Supabase table `plant_beds` not found yet – returning null until the migration is applied.")
      return null
    }
    console.error("Error fetching plant bed:", error)
    return null
  }

  return data
}

export async function createPlantBed(plantBed: {
  description?: string
  garden_id: string
  position_x: number
  position_y: number
  width: number
  height: number
  shape: 'rectangle' | 'circle' | 'oval' | 'freeform'
  color?: string
  border_style?: string
  border_color?: string
  fill_pattern?: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
}): Promise<PlantBed | null> {

  const { data, error } = await supabase
    .from("plant_beds")
    .insert({
      ...plantBed,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      // name and letter_code will be auto-generated by database trigger
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating plant bed:", error)
    throw error
  }

  return data
}

export async function updatePlantBed(id: string, updates: Partial<PlantBed>): Promise<PlantBed | null> {

  const { data, error } = await supabase
    .from("plant_beds")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single()

  if (error) {
    console.error("Error updating plant bed:", error)
    throw error
  }

  return data
}

export async function deletePlantBed(id: string): Promise<boolean> {

  const { error } = await supabase
    .from("plant_beds")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error deleting plant bed:", error)
    throw error
  }

  return true
}

// Plant functions
export async function getPlants(plantBedId?: string): Promise<Plant[]> {

  let query = supabase
    .from("plants")
    .select("*")
    .eq("is_active", true)

  if (plantBedId) {
    query = query.eq("plant_bed_id", plantBedId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching plants:", error)
    if (isMissingRelation(error)) {
      console.warn("Supabase table `plants` not found yet – returning empty list until the migration is applied.")
      return []
    }
    return []
  }

  return data || []
}

export async function getPlant(id: string): Promise<Plant | null> {

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) {
    if (isMissingRelation(error)) {
      console.warn("Supabase table `plants` not found yet – returning null until the migration is applied.")
      return null
    }
    console.error("Error fetching plant:", error)
    return null
  }

  return data
}

export async function createPlant(plant: {
  name: string
  scientific_name?: string
  common_name?: string
  plant_bed_id: string
  position_x: number
  position_y: number
  size: number
  color?: string
  bloom_season?: string
  height?: number
  spread?: number
  sun_requirements?: string
  water_requirements?: string
  soil_requirements?: string
  maintenance_level?: string
  special_features?: string
  notes?: string
  image_url?: string
}): Promise<Plant | null> {

  const { data, error } = await supabase
    .from("plants")
    .insert({
      ...plant,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating plant:", error)
    throw error
  }

  return data
}

export async function updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | null> {

  const { data, error } = await supabase
    .from("plants")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single()

  if (error) {
    console.error("Error updating plant:", error)
    throw error
  }

  return data
}

export async function deletePlant(id: string): Promise<boolean> {

  const { error } = await supabase
    .from("plants")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error deleting plant:", error)
    throw error
  }

  return true
}

// Combined queries
export async function getPlantBedsWithPlants(gardenId?: string): Promise<PlantBedWithPlants[]> {

  let query = supabase
    .from("plant_beds")
    .select(`
      *,
      plants (*)
    `)
    .eq("is_active", true)

  if (gardenId) {
    query = query.eq("garden_id", gardenId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching plant beds with plants:", error)
    if (isMissingRelation(error)) {
      console.warn("Supabase tables not found yet – returning empty list until the migration is applied.")
      return []
    }
    return []
  }

  return data || []
}

// Utility functions
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("gardens").select("count").limit(1)
    return !error
  } catch {
    return false
  }
}

export async function getDatabaseStats(): Promise<{
  gardens: number
  plantBeds: number
  plants: number
}> {
  try {
    const [gardens, plantBeds, plants] = await Promise.all([
      getGardens(),
      getPlantBeds(),
      getPlants()
    ])

    return {
      gardens: gardens.length,
      plantBeds: plantBeds.length,
      plants: plants.length
    }
  } catch (error) {
    console.error("Error getting database stats:", error)
    return {
      gardens: 0,
      plantBeds: 0,
      plants: 0
    }
  }
}