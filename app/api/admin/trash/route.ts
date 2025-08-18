import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

// Force dynamic rendering since this route handles query parameters
export const dynamic = 'force-dynamic'

function localAuditLog(action: string, details: Record<string, unknown>) {
  // Use structured logging instead of console.log for production
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔒 ADMIN AUDIT: ${action}`, {
      timestamp: new Date().toISOString(),
      action,
      details
    })
  }
}

// GET - List deleted users and plantvakken
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()
    const type = request.nextUrl.searchParams.get('type') || 'all';
    
    let result: any = {};
    
    if (type === 'users' || type === 'all') {
      const { data: deletedUsers, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, updated_at')
        .eq('is_active', false)
        .order('updated_at', { ascending: false })

      if (userError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Deleted users fetch error:', userError)
        }
        return NextResponse.json({ error: 'Failed to fetch deleted users' }, { status: 500 })
      }
      
      result.deletedUsers = deletedUsers;
    }
    
    if (type === 'plantvakken' || type === 'all') {
      const { data: deletedPlantvakken, error: plantvakError } = await supabase
        .from('deleted_plantvakken')
        .select('*')
        .order('deleted_at', { ascending: false })

      if (plantvakError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Deleted plantvakken fetch error:', plantvakError)
        }
        return NextResponse.json({ error: 'Failed to fetch deleted plantvakken' }, { status: 500 })
      }
      
      result.deletedPlantvakken = deletedPlantvakken;
    }

    localAuditLog('LIST_DELETED_ITEMS', { 
      type, 
      userCount: result.deletedUsers?.length || 0,
      plantvakCount: result.deletedPlantvakken?.length || 0
    })

    return NextResponse.json(result)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GET trash error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Restore user or plantvak
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()
    const { userId, plantvakId, type } = await request.json()

    if (type === 'plantvak') {
      if (!plantvakId) {
        return NextResponse.json({ error: 'Plantvak ID is required' }, { status: 400 })
      }

      // Get deleted plantvak details
      const { data: plantvakData, error: plantvakError } = await supabase
        .from('deleted_plantvakken')
        .select('*')
        .eq('original_id', plantvakId)
        .single()

      if (plantvakError || !plantvakData) {
        return NextResponse.json({ error: 'Deleted plantvak not found' }, { status: 404 })
      }

      // Check if the letter code is still available in the garden
      const { data: existingPlantvak, error: checkError } = await supabase
        .from('plant_beds')
        .select('id')
        .eq('garden_id', plantvakData.garden_id)
        .eq('letter_code', plantvakData.letter_code)
        .eq('is_active', true)
        .single()

      if (existingPlantvak) {
        return NextResponse.json({ 
          error: 'Cannot restore plantvak - letter code already in use' 
        }, { status: 409 })
      }

      // Restore plantvak
      const { error: restoreError } = await supabase
        .from('plant_beds')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', plantvakData.original_id)

      if (restoreError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Plantvak restore failed:', restoreError)
        }
        return NextResponse.json(
          { error: 'Restore failed' },
          { status: 500 }
        )
      }

      // Remove from deleted_plantvakken table
      await supabase
        .from('deleted_plantvakken')
        .delete()
        .eq('original_id', plantvakId)

      localAuditLog('RESTORE_PLANTVAK', { 
        letterCode: plantvakData.letter_code, 
        plantvakId: plantvakId 
      })

      return NextResponse.json({
        success: true,
        plantvak: plantvakData,
        message: 'Plantvak restored successfully.'
      })
    } else {
      // Original user restore logic
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      }

      // Get deleted user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .eq('is_active', false)
        .single()

      if (userError || !userData) {
        return NextResponse.json({ error: 'Deleted user not found' }, { status: 404 })
      }

      // Restore user
      const { error: restoreError } = await supabase
        .from('users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (restoreError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('User restore failed:', restoreError)
        }
        return NextResponse.json(
          { error: 'Restore failed' },
          { status: 500 }
        )
      }

      localAuditLog('RESTORE_USER', { 
        email: userData.email, 
        userId: userId 
      })

      return NextResponse.json({
        success: true,
        user: userData,
        message: 'User restored successfully.'
      })
    }

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('PUT trash error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Permanent delete (banking compliance: only if no dependencies)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get deleted user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .eq('is_active', false)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Deleted user not found' }, { status: 404 })
    }

    // Banking compliance: Check for dependencies
    const dependencies = []

    // Check user_garden_access
    const { data: gardenAccess } = await supabase
      .from('user_garden_access')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (gardenAccess && gardenAccess.length > 0) {
      dependencies.push('garden access records')
    }

    // Check tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (tasks && tasks.length > 0) {
      dependencies.push('task records')
    }

    // Check logbook entries
    const { data: logbook } = await supabase
      .from('logbook_entries')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (logbook && logbook.length > 0) {
      dependencies.push('logbook entries')
    }

    // Banking compliance: Don't allow permanent delete if dependencies exist
    if (dependencies.length > 0) {
      return NextResponse.json({
        error: `Cannot permanently delete user: has ${dependencies.join(', ')}. Keep soft-deleted for audit compliance.`,
        dependencies: dependencies
      }, { status: 409 })
    }

    // Only proceed if no dependencies (rare case)
    // Delete from auth first
    const supabase = getSupabaseAdminClient()
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Auth deletion warning:', authError)
      // Continue anyway - auth user might not exist
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      // Log error for debugging but don't expose details to client
      if (process.env.NODE_ENV === 'development') {
        console.error('Database deletion failed:', dbError)
      }
      return NextResponse.json(
        { error: 'Database deletion failed' },
        { status: 500 }
      )
    }

    localAuditLog('PERMANENT_DELETE_USER', { 
      email: userData.email, 
      userId: userId 
    })

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted.'
    })

  } catch (error) {
    // Log error for debugging but don't expose details to client
    if (process.env.NODE_ENV === 'development') {
      console.error('DELETE trash error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}