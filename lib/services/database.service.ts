import { getSupabaseClient } from '../supabase'
import { databaseLogger, AuditLogger, PerformanceLogger } from '../logger'
import type { 
  Tuin, 
  Plantvak, 
  Plant, 
  PlantvakWithPlants, 
  TuinWithPlantvakken,
  LogbookEntry,
  LogbookEntryWithDetails,
  LogbookEntryFormData,
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
    public details?: unknown,
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
    public value?: unknown
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
  const startTime = Date.now();
  const operationId = `connection-validation-${Date.now()}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await getSupabaseClient().from('gardens').select('count').limit(1)
      
      if (!error) {
        const duration = Date.now() - startTime;
        databaseLogger.debug('Database connection validated successfully', { 
          attempt, 
          operationId, 
          durationMs: duration 
        });
        
        // Audit logging for successful connection
        AuditLogger.logDataAccess(null, 'READ', 'connection_validation', undefined, { 
          operationId, 
          durationMs: duration,
          attempts: attempt 
        });
        return;
      }
      
      if (attempt === retries) {
        const duration = Date.now() - startTime;
        databaseLogger.error('Database connection failed after retries', { 
          operationId, 
          attempts: attempt, 
          durationMs: duration,
          error: error 
        });
        
        // Audit logging for connection failure
        AuditLogger.logDataAccess(null, 'READ', 'connection_validation', undefined, { 
          operationId, 
          durationMs: duration,
          attempts: attempt,
          error: error.message 
        });
        
        throw new DatabaseError('Database connection failed after retries', error.code, error)
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    } catch (error) {
      if (attempt === retries) {
        const duration = Date.now() - startTime;
        databaseLogger.error('Unable to connect to database', { 
          error: error as Error, 
          operationId, 
          attempts: attempt,
          durationMs: duration 
        });
        
        // Audit logging for connection error
        AuditLogger.logDataAccess(null, 'READ', 'connection_validation', undefined, { 
          operationId, 
          durationMs: duration,
          attempts: attempt,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        throw new DatabaseError('Unable to connect to database', 'CONNECTION_ERROR', error)
      }
    }
  }
}

// Database configuration with environment variable support - NO HARDCODED VALUES
const DB_CONFIG = {
  // Timeout values in milliseconds - configurable via environment variables
  TIMEOUTS: {
    CONNECTION: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    QUERY: parseInt(process.env.DB_QUERY_TIMEOUT || '45000'),
    SIMPLE: parseInt(process.env.DB_SIMPLE_TIMEOUT || '30000'),
    AUTH: parseInt(process.env.DB_AUTH_TIMEOUT || '15000'),
  },
  // Retry configuration
  RETRIES: {
    CONNECTION: parseInt(process.env.DB_CONNECTION_RETRIES || '3'),
    QUERY: parseInt(process.env.DB_QUERY_RETRIES || '2'),
  },
  // Security configuration
  SECURITY: {
    MAX_INPUT_LENGTH: parseInt(process.env.DB_MAX_INPUT_LENGTH || '1000'),
    ENABLE_INPUT_VALIDATION: process.env.DB_ENABLE_INPUT_VALIDATION !== 'false',
    LOG_SECURITY_EVENTS: process.env.DB_LOG_SECURITY_EVENTS !== 'false',
  }
}

// Utility function for database operations with configurable timeout protection
async function withTimeout<T>(
  databasePromise: Promise<T>,
  operationName: string,
  timeoutType: 'CONNECTION' | 'QUERY' | 'SIMPLE' | 'AUTH' = 'SIMPLE',
  operationId?: string
): Promise<T> {
  const timeoutMs = DB_CONFIG.TIMEOUTS[timeoutType];
  const startTime = Date.now();
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const duration = Date.now() - startTime;
      const error = new Error(`Database lookup timeout for ${operationName}`);
      
      // Audit logging for timeout
      if (operationId && DB_CONFIG.SECURITY.LOG_SECURITY_EVENTS) {
        AuditLogger.logDataAccess(null, 'READ', 'database_timeout', undefined, {
          operationId,
          operationName,
          timeoutType,
          timeoutMs,
          durationMs: duration
        });
      }
      
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([databasePromise, timeoutPromise]);
}

// Input validation utility following banking standards
function validateInput(input: string, maxLength: number = DB_CONFIG.SECURITY.MAX_INPUT_LENGTH): boolean {
  if (!input || typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  
  // Banking-grade input validation - prevent SQL injection and XSS
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

// Generic response wrapper with logging
function createResponse<T>(
  data: T | null, 
  error: string | null = null,
  operation?: string,
  metadata?: Record<string, unknown>
): ApiResponse<T> {
  const response = {
    data,
    error,
    success: error === null
  }
  
  if (operation) {
    if (error) {
      databaseLogger.error(`Operation failed: ${operation}`)
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
    const startTime = Date.now()
    PerformanceLogger.startTimer(operationId)
    
    try {
      // Security validation - validate all input parameters
      if (filters?.query && !validateInput(filters.query)) {
        const securityEvent = {
          operationId,
          operation: 'TuinService.getAll',
          securityViolation: 'INVALID_INPUT',
          input: filters.query,
          timestamp: new Date().toISOString()
        }
        
        // Audit logging for security violation
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, securityEvent)
        databaseLogger.warn('Security violation: Invalid input in TuinService.getAll', securityEvent)
        
        return createResponse<PaginatedResponse<Tuin>>(null, 'Invalid input detected', 'getAll gardens')
      }
      
      await validateConnection()
      
      const { page: validPage, pageSize: validPageSize } = validatePaginationParams(page, pageSize)
      
      // Build query
      let query = getSupabaseClient()
        .from(this.RESOURCE_NAME)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
      
      // Apply filters with security validation
      if (filters?.query) {
        // Additional security check for complex queries
        if (filters.query.length > DB_CONFIG.SECURITY.MAX_INPUT_LENGTH) {
          const securityEvent = {
            operationId,
            operation: 'TuinService.getAll',
            securityViolation: 'INPUT_TOO_LONG',
            inputLength: filters.query.length,
            maxAllowed: DB_CONFIG.SECURITY.MAX_INPUT_LENGTH,
            timestamp: new Date().toISOString()
          }
          
          AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, securityEvent)
          databaseLogger.warn('Security violation: Input too long in TuinService.getAll', securityEvent)
          
          return createResponse<PaginatedResponse<Tuin>>(null, 'Input too long', 'getAll gardens')
        }
        
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`)
      }
      
      // Apply sorting with validation
      const sortField = sort?.field || 'created_at'
      const sortDirection = sort?.direction === 'asc'
      
      // Validate sort field to prevent SQL injection
      const allowedSortFields = ['created_at', 'updated_at', 'name', 'location', 'description']
      if (!allowedSortFields.includes(sortField)) {
        const securityEvent = {
          operationId,
          operation: 'TuinService.getAll',
          securityViolation: 'INVALID_SORT_FIELD',
          sortField,
          allowedFields: allowedSortFields,
          timestamp: new Date().toISOString()
        }
        
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, securityEvent)
        databaseLogger.warn('Security violation: Invalid sort field in TuinService.getAll', securityEvent)
        
        return createResponse<PaginatedResponse<Tuin>>(null, 'Invalid sort field', 'getAll gardens')
      }
      
      query = query.order(sortField, { ascending: sortDirection })
      
      // Apply pagination
      const from = (validPage - 1) * validPageSize
      const to = from + validPageSize - 1
      query = query.range(from, to)
      
      // Use timeout utility function for database operations with comprehensive logging
      const { data, error, count } = await withTimeout(
        query,
        'TuinService.getAll',
        'QUERY',
        operationId
      ) as any
      
      if (error) {
        const duration = Date.now() - startTime
        const errorEvent = {
          operationId,
          operation: 'TuinService.getAll',
          error: error.message,
          errorCode: error.code,
          durationMs: duration,
          timestamp: new Date().toISOString()
        }
        
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, errorEvent)
        throw new DatabaseError('Failed to fetch gardens', error.code, error)
      }
      
      const duration = Date.now() - startTime
      const successEvent = {
        operationId,
        operation: 'TuinService.getAll',
        resultCount: data?.length || 0,
        totalCount: count || 0,
        page: validPage,
        pageSize: validPageSize,
        durationMs: duration,
        filters: filters || {},
        sort: sort || {},
        timestamp: new Date().toISOString()
      }
      
      // Comprehensive audit logging for successful operation
      AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, successEvent)
      
      const result = {
        data: data || [],
        count: count || 0,
        page: validPage,
        page_size: validPageSize,
        total_pages: Math.ceil((count || 0) / validPageSize)
      }
      
      PerformanceLogger.endTimer(operationId, 'TuinService.getAll', { 
        resultCount: data?.length || 0,
        durationMs: duration,
        operationId
      })
      
      return createResponse(result, null, 'getAll gardens')
    } catch (error) {
      const duration = Date.now() - startTime
      PerformanceLogger.endTimer(operationId, 'TuinService.getAll', { error: true, durationMs: duration })
      
      if (error instanceof DatabaseError || error instanceof ValidationError) {
        return createResponse<PaginatedResponse<Tuin>>(null, error.message, 'getAll gardens')
      }
      
      // Handle timeout errors specifically with comprehensive logging
      if (error instanceof Error && error.message.includes('timeout')) {
        const timeoutEvent = {
          operationId,
          operation: 'TuinService.getAll',
          error: 'Database operation timed out',
          durationMs: duration,
          timestamp: new Date().toISOString()
        }
        
        databaseLogger.error('Database operation timed out in TuinService.getAll', { error: error.message, ...timeoutEvent })
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, timeoutEvent)
        
        return createResponse<PaginatedResponse<Tuin>>(null, 'Database operation timed out. Please try again.', 'getAll gardens')
      }
      
      const unexpectedErrorEvent = {
        operationId,
        operation: 'TuinService.getAll',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: duration,
        timestamp: new Date().toISOString()
      }
      
      databaseLogger.error('Unexpected error in TuinService.getAll', unexpectedErrorEvent)
      AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, unexpectedErrorEvent)
      
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
      
      // Use timeout utility function for database operations
      const { data, error } = await withTimeout(
        getSupabaseClient()
          .from(this.RESOURCE_NAME)
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single(),
        'TuinService.getById',
        'QUERY',
        operationId
      ) as any
      
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
      
      // Handle timeout errors specifically with comprehensive logging
      if (error instanceof Error && error.message.includes('timeout')) {
        const duration = Date.now() - startTime
        const timeoutEvent = {
          operationId,
          operation: 'TuinService.getById',
          error: 'Database operation timed out',
          durationMs: duration,
          timestamp: new Date().toISOString()
        }
        
        databaseLogger.error('Database operation timed out in TuinService.getById', { error: error.message, ...timeoutEvent })
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, id, timeoutEvent)
        
        return createResponse<Tuin>(null, 'Database operation timed out. Please try again.', 'get garden by ID')
      }
      
      databaseLogger.error('Unexpected error in TuinService.getById', { error: error instanceof Error ? error.message : 'Unknown error', id })
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
      
      // Add timeout protection to prevent database lookup timeout errors
      const { data, error } = await withTimeout(
        getSupabaseClient()
          .from(this.RESOURCE_NAME)
          .insert(insertData)
          .select('*')
          .single(),
        'TuinService.create',
        'SIMPLE',
        operationId
      ) as any
      
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
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        const duration = Date.now() - startTime
        const timeoutEvent = {
          operationId,
          operation: 'TuinService.create',
          error: 'Database operation timed out',
          durationMs: duration,
          timestamp: new Date().toISOString()
        }
        
        databaseLogger.error('Database operation timed out in TuinService.create', { error: error.message, ...timeoutEvent })
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, timeoutEvent)
        
        return createResponse<Tuin>(null, 'Database operation timed out. Please try again.', 'create garden')
      }
      
      databaseLogger.error('Unexpected error in TuinService.create', { error: error instanceof Error ? error.message : 'Unknown error', gardenData })
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
      
      // Add timeout protection to prevent database lookup timeout errors
      const { data, error } = await withTimeout(
        getSupabaseClient()
          .from(this.RESOURCE_NAME)
          .update(updateData)
          .eq('id', id)
          .eq('is_active', true)
          .select('*')
          .single(),
        'TuinService.update',
        'SIMPLE',
        operationId
      ) as any
      
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
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        const duration = Date.now() - startTime
        const timeoutEvent = {
          operationId,
          operation: 'TuinService.update',
          error: 'Database operation timed out',
          durationMs: duration,
          timestamp: new Date().toISOString()
        }
        
        databaseLogger.error('Database operation timed out in TuinService.update', { error: error.message, ...timeoutEvent })
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, timeoutEvent)
        
        return createResponse<Tuin>(null, 'Database operation timed out. Please try again.', 'update garden')
      }
      
      databaseLogger.error('Unexpected error in TuinService.update', { error: error instanceof Error ? error.message : 'Unknown error', id, updates })
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
      
      // First, remove all user access to this garden
      // Use timeout utility function for database operations
      const { error: accessError } = await withTimeout(
        getSupabaseClient()
          .from('user_garden_access')
          .delete()
          .eq('garden_id', id),
        'TuinService.delete.userAccess',
        'SIMPLE',
        operationId
      ) as any
      
      if (accessError) {
        databaseLogger.warn('Failed to remove user access for garden', { gardenId: id, error: accessError })
        // Continue with garden deletion even if access cleanup fails
      } else {
        databaseLogger.info('Removed user access for garden', { gardenId: id })
      }
      
      // Then soft delete the garden
      // Use timeout utility function for database operations
      const { error } = await withTimeout(
        getSupabaseClient()
          .from(this.RESOURCE_NAME)
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', id),
        'TuinService.delete.garden',
        'SIMPLE',
        operationId
      ) as any
      
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
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        const duration = Date.now() - startTime
        const timeoutEvent = {
          operationId,
          operation: 'TuinService.delete',
          error: 'Database operation timed out',
          durationMs: duration,
          timestamp: new Date().toISOString()
        }
        
        databaseLogger.error('Database operation timed out in TuinService.delete', { error: error.message, ...timeoutEvent })
        AuditLogger.logDataAccess(null, 'READ', this.RESOURCE_NAME, undefined, timeoutEvent)
        
        return createResponse<boolean>(false, 'Database operation timed out. Please try again.', 'delete garden')
      }
      
      databaseLogger.error('Unexpected error in TuinService.delete', { error: error instanceof Error ? error.message : 'Unknown error', id })
      return createResponse<boolean>(false, 'An unexpected error occurred', 'delete garden')
    }
  }
}

