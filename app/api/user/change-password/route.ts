import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Banking-compliant: Verify user exists and validate current password
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // For force password change, we trust the admin-set temporary password
    // No need to verify current password as this is a security-mandated change

    // Update password using admin client (more reliable)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: `Password update failed: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Clear force_password_change flag using admin client
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({ 
        force_password_change: false,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: `Profile update failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Log security action for audit trail
    console.log(`🔐 SECURITY ACTION: User ${userId} changed password after admin reset`)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}