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

    // Banking-compliant approach: Check if user already exists first
    const { data: existingAuth, error: existingAuthError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (existingAuth?.users?.some(u => u.email === email.toLowerCase().trim())) {
      return NextResponse.json(
        { error: `Gebruiker met email ${email} bestaat al. Gebruik "Wachtwoord Resetten" om toegang te herstellen.` },
        { status: 409 }
      )
    }

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
    // Use transaction-like approach with better error handling
    let profileCreated = false
    
    try {
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
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }
      
      profileCreated = true
      
      // Verify profile was actually created
      const { data: verifyProfile, error: verifyError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', authData.user.id)
        .single()
      
      if (verifyError || !verifyProfile) {
        throw new Error('Profile verification failed - user not found after creation')
      }
      
    } catch (profileError) {
      console.error('Profile creation/verification error:', profileError)
      
      // Cleanup: Delete auth user if profile creation failed
      try {
        console.log(`🧹 Attempting cleanup of auth user: ${authData.user.id}`)
        const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        if (cleanupError) {
          console.error('❌ Failed to cleanup auth user after profile error:', cleanupError)
          // This is critical - we now have an orphaned auth user
          console.error(`🚨 ORPHANED AUTH USER: ${email} (ID: ${authData.user.id}) - Manual cleanup required`)
        } else {
          console.log('✅ Successfully cleaned up auth user after profile creation failure')
        }
      } catch (cleanupError) {
        console.error('❌ Cleanup operation exception:', cleanupError)
        console.error(`🚨 ORPHANED AUTH USER: ${email} (ID: ${authData.user.id}) - Manual cleanup required`)
      }
      
      return NextResponse.json(
        { 
          error: `User creation failed: ${profileError instanceof Error ? profileError.message : 'Profile creation error'}`,
          details: 'Auth user was cleaned up to prevent orphaned accounts'
        },
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