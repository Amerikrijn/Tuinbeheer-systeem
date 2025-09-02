import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSafeSupabaseConfig } from '@/lib/config';

// Force dynamic rendering since this route handles query parameters
export const dynamic = 'force-dynamic';

// Banking-grade admin client with service role
function getSupabaseAdminClient() {
  const config = getSafeSupabaseConfig()
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
  
  return createClient(
    config.url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

function localAuditLog(action: string, details: any) {
  console.log(`🔒 ADMIN AUDIT: ${action}`, {
    timestamp: new Date().toISOString(),
    action,
    details
  })
}

// GET - List deleted users
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: deletedUsers, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, updated_at')
      .eq('is_active', false)
      .order('updated_at', { ascending: false })

    if (error) {
      localAuditLog('TRASH_LIST_FAILED', { error: error.message })
      return NextResponse.json({ error: 'Failed to fetch deleted users' }, { status: 500 })
    }

    localAuditLog('TRASH_LIST_SUCCESS', { count: deletedUsers?.length || 0 })
    return NextResponse.json({ users: deletedUsers || [] })
  } catch (error) {
    localAuditLog('TRASH_LIST_EXCEPTION', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Restore deleted user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    // Get deleted user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .eq('is_active', false)
      .single()

    if (userError || !userData) {
      localAuditLog('RESTORE_USER_NOT_FOUND', { userId })
      return NextResponse.json({ error: 'User not found in trash' }, { status: 404 })
    }

    // Restore user
    const { error: restoreError } = await supabaseAdmin
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (restoreError) {
      localAuditLog('RESTORE_USER_FAILED', { userId, error: restoreError.message })
      return NextResponse.json({ error: 'Failed to restore user' }, { status: 500 })
    }

    localAuditLog('RESTORE_USER_SUCCESS', { 
      userId, 
      email: userData.email,
      fullName: userData.full_name,
      role: userData.role
    })

    return NextResponse.json({ 
      message: 'User restored successfully',
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      }
    })
  } catch (error) {
    localAuditLog('RESTORE_USER_EXCEPTION', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Permanently delete user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    // Get deleted user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .eq('is_active', false)
      .single()

    if (userError || !userData) {
      localAuditLog('PERMANENT_DELETE_USER_NOT_FOUND', { userId })
      return NextResponse.json({ error: 'User not found in trash' }, { status: 404 })
    }

    // Check for dependencies before permanent deletion
    const supabaseAdminCheck = getSupabaseAdminClient()

    // Check user_garden_access
    const { data: gardenAccess } = await supabaseAdminCheck
      .from('user_garden_access')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    // Check tasks
    const { data: tasks } = await supabaseAdminCheck
      .from('tasks')
      .select('id')
      .eq('assigned_to', userId)
      .limit(1)

    // Check logbook entries
    const { data: logbook } = await supabaseAdminCheck
      .from('logbook_entries')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    // If there are dependencies, return error
    if (gardenAccess && gardenAccess.length > 0) {
      localAuditLog('PERMANENT_DELETE_BLOCKED_GARDEN_ACCESS', { userId })
      return NextResponse.json({ 
        error: 'Cannot permanently delete user: has garden access records' 
      }, { status: 409 })
    }

    if (tasks && tasks.length > 0) {
      localAuditLog('PERMANENT_DELETE_BLOCKED_TASKS', { userId })
      return NextResponse.json({ 
        error: 'Cannot permanently delete user: has assigned tasks' 
      }, { status: 409 })
    }

    if (logbook && logbook.length > 0) {
      localAuditLog('PERMANENT_DELETE_BLOCKED_LOGBOOK', { userId })
      return NextResponse.json({ 
        error: 'Cannot permanently delete user: has logbook entries' 
      }, { status: 409 })
    }

    // Only proceed if no dependencies (rare case)
    // Delete from auth first
    const { error: authError } = await supabaseAdminCheck.auth.admin.deleteUser(userId)
    if (authError) {
      localAuditLog('PERMANENT_DELETE_AUTH_FAILED', { userId, error: authError.message })
      return NextResponse.json({ error: 'Failed to delete user from auth' }, { status: 500 })
    }

    // Delete from database
    const { error: dbError } = await supabaseAdminCheck
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      localAuditLog('PERMANENT_DELETE_DB_FAILED', { userId, error: dbError.message })
      return NextResponse.json({ error: 'Failed to delete user from database' }, { status: 500 })
    }

    localAuditLog('PERMANENT_DELETE_SUCCESS', { 
      userId, 
      email: userData.email,
      fullName: userData.full_name
    })

    return NextResponse.json({ message: 'User permanently deleted' })
  } catch (error) {
    localAuditLog('PERMANENT_DELETE_EXCEPTION', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}