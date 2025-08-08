import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server-auth-simple'
import { supabase } from '@/lib/supabase'
import { GardenCreateSchema, validateRequestBody } from '@/lib/security/validation'

/**
 * SECURE GARDENS API - Met Authentication & RLS
 * Conform: DNB Good Practice, NCSC ICT-beveiligingsrichtlijnen
 */

/**
 * GET /api/gardens
 * Retrieve gardens accessible to authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { user } = await requireAuth(request)
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 50) // Max 50
    
    // Build query with RLS (automatically filters by user access)
    let query = supabase
      .from('gardens')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    // Apply sorting
    query = query.order('created_at', { ascending: false })
    
    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error in GET /api/gardens:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gardens', success: false },
        { status: 500 }
      )
    }
    
    // Log successful data access (with user context)
    console.log(`User ${user.email} accessed ${data?.length || 0} gardens`)
    
    return NextResponse.json({
      data: {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      },
      success: true
    })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }
    
    console.error('Unexpected error in GET /api/gardens:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gardens
 * Create new garden (authenticated users only)
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { user } = await requireAuth(request)
    
    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body', success: false },
        { status: 400 }
      )
    }
    
    // SECURITY: Validate input with Zod
    const validation = await validateRequestBody(GardenCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, success: false },
        { status: 400 }
      )
    }
    
    // Create garden with created_by field (for RLS)
    const gardenData = {
      ...validation.data,
      created_by: user.id, // SECURITY: Set owner for RLS
      is_active: true
    }
    
    const { data, error } = await supabase
      .from('gardens')
      .insert(gardenData)
      .select('*')
      .single()
    
    if (error) {
      console.error('Database error in POST /api/gardens:', error)
      return NextResponse.json(
        { error: 'Failed to create garden', success: false },
        { status: 500 }
      )
    }
    
    // Log successful creation (with user context)
    console.log(`User ${user.email} created garden: ${data.name} (${data.id})`)
    
    return NextResponse.json({
      data,
      success: true
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }
    
    console.error('Unexpected error in POST /api/gardens:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}