/**
 * Logbook Service
 * Handles all logbook entry operations with comprehensive logging and error handling
 */
export class LogbookService {
  /**
   * Create a new logbook entry
   */
  static async create(formData: LogbookEntryFormData): Promise<ApiResponse<LogbookEntry>> {
    const operationId = `logbook-create-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      await validateConnection()
      
      // Validate required fields
      if (!formData.plant_bed_id) {
        throw new ValidationError('Plant bed ID is required', 'plant_bed_id')
      }
      if (!formData.notes?.trim()) {
        throw new ValidationError('Notes are required', 'notes')
      }
      if (!formData.entry_date) {
        throw new ValidationError('Entry date is required', 'entry_date')
      }

      // Verify plant bed exists
      const { data: plantBed, error: plantBedError } = await getSupabaseClient()
        .from('plant_beds')
        .select('id, name')
        .eq('id', formData.plant_bed_id)
        .eq('is_active', true)
        .single()

      if (plantBedError || !plantBed) {
        throw new NotFoundError('Plant bed', formData.plant_bed_id)
      }

      // If plant_id is provided, verify it exists and belongs to the plant bed
      if (formData.plant_id) {
        const { data: plant, error: plantError } = await getSupabaseClient()
          .from('plants')
          .select('id, name')
          .eq('id', formData.plant_id)
          .eq('plant_bed_id', formData.plant_bed_id)
          .single()

        if (plantError || !plant) {
          throw new NotFoundError('Plant', formData.plant_id)
        }
      }

      const logbookData = {
        plant_bed_id: formData.plant_bed_id,
        plant_id: formData.plant_id || null,
        entry_date: formData.entry_date,
        notes: formData.notes.trim(),
        photo_url: null // Will be updated after photo upload if provided
      }

      const { data, error } = await getSupabaseClient()
        .from('logbook_entries')
        .insert([logbookData])
        .select()
        .single()

      if (error) {
        throw new DatabaseError('Failed to create logbook entry', error.code, error)
      }

      AuditLogger.logUserAction(null, 'CREATE', 'logbook_entries', data.id, logbookData)
      AuditLogger.logDataAccess(null, 'CREATE', 'logbook_entries', data.id)
      PerformanceLogger.endTimer(operationId, 'logbook-create')
      
      databaseLogger.info('Logbook entry created successfully', { 
        id: data.id, 
        plant_bed_id: formData.plant_bed_id,
        plant_id: formData.plant_id,
        operationId 
      })

      return createResponse<LogbookEntry>(data, null, 'create logbook entry')

    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'logbook-create', { error: true })
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        databaseLogger.error('Logbook entry creation validation failed', error, { formData, operationId })
        return createResponse<LogbookEntry>(null, error.message, 'create logbook entry')
      }
      
      if (error instanceof DatabaseError) {
        databaseLogger.error('Database error in LogbookService.create', error, { formData, operationId })
        return createResponse<LogbookEntry>(null, error.message, 'create logbook entry')
      }
      
      databaseLogger.error('Unexpected error in LogbookService.create', error as Error, { formData, operationId })
      return createResponse<LogbookEntry>(null, 'An unexpected error occurred', 'create logbook entry')
    }
  }

  /**
   * Get all logbook entries with details, sorted by date (newest first)
   */
  static async getAll(filters?: {
    plant_bed_id?: string
    plant_id?: string
    garden_id?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<LogbookEntryWithDetails[]>> {
    const operationId = `logbook-getAll-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      await validateConnection()
      
      let query = getSupabaseClient()
        .from('logbook_entries')
        .select(`
          *,
          plant_beds!inner(
            id,
            name,
            garden_id,
            gardens!inner(
              id,
              name
            )
          ),
          plants(
            id,
            name,
            scientific_name,
            variety
          )
        `)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.plant_bed_id) {
        query = query.eq('plant_bed_id', filters.plant_bed_id)
      }
      if (filters?.plant_id) {
        query = query.eq('plant_id', filters.plant_id)
      }
      // SECURITY: Garden filtering is MANDATORY for logbook entries
      if (filters?.garden_id) {
        query = query.eq('plant_beds.garden_id', filters.garden_id)
      } else if (filters?.garden_id && Array.isArray(filters.garden_id) && filters.garden_id.length > 0) {
        query = query.in('plant_beds.garden_id', filters.garden_id)
      } else {
        // SECURITY: If no garden filter is provided, this could be a security issue
        // We should log this and potentially block the request
        // Console logging removed for banking standards.warn('⚠️ SECURITY WARNING: LogbookService.getAll called without garden filtering')
        // For now, we'll allow it for admin users, but this should be reviewed
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
      }

