import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side admin client with service role key
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

export async function POST(request: NextRequest) {
  try {
    const { userId, adminEmail } = await request.json()

    // Validate input
    if (!userId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, adminEmail' },
        { status: 400 }
      )
    }

    // Get user info for logging before deletion
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, full_name, role')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user for deletion:', userError)
      return NextResponse.json(
        { error: `Could not find user: ${userError.message}` },
        { status: 404 }
      )
    }

    // 🏦 BANKING SECURITY: Protect emergency admin from deletion
    const emergencyAdminEmail = process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL
    if (emergencyAdminEmail && userData.email.toLowerCase() === emergencyAdminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot delete emergency admin account' },
        { status: 403 }
      )
    }

    // For soft delete, we keep all related data intact
    // Only the user is marked as inactive (is_active = false)
    // Related data (garden access, tasks, logbook entries) remains for restore capability

    // Soft delete: Set is_active to false instead of hard delete
    const { error: profileDeleteError } = await supabaseAdmin
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileDeleteError) {
      console.error('Database error deleting user:', profileDeleteError)
      return NextResponse.json(
        { error: `Database error deleting user: ${profileDeleteError.message}` },
        { status: 500 }
      )
    }

    // Note: We keep the auth user active for potential restore
    // Auth deletion is only done for permanent delete via trash management

    // Log admin action for audit trail (production: use proper logging service)
    // User successfully deleted: ${userData.email} by ${adminEmail}

          return NextResponse.json({
        success: true,
        message: 'User soft deleted successfully (moved to trash)',
        deletedUser: {
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role
        }
      })

  } catch (error) {
    console.error('Delete user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}