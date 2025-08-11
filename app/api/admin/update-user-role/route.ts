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

export async function PUT(request: NextRequest) {
  try {
    const { userId, newRole, userEmail, adminEmail } = await request.json()

    // Validate input
    if (!userId || !newRole || !userEmail || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'user']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or user' },
        { status: 400 }
      )
    }

    // 🏦 BANKING SECURITY: Protect emergency admin from role changes
    const emergencyAdminEmail = process.env.NEXT_PUBLIC_EMERGENCY_ADMIN_EMAIL
    if (emergencyAdminEmail && userEmail.toLowerCase() === emergencyAdminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot modify emergency admin role' },
        { status: 403 }
      )
    }

    // Banking-compliant: Update role in public.users table with service role
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (dbError) {
      console.error('Database role update error:', dbError)
      return NextResponse.json(
        { error: `Role update failed: ${dbError.message}` },
        { status: 500 }
      )
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: Role updated by ${adminEmail} - User: ${userEmail} (ID: ${userId}) - New role: ${newRole}`)

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    })

  } catch (error) {
    console.error('Admin update role API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}