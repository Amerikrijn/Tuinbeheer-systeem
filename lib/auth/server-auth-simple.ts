/**
 * SIMPLE SERVER-SIDE AUTHENTICATION UTILITIES
 * Voor gebruik in API routes - zonder extra dependencies
 * Conform: DNB Good Practice, NCSC ICT-beveiligingsrichtlijnen
 */

import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'admin' | 'user'
  garden_access: string[]
}

export interface AuthResult {
  user: AuthenticatedUser | null
  error: string | null
}

export interface RequiredAuthResult {
  user: AuthenticatedUser
  error: null
}

/**
 * Get authenticated user from request headers
 * Use in API routes for authentication
 */
export async function getServerAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No valid authorization header' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    
    // Verify token with Supabase
    const { data: { user: supabaseUser }, error: tokenError } = await supabase.auth.getUser(token)
    
    if (tokenError || !supabaseUser) {
      return { user: null, error: 'Invalid or expired token' }
    }
    
    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, role, status')
      .eq('id', supabaseUser.id)
      .eq('status', 'active')
      .single()
    
    if (profileError || !userProfile) {
      return { user: null, error: 'User profile not found or inactive' }
    }
    
    // Get garden access for non-admin users
    let gardenAccess: string[] = []
    if (userProfile.role !== 'admin') {
      const { data: accessData } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', supabaseUser.id)
      
      gardenAccess = accessData?.map(row => row.garden_id) || []
    }
    
    return {
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: userProfile.role,
        garden_access: gardenAccess
      },
      error: null
    }
    
  } catch (error) {
    console.error('Server auth error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

/**
 * Require authentication for API route
 * Returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<RequiredAuthResult> {
  const auth = await getServerAuth(request)
  
  if (!auth.user) {
    throw new Error('Authentication required')
  }
  
  return {
    user: auth.user,
    error: null
  }
}

/**
 * Require admin role for API route
 * Returns 403 if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<RequiredAuthResult> {
  const auth = await requireAuth(request)
  
  if (auth.user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return auth
}

/**
 * Check if user has access to specific garden
 */
export function hasGardenAccess(user: AuthenticatedUser, gardenId: string): boolean {
  if (user.role === 'admin') return true
  return user.garden_access.includes(gardenId)
}

/**
 * Filter gardens based on user access
 */
export function filterGardensByAccess(user: AuthenticatedUser, gardenIds: string[]): string[] {
  if (user.role === 'admin') return gardenIds
  return gardenIds.filter(id => user.garden_access.includes(id))
}