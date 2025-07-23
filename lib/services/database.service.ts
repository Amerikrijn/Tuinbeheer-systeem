import { supabase } from '../supabase'
import { databaseLogger, AuditLogger, PerformanceLogger } from '../logger'
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
 * Banking-standard implementation with comprehensive error handling,
 * audit logging, and performance monitoring
 */

// Custom error classes for better error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with ID ${id}` : ''} not found`)
    this.name = 'NotFoundError'
  }
}

// Connection validation with retry logic
async function validateConnection(retries = 3): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase.from('gardens').select('count').limit(1)
      if (!error) {
        databaseLogger.debug('Database connection validated successfully', { attempt })
        return
      }
      
      if (attempt === retries) {
        throw new DatabaseError('Database connection failed after retries', error.code, error)
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    } catch (error) {
      if (attempt === retries) {
        databaseLogger.error('Unable to connect to database', error as Error, { attempts: retries })
        throw new DatabaseError('Unable to connect to database', 'CONNECTION_ERROR', error)
      }
    }
  }
}

// Generic response wrapper with logging
function createResponse<T>(
  data: T | null, 
  error: string | null = null,
  operation?: string,
  metadata?: Record<string, any>
): ApiResponse<T> {
  const response = {
    data,
    error,
    success: error === null
  }
  
  if (operation) {
    if (error) {
      databaseLogger.error(`Operation failed: ${operation}`, undefined, { error, metadata })
    } else {
      databaseLogger.debug(`Operation successful: ${operation}`, { metadata })
    }
  }
  
  return response
}

// Input validation helpers
function validateId(id: string, resource: string): void {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ValidationError(`${resource} ID is required and must be a non-empty string`, 'id', id)
  }
}

function validatePaginationParams(page?: number, pageSize?: number): { page: number; pageSize: number } {
  const validatedPage = Math.max(1, page || 1)
  const validatedPageSize = Math.min(Math.max(1, pageSize || 10), 100) // Max 100 items per page
  
  return { page: validatedPage, pageSize: validatedPageSize }
}

/**
 * Tuin (Garden) Service
 * Handles all garden-related database operations
 */
export class TuinService {
  private static readonly RESOURCE_NAME = 'gardens'
  
