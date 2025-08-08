/**
 * SERVER-SIDE AUTHENTICATION UTILITIES
 * Voor gebruik in API routes en server components
 * Conform: DNB Good Practice, NCSC ICT-beveiligingsrichtlijnen
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
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

/**
 * Get authenticated user from server-side request
 * Use in API routes for authentication
 */
export async function getServerAuth(request?: NextRequest): Promise<AuthResult> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get session from cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return { user: null, error: 'Not authenticated' }
    }
    
    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, role, status')
      .eq('id', session.user.id)
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
        .eq('user_id', session.user.id)
      
      gardenAccess = accessData?.map(row => row.garden_id) || []
    }
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
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
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const auth = await getServerAuth(request)
  
  if (!auth.user) {
    throw new Error('Authentication required')
  }
  
  return auth
}

/**
 * Require admin role for API route
 * Returns 403 if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(request)
  
  if (auth.user?.role !== 'admin') {
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