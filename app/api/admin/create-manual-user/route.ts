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
    const { email, fullName, role, tempPassword, adminEmail, gardenAccess } = await request.json()

    // Validate input
    if (!email || !fullName || !tempPassword || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: email, fullName, tempPassword, adminEmail' },
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

    // Validate password strength
    if (tempPassword.length < 8) {
      return NextResponse.json(
        { error: 'Temporary password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true, // Skip email confirmation for manual creation
      user_metadata: {
        full_name: fullName,
        role: role || 'user',
        created_by: adminEmail,
        manual_creation: true
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: `User creation failed: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user data returned from auth creation' },
        { status: 500 }
      )
    }

    // Step 2: Create user profile in public.users
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase().trim(),
        full_name: fullName,
        role: role || 'user',
        status: 'active', // Immediately active for manual creation
        force_password_change: true, // Force password change on first login
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Step 3: Add garden access if provided and user is not admin
    if (role !== 'admin' && gardenAccess && gardenAccess.length > 0) {
      const gardenAccessInserts = gardenAccess.map((gardenId: string) => ({
        user_id: authData.user.id,
        garden_id: gardenId,
        granted_by: adminEmail
      }))

      const { error: accessError } = await supabaseAdmin
        .from('user_garden_access')
        .insert(gardenAccessInserts)

      if (accessError) {
        console.warn('Garden access creation error:', accessError)
        // Don't fail the entire operation for garden access issues
      }
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: Manual user created by ${adminEmail} - Email: ${email}, Role: ${role || 'user'}`)

    // Log to system_logs table
    await supabaseAdmin
      .from('system_logs')
      .insert({
        level: 'INFO',
        message: `Manual user creation: ${email} by ${adminEmail}`,
        context: 'user-management-manual',
        user_id: authData.user.id
      })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: authData.user.id,
      tempPassword: tempPassword // Return for admin reference
    })

  } catch (error) {
    console.error('Manual user creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}