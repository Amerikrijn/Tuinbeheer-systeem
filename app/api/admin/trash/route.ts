import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering since this route handles query parameters
export const dynamic = 'force-dynamic';

// 🏦 BANKING-GRADE: Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('🚨 CRITICAL: SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.error('This API requires service role access for admin operations')
}

// Banking-grade admin client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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
    const { data: deletedUsers, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, updated_at')
      .eq('is_active', false)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Deleted users fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch deleted users' }, { status: 500 })
    }

    localAuditLog('LIST_DELETED_USERS', { count: deletedUsers.length })

    return NextResponse.json({ deletedUsers })
  } catch (error) {
    console.error('GET trash error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Restore user
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get deleted user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .eq('is_active', false)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Deleted user not found' }, { status: 404 })
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
      console.error('User restore failed:', restoreError)
      return NextResponse.json(
        { error: `Restore failed: ${restoreError.message}` },
        { status: 500 }
      )
    }

    localAuditLog('RESTORE_USER', { 
      email: userData.email, 
      userId: userId 
    })

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'User restored successfully.'
    })

  } catch (error) {
    console.error('PUT trash error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Permanent delete (banking compliance: only if no dependencies)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get deleted user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .eq('is_active', false)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Deleted user not found' }, { status: 404 })
    }

    // Banking compliance: Check for dependencies
    const dependencies = []

    // Check user_garden_access
    const { data: gardenAccess } = await supabaseAdmin
      .from('user_garden_access')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (gardenAccess && gardenAccess.length > 0) {
      dependencies.push('garden access records')
    }

    // Check tasks
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (tasks && tasks.length > 0) {
      dependencies.push('task records')
    }

    // Check logbook entries
    const { data: logbook } = await supabaseAdmin
      .from('logbook_entries')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (logbook && logbook.length > 0) {
      dependencies.push('logbook entries')
    }

    // Banking compliance: Don't allow permanent delete if dependencies exist
    if (dependencies.length > 0) {
      return NextResponse.json({
        error: `Cannot permanently delete user: has ${dependencies.join(', ')}. Keep soft-deleted for audit compliance.`,
        dependencies: dependencies
      }, { status: 409 })
    }

    // Only proceed if no dependencies (rare case)
    // Delete from auth first
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Auth deletion warning:', authError)
      // Continue anyway - auth user might not exist
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Database deletion failed:', dbError)
      return NextResponse.json(
        { error: `Database deletion failed: ${dbError.message}` },
        { status: 500 }
      )
    }

    localAuditLog('PERMANENT_DELETE_USER', { 
      email: userData.email, 
      userId: userId 
    })

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted.'
    })

  } catch (error) {
    console.error('DELETE trash error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}