import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSafeSupabaseConfig } from '../../../../lib/config'

// Force dynamic rendering since this route handles query parameters
export const dynamic = 'force-dynamic';

// 🏦 BANKING-GRADE: Safe environment variable handling
function getSupabaseAdminClient() {
  const config = getSafeSupabaseConfig()
  // Config is always available now, even during build time
  
  if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }

  return createClient(
    config.url,
    process.env['SUPABASE_SERVICE_ROLE_KEY'],
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Secure password generator
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Audit logging
function auditLog(action: string, details: any) {
  console.log(`🔒 ADMIN AUDIT: ${action}`, {
    timestamp: new Date().toISOString(),
    action,
    details
  })
}

// GET - List all active users
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, status, created_at, last_login, force_password_change')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {

      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // 🏦 BANKING-GRADE: Load garden access for all users
    const usersWithGardenAccess = await Promise.all(
      users.map(async (user) => {
        try {
          const supabaseAdminInner = getSupabaseAdminClient()
          const { data: gardenAccess, error: accessError } = await supabaseAdminInner
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', user.id)

          if (accessError) {
            // Log error but don't fail the whole operation
            auditLog('GARDEN_ACCESS_LOAD_FAILED', {
              userId: user.id,
              error: accessError.message
            })
            return {
              ...user,
              garden_access: []
            }
          }

          return {
            ...user,
            garden_access: gardenAccess?.map(item => item.garden_id) || []
          }
        } catch (error) {
          // Log error but don't fail the whole operation
          auditLog('GARDEN_ACCESS_LOAD_ERROR', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          return {
            ...user,
            garden_access: []
          }
        }
      })
    )

    auditLog('LIST_USERS', { count: usersWithGardenAccess.length })

    return NextResponse.json({ users: usersWithGardenAccess })
  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { email, fullName, role, gardenAccess } = await request.json()

    // Validation
    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, full name, and role are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or user' }, { status: 400 })
    }

    // Validate garden access for both users and admins
    if (gardenAccess && !Array.isArray(gardenAccess)) {
      return NextResponse.json({ error: 'Garden access must be an array' }, { status: 400 })
    }

    // Check if user exists
    const supabaseAdminCheck = getSupabaseAdminClient()
    const { data: existingUser } = await supabaseAdminCheck
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: `User with email ${email} already exists` },
        { status: 409 }
      )
    }

    // Generate secure temporary password
    const tempPassword = generateSecurePassword()

    // Create auth user
    const supabaseAdminCreate = getSupabaseAdminClient()
    const { data: authData, error: authError } = await supabaseAdminCreate.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
        temp_password: true,
        created_by_admin: true
      }
    })

    if (authError || !authData.user) {

      return NextResponse.json(
        { error: `Failed to create auth user: ${authError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Create profile - CRITICAL: must match auth ID
    const supabaseAdminProfile = getSupabaseAdminClient()
    const { error: profileError } = await supabaseAdminProfile
      .from('users')
      .insert({
        id: authData.user.id, // EXACT match with auth ID
        email: email.toLowerCase().trim(),
        full_name: fullName,
        role: role,
        status: 'active',
        is_active: true,
        force_password_change: true, // Must change on first login
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {

      // CRITICAL: Cleanup auth user if profile fails
      const supabaseAdminCleanup = getSupabaseAdminClient()
      await supabaseAdminCleanup.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    // 🏦 NEW: Create garden access for both users and admins (if specified)
    if (gardenAccess && gardenAccess.length > 0) {
      const supabaseAdminGarden = getSupabaseAdminClient()
      const gardenAccessRecords = gardenAccess.map((gardenId: string) => ({
        user_id: authData.user.id,
        garden_id: gardenId,
        granted_by: 'admin', // Track who granted access
        granted_at: new Date().toISOString()
      }))

      const { error: accessError } = await supabaseAdminGarden
        .from('user_garden_access')
        .insert(gardenAccessRecords)

      if (accessError) {

        // Don't fail the user creation, just log the issue
        auditLog('GARDEN_ACCESS_CREATION_FAILED', {
          userId: authData.user.id,
          email: email.toLowerCase().trim(),
          role: role,
          gardenAccess: gardenAccess,
          error: accessError.message
        })
      } else {
        auditLog('GARDEN_ACCESS_CREATED', {
          userId: authData.user.id,
          email: email.toLowerCase().trim(),
          role: role,
          gardenAccess: gardenAccess,
          count: gardenAccess.length
        })
      }
    }

    auditLog('CREATE_USER', { 
      email: email.toLowerCase().trim(), 
      role, 
      userId: authData.user.id,
      gardenAccessType: gardenAccess && gardenAccess.length > 0 
        ? `${role}_limited_access` 
        : role === 'admin' 
          ? 'super_admin_all_access' 
          : 'user_no_access'
    })

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email.toLowerCase().trim(),
        fullName: fullName,
        role: role,
        tempPassword: tempPassword,
        gardenAccessType: gardenAccess && gardenAccess.length > 0 
          ? `${role}_limited_access` 
          : role === 'admin' 
            ? 'super_admin_all_access' 
            : 'user_no_access'
      },
      message: 'User created successfully. Share temporary password securely.'
    })

  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user (password reset or edit user)
export async function PUT(request: NextRequest) {
  try {
    const { userId, action, fullName, role, gardenAccess } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    // Get user details
    const supabaseAdminGet = getSupabaseAdminClient()
    const { data: userData, error: userError } = await supabaseAdminGet
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'reset_password') {
      // Generate new secure password
      const newPassword = generateSecurePassword()

      // Update auth password
      const supabaseAdminReset = getSupabaseAdminClient()
      const { error: authError } = await supabaseAdminReset.auth.admin.updateUserById(userId, {
        password: newPassword,
        user_metadata: {
          temp_password: true,
          password_reset_by_admin: true
        }
      })

      if (authError) {

        return NextResponse.json(
          { error: `Password reset failed: ${authError.message}` },
          { status: 500 }
        )
      }

      // Update profile
      const supabaseAdminProfileReset = getSupabaseAdminClient()
      const { error: profileError } = await supabaseAdminProfileReset
        .from('users')
        .update({
          force_password_change: true,
          password_changed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {

        return NextResponse.json(
          { error: `Profile update failed: ${profileError.message}` },
          { status: 500 }
        )
      }

      auditLog('RESET_PASSWORD', { 
        email: userData.email, 
        userId: userId 
      })

      return NextResponse.json({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          newPassword: newPassword
        },
        message: 'Password reset successfully. Share new password securely.'
      })
    }

    if (action === 'edit_user') {
      // Validation for edit user
      if (!fullName) {
        return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
      }

      if (!['admin', 'user'].includes(role)) {
        return NextResponse.json({ error: 'Role must be admin or user' }, { status: 400 })
      }

      // Validate garden access for both users and admins
      if (gardenAccess && !Array.isArray(gardenAccess)) {
        return NextResponse.json({ error: 'Garden access must be an array' }, { status: 400 })
      }

      // Update user profile
      const supabaseAdminEdit = getSupabaseAdminClient()
      const { error: profileError } = await supabaseAdminEdit
        .from('users')
        .update({
          full_name: fullName,
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {

        return NextResponse.json(
          { error: `Profile update failed: ${profileError.message}` },
          { status: 500 }
        )
      }

      // 🏦 BANKING-GRADE: Update garden access for both users and admins
      // First, remove all existing garden access
      const supabaseAdminDelete = getSupabaseAdminClient()
      const { error: deleteError } = await supabaseAdminDelete
        .from('user_garden_access')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {

        // Don't fail the whole operation
      }

      // Then, add new garden access if provided (for both users and admins)
      if (gardenAccess && gardenAccess.length > 0) {
        const supabaseAdminInsert = getSupabaseAdminClient()
        const gardenAccessRecords = gardenAccess.map((gardenId: string) => ({
          user_id: userId,
          garden_id: gardenId,
          granted_by: 'admin',
          granted_at: new Date().toISOString()
        }))

        const { error: insertError } = await supabaseAdminInsert
          .from('user_garden_access')
          .insert(gardenAccessRecords)

        if (insertError) {

          // Don't fail the user update
          auditLog('GARDEN_ACCESS_UPDATE_FAILED', {
            userId: userId,
            email: userData.email,
            role: role,
            gardenAccess: gardenAccess,
            error: insertError.message
          })
        } else {
          auditLog('GARDEN_ACCESS_UPDATED', {
            userId: userId,
            email: userData.email,
            role: role,
            gardenAccess: gardenAccess,
            count: gardenAccess.length,
            accessType: gardenAccess.length > 0 
              ? `${role}_limited_access` 
              : `${role}_no_specific_access`
          })
        }
      } else {
        // No specific garden access - log the access type
        auditLog('GARDEN_ACCESS_CLEARED', {
          userId: userId,
          email: userData.email,
          role: role,
          accessType: role === 'admin' 
            ? 'super_admin_all_access' 
            : 'user_no_access'
        })
      }

      auditLog('EDIT_USER', {
        userId: userId,
        email: userData.email,
        changes: {
          fullName: fullName !== userData.full_name ? { from: userData.full_name, to: fullName } : null,
          role: role !== userData.role ? { from: userData.role, to: role } : null,
          gardenAccessCount: role === 'user' ? (gardenAccess?.length || 0) : 'admin_all_access'
        }
      })

      return NextResponse.json({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          fullName: fullName,
          role: role,
          gardenAccessCount: role === 'user' ? (gardenAccess?.length || 0) : 'all'
        },
        message: 'User updated successfully.'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Soft delete user
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user details
    const supabaseAdminGetDelete = getSupabaseAdminClient()
    const { data: userData, error: userError } = await supabaseAdminGetDelete
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete
    const supabaseAdminSoftDelete = getSupabaseAdminClient()
    const { error: deleteError } = await supabaseAdminSoftDelete
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (deleteError) {

      return NextResponse.json(
        { error: `Delete failed: ${deleteError.message}` },
        { status: 500 }
      )
    }

    auditLog('SOFT_DELETE_USER', { 
      email: userData.email, 
      userId: userId 
    })

    return NextResponse.json({
      success: true,
      message: 'User moved to trash. Can be restored if needed.'
    })

  } catch (error) {

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}