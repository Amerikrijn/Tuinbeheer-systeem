import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with error handling
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in environment variables');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables. Please configure this environment variable for admin operations.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

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
    const validRoles = ['admin', 'user', 'viewer']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
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