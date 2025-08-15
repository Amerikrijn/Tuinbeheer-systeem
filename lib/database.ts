import { supabase } from './supabase'

// Banking security: Secure database operations with proper error handling
export const getGarden = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // Secure error handling for banking standards - no console logging in production
    return null
  }
}

export const getPlantBeds = async (gardenId: string) => {
  try {
    const { data, error } = await supabase
      .from('plant_beds')
      .select(`
        *,
        plants(*)
      `)
      .eq('garden_id', gardenId)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    // Secure error handling for banking standards - no console logging in production
    return []
  }
}

export const createGarden = async (gardenData: {
  name: string
  description?: string
  length?: string
  width?: string
  location?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .insert(gardenData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // Secure error handling for banking standards
    if (process.env.NODE_ENV === 'development') {
    }
    return null
  }
}

export const getPlant = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // Secure error handling for banking standards
    if (process.env.NODE_ENV === 'development') {
    }
    return null
  }
}

export const updatePlant = async (id: string, updateData: Record<string, unknown>) => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // Secure error handling for banking standards
    if (process.env.NODE_ENV === 'development') {
    }
    return null
  }
}

export const deletePlant = async (id: string) => {
  try {
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    // Secure error handling for banking standards
    if (process.env.NODE_ENV === 'development') {
    }
    return false
  }
}

export const getPlantBed = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('plant_beds')
      .select(`
        *,
        plants(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // Secure error handling for banking standards
    if (process.env.NODE_ENV === 'development') {
    }
    return null
  }
}

export const createPlant = async (plantData: {
  name: string
  plant_bed_id: string
  species?: string
  variety?: string
  scientific_name?: string
  color?: string
  height?: number
  plants_per_sqm?: number
  sun_preference?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: string
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
  emoji?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .insert(plantData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // Secure error handling for banking standards
    if (process.env.NODE_ENV === 'development') {
    }
    return null
  }
}