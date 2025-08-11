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
    const { userId, userEmail, adminEmail, siteUrl } = await request.json()

    // Validate input
    if (!userId || !userEmail || !adminEmail || !siteUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userEmail, adminEmail, siteUrl' },
        { status: 400 }
      )
    }

    // Check if user exists and is in pending status
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, status')
      .eq('id', userId)
      .eq('status', 'pending')
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found or not in pending status' },
        { status: 404 }
      )
    }

    // Banking-compliant: Send reminder email (not a new invitation)
    // Note: Supabase doesn't have a specific "reminder" email, so we use invite
    // but with different messaging to indicate it's a reminder
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      userEmail.toLowerCase().trim(),
      {
        redirectTo: `${siteUrl}/auth/accept-invitation`,
        data: { 
          full_name: userData.full_name || userEmail, 
          role: 'user', // Default for reminders
          invited_by: adminEmail,
          message: `Herinneringsmail: Je uitnodiging voor het tuinbeheer systeem wacht nog op activatie. Klik op de link om je account te activeren.`,
          is_reminder: true // Flag to indicate this is a reminder
        }
      }
    )

    if (authError) {
      console.error('Reminder email error:', authError)
      return NextResponse.json(
        { error: `Reminder email failed: ${authError.message}` },
        { status: 500 }
      )
    }

    // Log admin action for audit trail
    console.log(`🔐 ADMIN ACTION: Reminder email sent by ${adminEmail} to ${userEmail} (User ID: ${userId})`)

    // Log to system_logs table
    await supabaseAdmin
      .from('system_logs')
      .insert({
        level: 'INFO',
        message: `Reminder email sent to ${userEmail}`,
        context: 'user-management-reminder',
        user_id: userId
      })

    return NextResponse.json({
      success: true,
      message: 'Reminder email sent successfully',
      userId: userId
    })

  } catch (error) {
    console.error('Reminder email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}