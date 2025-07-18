import { supabase } from '../supabase'
import type { 
  Tuin, 
  Plantvak, 
  Bloem, 
  PlantvakWithBloemen, 
  TuinWithPlantvakken,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOptions
} from '../types/index'

/**
 * Database Service Layer
 * Provides clean, typed interfaces for database operations
 * Following banking-app standards for reliability and error handling
 */

// Error handling utility
class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Connection validation
async function validateConnection(): Promise<void> {
  try {
    const { error } = await supabase.from('gardens').select('count').limit(1)
    if (error) {
      throw new DatabaseError('Database connection failed', error.code, error)
    }
  } catch (error) {
    throw new DatabaseError('Unable to connect to database', 'CONNECTION_ERROR', error)
  }
}

// Generic response wrapper
function createResponse<T>(data: T | null, error: string | null = null): ApiResponse<T> {
  return {
    data,
    error,
    success: error === null
  }
}

// Tuin (Garden) Operations
export class TuinService {
  /**
   * Get all active gardens
   */
  static async getAll(): Promise<ApiResponse<Tuin[]>> {
    try {
      await validateConnection()
      
      const { data, error } = await supabase
        .from('gardens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseError('Failed to fetch gardens', error.code, error)
      }

      return createResponse(data || [])
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Get garden by ID
   */
  static async getById(id: string): Promise<ApiResponse<Tuin>> {
    try {
      if (!id) {
        throw new DatabaseError('Garden ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('gardens')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DatabaseError('Garden not found', 'NOT_FOUND')
        }
        throw new DatabaseError('Failed to fetch garden', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Create new garden
   */
  static async create(garden: Omit<Tuin, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Tuin>> {
    try {
      if (!garden.name || !garden.location) {
        throw new DatabaseError('Name and location are required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('gardens')
        .insert([{ ...garden, is_active: true }])
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to create garden', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Update garden
   */
  static async update(id: string, updates: Partial<Tuin>): Promise<ApiResponse<Tuin>> {
    try {
      if (!id) {
        throw new DatabaseError('Garden ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('gardens')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to update garden', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Soft delete garden
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!id) {
        throw new DatabaseError('Garden ID is required')
      }

      await validateConnection()
      
      const { error } = await supabase
        .from('gardens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        throw new DatabaseError('Failed to delete garden', error.code, error)
      }

      return createResponse(true)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Get garden with plant beds
   */
  static async getWithPlantvakken(id: string): Promise<ApiResponse<TuinWithPlantvakken>> {
    try {
      if (!id) {
        throw new DatabaseError('Garden ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('gardens')
        .select(`
          *,
          plant_beds!inner (
            *,
            plants (*)
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .eq('plant_beds.is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DatabaseError('Garden not found', 'NOT_FOUND')
        }
        throw new DatabaseError('Failed to fetch garden with plant beds', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }
}

// Plantvak (Plant Bed) Operations
export class PlantvakService {
  /**
   * Get all plant beds for a garden
   */
  static async getByGardenId(gardenId: string): Promise<ApiResponse<Plantvak[]>> {
    try {
      if (!gardenId) {
        throw new DatabaseError('Garden ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plant_beds')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseError('Failed to fetch plant beds', error.code, error)
      }

      return createResponse(data || [])
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Get plant bed by ID
   */
  static async getById(id: string): Promise<ApiResponse<Plantvak>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant bed ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plant_beds')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DatabaseError('Plant bed not found', 'NOT_FOUND')
        }
        throw new DatabaseError('Failed to fetch plant bed', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Create new plant bed
   */
  static async create(plantvak: Omit<Plantvak, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Plantvak>> {
    try {
      if (!plantvak.name || !plantvak.garden_id) {
        throw new DatabaseError('Name and garden ID are required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plant_beds')
        .insert([{ ...plantvak, is_active: true }])
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to create plant bed', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Update plant bed
   */
  static async update(id: string, updates: Partial<Plantvak>): Promise<ApiResponse<Plantvak>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant bed ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plant_beds')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to update plant bed', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Soft delete plant bed
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant bed ID is required')
      }

      await validateConnection()
      
      const { error } = await supabase
        .from('plant_beds')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        throw new DatabaseError('Failed to delete plant bed', error.code, error)
      }

      return createResponse(true)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Get plant bed with plants
   */
  static async getWithBloemen(id: string): Promise<ApiResponse<PlantvakWithBloemen>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant bed ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plant_beds')
        .select(`
          *,
          plants (*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DatabaseError('Plant bed not found', 'NOT_FOUND')
        }
        throw new DatabaseError('Failed to fetch plant bed with plants', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }
}

// Bloem (Plant) Operations
export class BloemService {
  /**
   * Get all plants for a plant bed
   */
  static async getByPlantvakId(plantvakId: string): Promise<ApiResponse<Bloem[]>> {
    try {
      if (!plantvakId) {
        throw new DatabaseError('Plant bed ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('plant_bed_id', plantvakId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseError('Failed to fetch plants', error.code, error)
      }

      return createResponse(data || [])
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Get plant by ID
   */
  static async getById(id: string): Promise<ApiResponse<Bloem>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DatabaseError('Plant not found', 'NOT_FOUND')
        }
        throw new DatabaseError('Failed to fetch plant', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Create new plant
   */
  static async create(bloem: Omit<Bloem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Bloem>> {
    try {
      if (!bloem.name || !bloem.plant_bed_id) {
        throw new DatabaseError('Name and plant bed ID are required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plants')
        .insert([bloem])
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to create plant', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Update plant
   */
  static async update(id: string, updates: Partial<Bloem>): Promise<ApiResponse<Bloem>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant ID is required')
      }

      await validateConnection()
      
      const { data, error } = await supabase
        .from('plants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to update plant', error.code, error)
      }

      return createResponse(data)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Delete plant
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!id) {
        throw new DatabaseError('Plant ID is required')
      }

      await validateConnection()
      
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id)

      if (error) {
        throw new DatabaseError('Failed to delete plant', error.code, error)
      }

      return createResponse(true)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Search plants with filters
   */
  static async search(
    filters: SearchFilters,
    sort: SortOptions = { field: 'created_at', direction: 'desc' },
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Bloem>>> {
    try {
      await validateConnection()
      
      let query = supabase
        .from('plants')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,scientific_name.ilike.%${filters.query}%`)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw new DatabaseError('Failed to search plants', error.code, error)
      }

      const totalPages = Math.ceil((count || 0) / pageSize)

      const response: PaginatedResponse<Bloem> = {
        data: data || [],
        count: count || 0,
        page,
        page_size: pageSize,
        total_pages: totalPages
      }

      return createResponse(response)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }
}

// Bloemendatabase (Flower Database) Operations
export class BloemendatabaseService {
  /**
   * Get popular flowers from the database
   */
  static async getPopularFlowers(): Promise<ApiResponse<Bloem[]>> {
    try {
      await validateConnection()
      
      const { data, error } = await supabase
        .from('plants')
        .select('name, scientific_name, category, color, height, bloom_period')
        .not('category', 'is', null)
        .order('name')
        .limit(60)

      if (error) {
        throw new DatabaseError('Failed to fetch popular flowers', error.code, error)
      }

      return createResponse(data || [])
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }

  /**
   * Get flower statistics
   */
  static async getStatistics(): Promise<ApiResponse<{
    total_plants: number
    total_categories: number
    total_plant_beds: number
    total_gardens: number
  }>> {
    try {
      await validateConnection()
      
      const [plantsCount, categoriesCount, plantBedsCount, gardensCount] = await Promise.all([
        supabase.from('plants').select('id', { count: 'exact', head: true }),
        supabase.from('plants').select('category', { count: 'exact', head: true }).not('category', 'is', null),
        supabase.from('plant_beds').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('gardens').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ])

      const stats = {
        total_plants: plantsCount.count || 0,
        total_categories: categoriesCount.count || 0,
        total_plant_beds: plantBedsCount.count || 0,
        total_gardens: gardensCount.count || 0
      }

      return createResponse(stats)
    } catch (error) {
      const message = error instanceof DatabaseError ? error.message : 'Unknown error occurred'
      return createResponse(null, message)
    }
  }
}

// Export all services
export const DatabaseService = {
  Tuin: TuinService,
  Plantvak: PlantvakService,
  Bloem: BloemService,
  Bloemendatabase: BloemendatabaseService
}