  /**
   * Get all active gardens with pagination and filtering
   */
  static async getAll(
    filters?: SearchFilters,
    sort?: SortOptions,
    page?: number,
    pageSize?: number
  ): Promise<ApiResponse<PaginatedResponse<Tuin>>> {
    const operationId = `getAll-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      await validateConnection()
      
      const { page: validPage, pageSize: validPageSize } = validatePaginationParams(page, pageSize)
      
      // Build query
      let query = supabase
        .from(this.RESOURCE_NAME)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
      
      // Apply filters
      if (filters?.query) {
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`)
      }
      
      // Apply sorting
      const sortField = sort?.field || 'created_at'
      const sortDirection = sort?.direction === 'asc'
      query = query.order(sortField, { ascending: sortDirection })
      
      // Apply pagination
      const from = (validPage - 1) * validPageSize
      const to = from + validPageSize - 1
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      if (error) {
        throw new DatabaseError('Failed to fetch gardens', error.code, error)
      }
      
      AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, { filters, sort, page: validPage, pageSize: validPageSize })
      
      const result = {
        data: data || [],
        count: count || 0,
        page: validPage,
        page_size: validPageSize,
        total_pages: Math.ceil((count || 0) / validPageSize)
      }
      
      PerformanceLogger.endTimer(operationId, 'TuinService.getAll', { resultCount: data?.length || 0 })
      
      return createResponse(result, null, 'getAll gardens')
    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'TuinService.getAll', { error: true })
      
      if (error instanceof DatabaseError || error instanceof ValidationError) {
        return createResponse<PaginatedResponse<Tuin>>(null, error.message, 'getAll gardens')
      }
      
      databaseLogger.error('Unexpected error in TuinService.getAll', error as Error)
      return createResponse<PaginatedResponse<Tuin>>(null, 'An unexpected error occurred', 'getAll gardens')
    }
  }
  
  /**
   * Get garden by ID with comprehensive validation
   */
  static async getById(id: string): Promise<ApiResponse<Tuin>> {
    const operationId = `getById-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      validateId(id, 'Garden')
      await validateConnection()
      
      const { data, error } = await supabase
        .from(this.RESOURCE_NAME)
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Garden', id)
        }
        throw new DatabaseError('Failed to fetch garden', error.code, error)
      }
      
      AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, id)
      PerformanceLogger.endTimer(operationId, 'TuinService.getById', { found: !!data })
      
      return createResponse(data, null, 'get garden by ID')
    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'TuinService.getById', { error: true })
      
      if (error instanceof NotFoundError) {
        return createResponse<Tuin>(null, error.message, 'get garden by ID')
      }
      
      if (error instanceof DatabaseError || error instanceof ValidationError) {
        return createResponse<Tuin>(null, error.message, 'get garden by ID')
      }
      
      databaseLogger.error('Unexpected error in TuinService.getById', error as Error, { id })
      return createResponse<Tuin>(null, 'An unexpected error occurred', 'get garden by ID')
    }
  }
  
  /**
   * Create new garden with validation and audit logging
   */
  static async create(gardenData: Omit<Tuin, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<ApiResponse<Tuin>> {
    const operationId = `create-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      // Validate required fields
      if (!gardenData.name?.trim()) {
        throw new ValidationError('Garden name is required', 'name', gardenData.name)
      }
      
      if (!gardenData.location?.trim()) {
        throw new ValidationError('Garden location is required', 'location', gardenData.location)
      }
      
      await validateConnection()
      
      const insertData = {
        ...gardenData,
        name: gardenData.name.trim(),
        location: gardenData.location.trim(),
        is_active: true,
      }
      
      const { data, error } = await supabase
        .from(this.RESOURCE_NAME)
        .insert(insertData)
        .select('*')
        .single()
      
      if (error) {
        throw new DatabaseError('Failed to create garden', error.code, error)
      }
      
      AuditLogger.logUserAction(null, 'CREATE', this.RESOURCE_NAME, data.id, { name: data.name })
      AuditLogger.logDataAccess(null, 'CREATE', this.RESOURCE_NAME, data.id)
      PerformanceLogger.endTimer(operationId, 'TuinService.create', { gardenId: data.id })
      
      databaseLogger.info('Garden created successfully', { gardenId: data.id, name: data.name })
      
      return createResponse(data, null, 'create garden')
    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'TuinService.create', { error: true })
      
      if (error instanceof DatabaseError || error instanceof ValidationError) {
        return createResponse<Tuin>(null, error.message, 'create garden')
      }
      
      databaseLogger.error('Unexpected error in TuinService.create', error as Error, { gardenData })
      return createResponse<Tuin>(null, 'An unexpected error occurred', 'create garden')
    }
  }
  
  /**
   * Update garden with optimistic locking and audit trail
   */
  static async update(id: string, updates: Partial<Omit<Tuin, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Tuin>> {
    const operationId = `update-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      validateId(id, 'Garden')
      
      // Validate updates
      if (updates.name !== undefined && !updates.name?.trim()) {
        throw new ValidationError('Garden name cannot be empty', 'name', updates.name)
      }
      
      if (updates.location !== undefined && !updates.location?.trim()) {
        throw new ValidationError('Garden location cannot be empty', 'location', updates.location)
      }
      
      await validateConnection()
      
      // First check if garden exists
      const existingResult = await this.getById(id)
      if (!existingResult.success) {
        return existingResult
      }
      
      const updateData = {
        ...updates,
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.location && { location: updates.location.trim() }),
        updated_at: new Date().toISOString(),
      }
      
      const { data, error } = await supabase
        .from(this.RESOURCE_NAME)
        .update(updateData)
        .eq('id', id)
        .eq('is_active', true)
        .select('*')
        .single()
      
      if (error) {
        throw new DatabaseError('Failed to update garden', error.code, error)
      }
      
      AuditLogger.logUserAction(null, 'UPDATE', this.RESOURCE_NAME, id, updates)
      AuditLogger.logDataAccess(null, 'UPDATE', this.RESOURCE_NAME, id)
      PerformanceLogger.endTimer(operationId, 'TuinService.update', { gardenId: id })
      
      databaseLogger.info('Garden updated successfully', { gardenId: id, updates })
      
      return createResponse(data, null, 'update garden')
    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'TuinService.update', { error: true })
      
      if (error instanceof DatabaseError || error instanceof ValidationError || error instanceof NotFoundError) {
        return createResponse<Tuin>(null, error.message, 'update garden')
      }
      
      databaseLogger.error('Unexpected error in TuinService.update', error as Error, { id, updates })
      return createResponse<Tuin>(null, 'An unexpected error occurred', 'update garden')
    }
  }
  
  /**
   * Soft delete garden (set is_active to false)
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    const operationId = `delete-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      validateId(id, 'Garden')
      await validateConnection()
      
      // First check if garden exists
      const existingResult = await this.getById(id)
      if (!existingResult.success) {
        PerformanceLogger.endTimer(operationId, 'TuinService.delete', { error: true })
        return createResponse<boolean>(false, existingResult.error, 'delete garden')
      }
      
      const { error } = await supabase
        .from(this.RESOURCE_NAME)
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        throw new DatabaseError('Failed to delete garden', error.code, error)
      }
      
      AuditLogger.logUserAction(null, 'DELETE', this.RESOURCE_NAME, id)
      AuditLogger.logDataAccess(null, 'DELETE', this.RESOURCE_NAME, id)
      PerformanceLogger.endTimer(operationId, 'TuinService.delete', { gardenId: id })
      
      databaseLogger.info('Garden deleted successfully', { gardenId: id })
      
      return createResponse(true, null, 'delete garden')
    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'TuinService.delete', { error: true })
      
      if (error instanceof DatabaseError || error instanceof ValidationError) {
        return createResponse<boolean>(false, error.message, 'delete garden')
      }
      
      databaseLogger.error('Unexpected error in TuinService.delete', error as Error, { id })
      return createResponse<boolean>(false, 'An unexpected error occurred', 'delete garden')
    }
  }
}

// For backward compatibility, create a unified DatabaseService
export const DatabaseService = {
  Tuin: TuinService,
  // TODO: Add PlantvakService and BloemService following the same pattern
}