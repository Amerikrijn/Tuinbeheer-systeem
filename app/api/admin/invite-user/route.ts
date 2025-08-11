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

export async function POST(request: NextRequest) {
  try {
    // Check if admin client can be created
    const supabaseAdmin = createAdminClient();

    const { email, fullName, role, message, adminEmail, siteUrl } = await request.json()

    // Validate input
    if (!email || !fullName || !role || !adminEmail || !siteUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Banking-compliant: Admin invite user with service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${siteUrl}/auth/accept-invitation`,
        data: { 
          full_name: fullName, 
          role: role,
          invited_by: adminEmail,
          message: message || 'Welkom bij het tuinbeheer systeem!'
        }
      }
    )

    if (authError) {
      console.error('Admin invite error:', authError)
      return NextResponse.json(
        { error: `Invitation failed: ${authError.message}` },
        { status: 500 }
      )
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: User invited by ${adminEmail} - Email: ${email}, Role: ${role}`)

    return NextResponse.json({
      success: true,
      message: 'User invitation sent successfully',
      userId: authData.user?.id
    })

  } catch (error) {
    console.error('Admin invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}