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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get deleted user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .eq('is_active', false) // Only restore deleted users
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Deleted user not found' },
        { status: 404 }
      )
    }

    // Restore: Set is_active to true
    const { error: restoreError } = await supabaseAdmin
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (restoreError) {
      console.error('User restore error:', restoreError)
      return NextResponse.json(
        { error: `Failed to restore user: ${restoreError.message}` },
        { status: 500 }
      )
    }

    // Log admin action
    console.log(`✅ ADMIN ACTION: User restored - Email: ${userData.email}`)

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role
      },
      message: 'User restored successfully.'
    })

  } catch (error) {
    console.error('Restore user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}