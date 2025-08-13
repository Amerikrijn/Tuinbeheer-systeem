import { NextRequest, NextResponse } from 'next/server'
import { TuinService } from '@/lib/services/database.service'
import { apiLogger, AuditLogger } from '@/lib/logger'
import { validateTuinFormData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { logClientSecurityEvent, validateApiInput } from '@/lib/banking-security'

/**
 * GET /api/gardens
 * Retrieve all gardens with optional filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const operationId = `gardens-get-${Date.now()}`
  let userId: string | null = null
  
  try {
    apiLogger.info('GET /api/gardens', { operationId })
    
    // 1. Authentication check (banking-grade)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        await logClientSecurityEvent('API_AUTH_FAILED', 'HIGH', false, 'Unauthorized API access to gardens')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id
    } catch (authException) {
      // Fallback: If auth check fails completely, deny access
      await logClientSecurityEvent('API_AUTH_EXCEPTION', 'CRITICAL', false, 'Authentication system failure')
      return NextResponse.json({ error: 'Authentication system unavailable' }, { status: 503 })
    }
    
    // Parse query parameters
    const search = request.nextUrl.searchParams.get('search') || undefined
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '10', 10)
    const sortField = request.nextUrl.searchParams.get('sort') || 'created_at'
    const sortDirection = request.nextUrl.searchParams.get('direction') || 'desc'
    
    // Build filters and sort options
    const filters = search ? { query: search } : undefined
    const sort = { field: sortField, direction: sortDirection as 'asc' | 'desc' }
    
    // Call service
    const result = await TuinService.getAll(filters, sort, page, pageSize)
    
    if (!result.success) {
      apiLogger.error('Failed to fetch gardens', undefined, { operationId, error: result.error })
      return NextResponse.json(result, { status: 500 })
    }
    
    // Success logging
    await logClientSecurityEvent('API_GARDENS_GET_SUCCESS', 'LOW', true, undefined, Date.now() - startTime)
    
    apiLogger.info('Gardens fetched successfully', { 
      operationId, 
      count: result.data?.data.length || 0 
    })
    
    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    
    // Banking-grade error logging
    await logClientSecurityEvent('API_GARDENS_GET_ERROR', 'HIGH', false, errorMessage, Date.now() - startTime)
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
  const startTime = Date.now()
  const operationId = `gardens-post-${Date.now()}`
  let userId: string | null = null
  
  try {
    apiLogger.info('POST /api/gardens', { operationId })
    
    // 1. Authentication check (banking-grade)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        await logClientSecurityEvent('API_AUTH_FAILED', 'HIGH', false, 'Unauthorized API access to create garden')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id
    } catch (authException) {
      // Fallback: If auth check fails completely, deny access
      await logClientSecurityEvent('API_AUTH_EXCEPTION', 'CRITICAL', false, 'Authentication system failure')
      return NextResponse.json({ error: 'Authentication system unavailable' }, { status: 503 })
    }
    
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      await logClientSecurityEvent('API_INVALID_JSON', 'MEDIUM', false, 'Invalid JSON in request body')
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
    
    // 2. Input validation (banking-grade)
    if (!validateApiInput(body)) {
      await logClientSecurityEvent('API_VALIDATION_FAILED', 'HIGH', false, 'Invalid API input for garden creation')
      return NextResponse.json(
        {
          data: null,
          error: 'Invalid input data',
          success: false
        },
        { status: 400 }
      )
    }
    
    // Validate input
    const validation = validateTuinFormData(body)
    if (!validation.isValid) {
      const firstError = validation.errors[0]
      await logClientSecurityEvent('API_FORM_VALIDATION_FAILED', 'MEDIUM', false, firstError.message)
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
      await logClientSecurityEvent('API_GARDEN_CREATE_FAILED', 'HIGH', false, result.error || 'Garden creation failed')
      apiLogger.error('Failed to create garden', undefined, { 
        operationId, 
        error: result.error,
        data: body
      })
      
      // Determine appropriate status code
      const statusCode = result.error?.includes('required') ? 400 : 500
      return NextResponse.json(result, { status: statusCode })
    }
    
    // Success logging
    await logClientSecurityEvent('API_GARDEN_CREATE_SUCCESS', 'LOW', true, undefined, Date.now() - startTime)
    
    apiLogger.info('Garden created successfully', { 
      operationId, 
      gardenId: result.data?.id,
      name: result.data?.name
    })
    
    // Log audit trail
    AuditLogger.logUserAction(
      userId,
      'CREATE',
      'gardens',
      result.data?.id,
      { name: result.data?.name }
    )
    
    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    
    // Banking-grade error logging
    await logClientSecurityEvent('API_GARDEN_CREATE_ERROR', 'HIGH', false, errorMessage, Date.now() - startTime)
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