/**
 * Optimized database functions with N+1 query fixes
 * These functions use JOIN queries where possible, with fallback to original methods
 */

import { supabase } from "./supabase"
import type { Plantvak, Tuin, Bloem, PlantvakWithBloemen } from "./types/index"

// Type aliases for backward compatibility
type PlantBed = Plantvak
type Garden = Tuin
type Plant = Bloem
type PlantBedWithPlants = PlantvakWithBloemen

/**
 * Get plant beds with plants using optimized JOIN query
 * Falls back to N+1 pattern if JOIN fails (e.g., RLS issues)
 */
export async function getPlantBedsOptimized(gardenId?: string): Promise<PlantBedWithPlants[]> {
  try {
    // Try optimized JOIN query first
    let query = supabase
      .from("plant_beds")
      .select(`
        *,
        plants!plant_bed_id (*)
      `)
      .eq("is_active", true)
      .order("id")
      .limit(100)

    if (gardenId) {
      query = query.eq("garden_id", gardenId)
    }

    const { data, error } = await query

    if (!error && data) {
      // Transform data to match expected format
      return data.map(bed => ({
        ...bed,
        plants: bed.plants || []
      }))
    }

    // If JOIN fails, log and fall back
    console.warn('JOIN query failed, falling back to N+1 pattern:', error)
    
  } catch (joinError) {
    console.warn('JOIN query exception, falling back to N+1 pattern:', joinError)
  }

  // Fallback: Original N+1 pattern (slower but reliable)
  let fallbackQuery = supabase
    .from("plant_beds")
    .select("*")
    .eq("is_active", true)
    .order("id")
    .limit(100)

  if (gardenId) {
    fallbackQuery = fallbackQuery.eq("garden_id", gardenId)
  }

  const { data: plantBeds, error: plantBedsError } = await fallbackQuery

  if (plantBedsError || !plantBeds) {
    console.error('Fallback query also failed:', plantBedsError)
    return []
  }

  // Fetch plants for each bed (N+1 pattern)
  const plantBedsWithPlants = await Promise.all(
    plantBeds.map(async (bed) => {
      const { data: plants } = await supabase
        .from("plants")
        .select("*")
        .eq("plant_bed_id", bed.id)
        .order("created_at", { ascending: false })
        .limit(50)

      return { ...bed, plants: plants || [] }
    })
  )

  return plantBedsWithPlants
}

/**
 * Get single plant bed with plants using optimized JOIN query
 * Falls back to N+1 pattern if JOIN fails
 */
export async function getPlantBedOptimized(id: string): Promise<PlantBedWithPlants | null> {
  try {
    // Try optimized JOIN query first
    const { data, error } = await supabase
      .from("plant_beds")
      .select(`
        *,
        plants!plant_bed_id (*)
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (!error && data) {
      return {
        ...data,
        plants: data.plants || []
      }
    }

    console.warn('JOIN query failed for single bed, falling back:', error)
    
  } catch (joinError) {
    console.warn('JOIN query exception for single bed, falling back:', joinError)
  }

  // Fallback: Original N+1 pattern
  const { data: plantBed, error: plantBedError } = await supabase
    .from("plant_beds")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (plantBedError || !plantBed) {
    return null
  }

  const { data: plants } = await supabase
    .from("plants")
    .select("*")
    .eq("plant_bed_id", id)
    .order("created_at", { ascending: false })
    .limit(100)

  return { ...plantBed, plants: plants || [] }
}

/**
 * Test if JOIN queries work in current environment
 * Returns true if JOINs are supported, false otherwise
 */
export async function testJoinSupport(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("plant_beds")
      .select(`
        id,
        plants!plant_bed_id (id)
      `)
      .limit(1)

    if (error) {
      console.log('JOIN test failed:', error.message)
      return false
    }

    console.log('JOIN queries are supported!')
    return true
    
  } catch (e) {
    console.log('JOIN test exception:', e)
    return false
  }
}

// Export a flag to indicate if optimized queries should be used
export let useOptimizedQueries = false

// Test JOIN support on module load
testJoinSupport().then(supported => {
  useOptimizedQueries = supported
  if (supported) {
    console.log('✅ Database optimization enabled - using JOIN queries')
  } else {
    console.log('⚠️ Database optimization disabled - using fallback queries')
  }
})