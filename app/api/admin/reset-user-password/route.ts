import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword()

    // Update auth user password
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: tempPassword,
      user_metadata: {
        temp_password: true
      }
    })

    if (authError) {
      console.error('Auth password update error:', authError)
      return NextResponse.json(
        { error: `Failed to update password: ${authError.message}` },
        { status: 500 }
      )
    }

    // Update profile to require password change
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({
        force_password_change: true,
        password_changed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: `Failed to update user profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Log admin action
    console.log(`✅ ADMIN ACTION: Password reset - User: ${userData.email}`)

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        tempPassword: tempPassword
      },
      message: 'Password reset successfully. Share the new temporary password with the user.'
    })

  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}