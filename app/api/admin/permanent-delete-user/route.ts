import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify admin permission (get current user from session)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Get user data before deletion for logging
    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('email, full_name, role')
      .eq('id', userId)
      .single()

    if (userFetchError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Banking-compliant approach: Check for dependencies first
    const dependencies = []
    
    // Check audit_log references
    const { data: auditLogs, error: auditError } = await supabaseAdmin
      .from('audit_log')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    if (auditLogs && auditLogs.length > 0) {
      dependencies.push('audit logs')
    }

    // Check user_garden_access references
    const { data: gardenAccess, error: accessError } = await supabaseAdmin
      .from('user_garden_access')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    if (gardenAccess && gardenAccess.length > 0) {
      dependencies.push('garden access')
    }

    // Check tasks references
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    if (tasks && tasks.length > 0) {
      dependencies.push('tasks')
    }

    // Check logbook_entries references
    const { data: logbook, error: logbookError } = await supabaseAdmin
      .from('logbook_entries')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    if (logbook && logbook.length > 0) {
      dependencies.push('logbook entries')
    }

    // Banking compliance: Don't allow permanent delete if dependencies exist
    if (dependencies.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot permanently delete user: has ${dependencies.join(', ')}. Use soft delete instead for compliance.`,
          dependencies: dependencies,
          recommendation: 'Keep user soft-deleted for audit trail compliance'
        },
        { status: 409 } // Conflict
      )
    }

    // Only proceed if no dependencies (rare case for new/test users)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.warn('Auth deletion warning:', authDeleteError)
    }

    const { error: dbDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbDeleteError) {
      console.error('Database deletion error:', dbDeleteError)
      return NextResponse.json(
        { error: `Database error: ${dbDeleteError.message}` },
        { status: 500 }
      )
    }

    // Log admin action for audit trail
    console.log(`🗑️ PERMANENT DELETE: User ${userData.email} permanently deleted`)

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted',
      deletedUser: {
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role
      }
    })

  } catch (error) {
    console.error('Permanent delete user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}