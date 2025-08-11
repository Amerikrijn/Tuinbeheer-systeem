import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Available server-side only
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword, adminEmail } = await request.json()

    // Validate input
    if (!userId || !newPassword || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, newPassword, adminEmail' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Banking-compliant: Admin password reset with service role
    const { data, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (resetError) {
      console.error('Admin password reset error:', resetError)
      return NextResponse.json(
        { error: `Password reset failed: ${resetError.message}` },
        { status: 500 }
      )
    }

    // Update user profile to force password change (graceful fallback if column missing)
    try {
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .update({ 
          force_password_change: true,
          password_changed_at: null,
          status: 'active'
        })
        .eq('id', userId)

      if (profileError) {
        // Check if it's a missing column error
        if (profileError.message?.includes('column "force_password_change" does not exist')) {
          console.warn('⚠️ DATABASE MIGRATION NEEDED: force_password_change column missing')
          console.warn('🔧 ACTION REQUIRED: Run database/04-force-password-change-migration.sql')
          
          // Fallback: Just update status to active (password reset still works)
          const { error: fallbackError } = await supabaseAdmin
            .from('users')
            .update({ status: 'active' })
            .eq('id', userId)
            
          if (fallbackError) {
            console.error('Fallback profile update failed:', fallbackError)
          }
        } else {
          console.warn('Profile update error:', profileError)
        }
      }
    } catch (migrationError) {
      console.warn('Migration-related error (non-critical for password reset):', migrationError)
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: Password reset by ${adminEmail} for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('Admin password reset API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}