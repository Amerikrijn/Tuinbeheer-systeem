/**
 * SERVER-SIDE Garden Service
 * This runs on the server, not in the browser
 * NO connection leaks possible here!
 */

import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (runs on Vercel, not in browser)
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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
  plant_beds?: Array<{
    id: string
    name: string
    letter_code: string
    plant_count?: number
  }>
  plant_bed_count?: number
  total_plant_count?: number
}

/**
 * Fetch gardens with details - SERVER SIDE ONLY
 * This completely bypasses client-side connection issues
 */
export async function getGardensWithDetails({
  page = 1,
  limit = 12,
  search = ''
}: {
  page?: number
  limit?: number
  search?: string
}) {
  try {
    const supabase = getServerClient()
    
    // If the database function exists, use it
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_gardens_with_details', {
      p_page: page,
      p_limit: limit,
      p_search: search || null
    })
    
    if (!rpcError && rpcData) {
      return rpcData
    }
    
    // Fallback to regular query if function doesn't exist
    const offset = (page - 1) * limit
    
    // Get total count
    let countQuery = supabase
      .from('gardens')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    const { count } = await countQuery
    
    // Get gardens with plant beds
    let query = supabase
      .from('gardens')
      .select(`
        *,
        plant_beds!left(
          id,
          name,
          letter_code
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      throw error
    }
    
    // Transform data
    const gardens = (data || []).map(garden => ({
      ...garden,
      plant_bed_count: garden.plant_beds?.length || 0,
      total_plant_count: 0 // Would need separate query for this
    }))
    
    return {
      gardens,
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
    
  } catch (error) {
    console.error('Error fetching gardens:', error)
    return {
      gardens: [],
      total: 0,
      page,
      limit,
      total_pages: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}