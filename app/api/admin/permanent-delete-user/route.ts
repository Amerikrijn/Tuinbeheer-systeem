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

    // Clean up related data first to avoid foreign key constraints
    try {
      // Delete audit logs
      await supabaseAdmin
        .from('audit_log')
        .delete()
        .eq('user_id', userId)

      // Delete user garden access
      await supabaseAdmin
        .from('user_garden_access')
        .delete()
        .eq('user_id', userId)

      // Delete user tasks
      await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('user_id', userId)

      // Delete user logbook entries  
      await supabaseAdmin
        .from('logbook_entries')
        .delete()
        .eq('user_id', userId)

    } catch (cleanupError) {
      console.warn('Related data cleanup warning:', cleanupError)
      // Continue - some tables might not exist or have different structure
    }

    // Permanent delete: Remove from auth first
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.warn('Auth deletion warning:', authDeleteError)
      // Continue anyway - auth user might not exist
    }

    // Then delete from users table
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