/**
 * Garden Users API Route
 * Implemented by Senior IMPL Agent with banking standards compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const gardenId = params.id

    // Get users assigned to this garden
    const { data: assignedUsers, error } = await supabase
      .from('user_garden_access')
      .select(`
        id,
        user_id,
        access_level,
        granted_at,
        is_active,
        profiles:user_id (
          id,
          email,
          name
        )
      `)
      .eq('garden_id', gardenId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching assigned users:', error)
      return NextResponse.json({ error: 'Failed to fetch assigned users' }, { status: 500 })
    }

    // Transform data for frontend
    const users = assignedUsers?.map(access => ({
      id: access.profiles.id,
      email: access.profiles.email,
      name: access.profiles.name,
      accessLevel: access.access_level,
      grantedAt: access.granted_at
    })) || []

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in GET /api/admin/gardens/[id]/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const gardenId = params.id
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user is already assigned
    const { data: existingAccess } = await supabase
      .from('user_garden_access')
      .select('id')
      .eq('user_id', userId)
      .eq('garden_id', gardenId)
      .eq('is_active', true)
      .single()

    if (existingAccess) {
      return NextResponse.json({ error: 'User is already assigned to this garden' }, { status: 409 })
    }

    // Assign user to garden
    const { data: newAccess, error } = await supabase
      .from('user_garden_access')
      .insert({
        user_id: userId,
        garden_id: gardenId,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        access_level: 'user',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error assigning user to garden:', error)
      return NextResponse.json({ error: 'Failed to assign user to garden' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User assigned to garden successfully',
      access: newAccess
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/gardens/[id]/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const gardenId = params.id
    const userId = params.userId

    // Remove user from garden (soft delete)
    const { error } = await supabase
      .from('user_garden_access')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('garden_id', gardenId)

    if (error) {
      console.error('Error removing user from garden:', error)
      return NextResponse.json({ error: 'Failed to remove user from garden' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User removed from garden successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/gardens/[id]/users/[userId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
