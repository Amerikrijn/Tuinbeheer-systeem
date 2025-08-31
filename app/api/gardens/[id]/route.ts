/**
 * BANKING-GRADE API ROUTE
 * Garden operations with proper security and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/config'

// Get server-side Supabase client
function getServerClient(request: NextRequest) {
  const config = getSupabaseConfig()
  
  // Get auth token from request if available
  const authHeader = request.headers.get('authorization')
  
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    }
  })
}

// DELETE /api/gardens/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate garden ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json(
        { error: 'Ongeldig tuin ID formaat' },
        { status: 400 }
      )
    }
    
    const supabase = getServerClient(request)
    
    // Soft delete - set is_active to false
    const { data, error } = await supabase
      .from('gardens')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      
      // Don't expose database errors to client
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tuin niet gevonden' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Er ging iets mis bij het verwijderen' },
        { status: 500 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Tuin niet gevonden' },
        { status: 404 }
      )
    }
    
    // Log the action for audit trail
    console.log(`Garden ${params.id} soft deleted at ${new Date().toISOString()}`)
    
    return NextResponse.json({
      success: true,
      message: 'Tuin succesvol verwijderd',
      data: { id: params.id }
    })
    
  } catch (error) {
    console.error('Unexpected error in DELETE /api/gardens/[id]:', error)
    
    return NextResponse.json(
      { error: 'Er ging iets mis. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

// GET /api/gardens/[id] - For future use
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient(request)
    
    const { data, error } = await supabase
      .from('gardens')
      .select(`
        *,
        plant_beds (
          *,
          plants (*)
        )
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Tuin niet gevonden' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error in GET /api/gardens/[id]:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

// PATCH /api/gardens/[id] - For future use
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate input
    const allowedFields = ['name', 'location', 'description', 'length', 'width']
    const updates: any = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Geen geldige velden om bij te werken' },
        { status: 400 }
      )
    }
    
    updates.updated_at = new Date().toISOString()
    
    const supabase = getServerClient(request)
    
    const { data, error } = await supabase
      .from('gardens')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Kon tuin niet bijwerken' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error in PATCH /api/gardens/[id]:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}