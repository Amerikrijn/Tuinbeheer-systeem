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

export async function DELETE(request: NextRequest) {
  try {
    const { userId, userEmail, adminEmail } = await request.json()

    // Validate input
    if (!userId || !userEmail || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current admin user ID for audit trail
    const { data: { user: adminUser }, error: adminAuthError } = await supabaseAdmin.auth.getUser()
    
    if (adminAuthError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication failed' },
        { status: 401 }
      )
    }

    // Banking-compliant: Use SQL function for safe soft delete
    const { data: deleteResult, error: deleteError } = await supabaseAdmin
      .rpc('soft_delete_user', {
        p_user_id: userId,
        p_admin_id: adminUser.id
      })

    if (deleteError || !deleteResult) {
      console.error('Soft delete function error:', deleteError)
      return NextResponse.json(
        { error: `User deletion failed: ${deleteError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Banking-compliant: Delete from auth.users (removes login ability)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.warn('Auth delete warning (non-critical):', authError)
      // Don't fail the operation - soft delete already prevents access
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: User deleted by ${adminEmail} - User: ${userEmail} (ID: ${userId})`)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Admin delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}