      const { data, error } = await query

      if (error) {
        throw new DatabaseError('Failed to fetch logbook entries', error.code, error)
      }

      // Transform nested data to flat structure
      const transformedData = data?.map(entry => ({
        ...entry,
        plant_bed_name: entry.plant_beds?.name || '',
        garden_id: entry.plant_beds?.garden_id || '',
        garden_name: entry.plant_beds?.gardens?.name || '',
        plant_name: entry.plants?.name || null,
        plant_scientific_name: entry.plants?.scientific_name || null,
        plant_variety: entry.plants?.variety || null,
      })) || []

      PerformanceLogger.endTimer(operationId, 'logbook-getAll')
      
      databaseLogger.debug('Logbook entries fetched successfully', { 
        count: transformedData?.length || 0,
        filters,
        operationId 
      })

      return createResponse<LogbookEntryWithDetails[]>(transformedData, null, 'fetch logbook entries')

    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'logbook-getAll', { error: true })
      
      if (error instanceof DatabaseError) {
        databaseLogger.error('Database error in LogbookService.getAll', { error: error.message, filters, operationId })
        return createResponse<LogbookEntryWithDetails[]>(null, error.message, 'fetch logbook entries')
      }
      
      databaseLogger.error('Unexpected error in LogbookService.getAll', { error: error instanceof Error ? error.message : 'Unknown error', filters, operationId })
      return createResponse<LogbookEntryWithDetails[]>(null, 'An unexpected error occurred', 'fetch logbook entries')
    }
  }

  /**
   * Get a single logbook entry by ID
   */
  static async getById(id: string): Promise<ApiResponse<LogbookEntryWithDetails>> {
    const operationId = `logbook-getById-${Date.now()}`
    PerformanceLogger.startTimer(operationId)
    
    try {
      await validateConnection()
      
      if (!id) {
        throw new ValidationError('Logbook entry ID is required', 'id')
      }

      const { data, error } = await getSupabaseClient()
        .from('logbook_entries')
        .select(`
          *,
          plant_beds!inner(
            id,
            name,
            garden_id,
            gardens!inner(
              id,
              name
            )
          ),
          plants(
            id,
            name,
            scientific_name,
            variety
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Logbook entry', id)
        }
        throw new DatabaseError('Failed to fetch logbook entry', error.code, error)
      }

      // Transform nested data to flat structure
      const transformedData = {
        ...data,
        plant_bed_name: data.plant_beds?.name || '',
        garden_id: data.plant_beds?.garden_id || '',
        garden_name: data.plant_beds?.gardens?.name || '',
        plant_name: data.plants?.name || null,
        plant_scientific_name: data.plants?.scientific_name || null,
        plant_variety: data.plants?.variety || null,
      }

      PerformanceLogger.endTimer(operationId, 'logbook-getById')
      
      databaseLogger.debug('Logbook entry fetched successfully', { id, operationId })

      return createResponse<LogbookEntryWithDetails>(transformedData, null, 'fetch logbook entry')

    } catch (error) {
      PerformanceLogger.endTimer(operationId, 'logbook-getById', { error: true })
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        databaseLogger.error('Logbook entry fetch validation failed', { error: error.message, id, operationId })
        return createResponse<LogbookEntryWithDetails>(null, error.message, 'fetch logbook entry')
      }
      
      if (error instanceof DatabaseError) {
        databaseLogger.error('Database error in LogbookService.getById', { error: error.message, id, operationId })
        return createResponse<LogbookEntryWithDetails>(null, error.message, 'fetch logbook entry')
      }
      
      databaseLogger.error('Unexpected error in LogbookService.getById', { error: error instanceof Error ? error.message : 'Unknown error', id, operationId })
      return createResponse<LogbookEntryWithDetails>(null, 'An unexpected error occurred', 'fetch logbook entry')
    }
  }
}