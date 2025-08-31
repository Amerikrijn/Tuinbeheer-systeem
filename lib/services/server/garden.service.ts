/**
 * SERVER-SIDE Garden Service
 * This runs on the server, not in the browser
 * Uses the optimized database function we just created
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/config'

// Server-side Supabase client (no auth needed for public data)
function getServerClient() {
  const config = getSupabaseConfig()
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetch, // Use native fetch on server
    }
  })
}

export interface GardenWithDetails {
  id: string
  name: string
  location: string
  description?: string
  created_at: string
  updated_at: string
  length?: string
  width?: string
  total_area?: string
  plant_beds: Array<{
    id: string
    name: string
    letter_code: string
    plant_count: number
  }>
  plant_bed_count: number
  total_plant_count: number
}

export interface GardensResponse {
  gardens: GardenWithDetails[]
  total: number
  page: number
  limit: number
  total_pages: number
  error?: string
}

/**
 * Fetch gardens with details using the optimized database function
 * This runs on the server during page render
 */
export async function getGardensWithDetails({
  page = 1,
  limit = 12,
  search = ''
}: {
  page?: number
  limit?: number
  search?: string
}): Promise<GardensResponse> {
  try {
    const supabase = getServerClient()
    
    // Call our optimized database function
    const { data, error } = await supabase.rpc('get_gardens_with_details', {
      p_page: page,
      p_limit: limit,
      p_search: search || null
    })

    if (error) {
      console.error('Database error:', error)
      return {
        gardens: [],
        total: 0,
        page,
        limit,
        total_pages: 0,
        error: error.message
      }
    }

    // The function returns the data in the exact format we need
    return data as GardensResponse
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      gardens: [],
      total: 0,
      page,
      limit,
      total_pages: 0,
      error: 'Er ging iets mis bij het ophalen van de tuinen'
    }
  }
}