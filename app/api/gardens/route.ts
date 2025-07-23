import { NextRequest, NextResponse } from 'next/server'
import { TuinService } from '@/lib/services/database.service'
import { apiLogger, AuditLogger } from '@/lib/logger'
import { validateTuinFormData } from '@/lib/validation'

/**
 * GET /api/gardens
 * Retrieve all gardens with optional filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  const operationId = `gardens-get-${Date.now()}`
  
  try {
    apiLogger.info('GET /api/gardens', { operationId })
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const sortField = searchParams.get('sort') || 'created_at'
    const sortDirection = searchParams.get('direction') || 'desc'
    
    // Build filters and sort options
    const filters = search ? { query: search } : undefined
    const sort = { field: sortField, direction: sortDirection as 'asc' | 'desc' }
    
    // Call service
    const result = await TuinService.getAll(filters, sort, page, pageSize)
    
    if (!result.success) {
      apiLogger.error('Failed to fetch gardens', undefined, { operationId, error: result.error })
      return NextResponse.json(result, { status: 500 })
    }
    
    apiLogger.info('Gardens fetched successfully', { 
      operationId, 
      count: result.data?.data.length || 0 
    })
    
    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    
    apiLogger.error('Unexpected error in GET /api/gardens', error as Error, { operationId })
    
    return NextResponse.json(
      {
        data: null,
        error: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gardens
 * Create a new garden
 */
export async function POST(request: NextRequest) {
  const operationId = `gardens-post-${Date.now()}`
  
  try {
    apiLogger.info('POST /api/gardens', { operationId })
    
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      apiLogger.error('Invalid JSON in request body', parseError as Error, { operationId })
      return NextResponse.json(
        {
          data: null,
          error: 'Invalid JSON in request body',
          success: false
        },
        { status: 400 }
      )
    }
    
    // Validate input
    const validation = validateTuinFormData(body)
    if (!validation.isValid) {
      const firstError = validation.errors[0]
      apiLogger.warn('Validation failed for garden creation', { 
        operationId, 
        errors: validation.errors 
      })
      
      return NextResponse.json(
        {
          data: null,
          error: firstError.message,
          success: false
        },
        { status: 400 }
      )
    }
    
    // Create garden
    const result = await TuinService.create(body)
    
    if (!result.success) {
      apiLogger.error('Failed to create garden', undefined, { 
        operationId, 
        error: result.error,
        data: body
      })
      
      // Determine appropriate status code
      const statusCode = result.error?.includes('required') ? 400 : 500
      return NextResponse.json(result, { status: statusCode })
    }
    
    apiLogger.info('Garden created successfully', { 
      operationId, 
      gardenId: result.data?.id,
      name: result.data?.name
    })
    
    // Log audit trail
    AuditLogger.logUserAction(
      null, // No user context available
      'CREATE',
      'gardens',
      result.data?.id,
      { name: result.data?.name }
    )
    
    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    
    apiLogger.error('Unexpected error in POST /api/gardens', error as Error, { operationId })
    
    return NextResponse.json(
      {
        data: null,
        error: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}