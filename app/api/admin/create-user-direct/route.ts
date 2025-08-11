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

// Generate a random temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, role, adminEmail } = await request.json()

    // Validate input
    if (!email || !fullName || !role || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: email, fullName, role, adminEmail' },
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

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or user' },
        { status: 400 }
      )
    }

    console.log(`🔐 ADMIN ACTION: Creating user directly - Email: ${email}, Role: ${role}`)

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())

    if (checkError) {
      console.error('Error checking existing users:', checkError)
      return NextResponse.json(
        { error: `Could not check existing users: ${checkError.message}` },
        { status: 500 }
      )
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log(`🔐 ADMIN ACTION: Attempted to create duplicate user - Email: ${email} (already exists)`)
      return NextResponse.json(
        { error: `Gebruiker met email ${email} bestaat al. Gebruik "Wachtwoord Resetten" om toegang te herstellen.` },
        { status: 409 }
      )
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Create user in Supabase Auth with service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: temporaryPassword,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: fullName,
        role: role,
        created_by_admin: adminEmail,
        created_at: new Date().toISOString()
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
        { error: 'User creation failed - no user data returned' },
        { status: 500 }
      )
    }

    // Create user profile in users table with force password change
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase().trim(),
        full_name: fullName,
        role: role,
        status: 'active',
        is_active: true, // Ensure new users are active
        force_password_change: true, // User must change password on first login
        password_changed_at: null,
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Cleanup: Delete auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: User created directly by ${adminEmail} - Email: ${email}, Role: ${role}, ID: ${authData.user.id}`)

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: email,
        fullName: fullName,
        role: role,
        temporaryPassword: temporaryPassword,
        forcePasswordChange: true
      }
    })

  } catch (error) {
    console.error('Create user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}