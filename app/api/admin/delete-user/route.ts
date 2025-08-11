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

export async function DELETE(request: NextRequest) {
  try {
    // Check if admin client can be created
    const supabaseAdmin = createAdminClient();

    const { userId, userEmail, adminEmail } = await request.json()

    // Validate input
    if (!userId || !userEmail || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Banking-compliant: Delete from public.users table first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return NextResponse.json(
        { error: `Database deletion failed: ${dbError.message}` },
        { status: 500 }
      )
    }

    // Banking-compliant: Delete from auth.users with service role
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth delete error:', authError)
      return NextResponse.json(
        { error: `Auth deletion failed: ${authError.message}` },
        { status: 500 }
      )
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