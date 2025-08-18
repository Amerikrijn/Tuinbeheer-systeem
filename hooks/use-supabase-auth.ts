'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { clearStaleCache } from '@/lib/version'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

// Enhanced User interface with garden access and permissions
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'user'
  status: 'pending' | 'active' | 'inactive'
  permissions: string[]
  garden_access: string[] // Array of garden IDs this user can access
  created_at: string
  last_login?: string
  force_password_change?: boolean // Admin-set flag requiring password change
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  hasGardenAccess: (gardenId: string) => boolean
  getAccessibleGardens: () => string[]
  refreshUser: () => Promise<void>
  forceRefreshUser: () => Promise<void>
  loadGardenAccess: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Session cache to prevent redundant database calls
const SESSION_CACHE_KEY = 'tuinbeheer_user_profile'
const CACHE_DURATION = 30 * 1000 // 30 seconds - shorter for critical updates

// Helper function to get Supabase client
const getSupabase = () => {
  try {
    return getSupabaseClient()
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    throw new Error('Authentication service unavailable')
  }
}

interface CachedUserProfile {
  user: User
  timestamp: number
}

function getCachedUserProfile(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY)
    if (!cached) return null
    
    const { user, timestamp }: CachedUserProfile = JSON.parse(cached)
    const isExpired = Date.now() - timestamp > CACHE_DURATION
    
    if (isExpired) {
      localStorage.removeItem(SESSION_CACHE_KEY)
      return null
    }
    
    return user
  } catch {
    localStorage.removeItem(SESSION_CACHE_KEY)
    return null
  }
}

function setCachedUserProfile(user: User): void {
  if (typeof window === 'undefined') return
  
  try {
    const cached: CachedUserProfile = {
      user,
      timestamp: Date.now()
    }
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cached))
  } catch {
    // Ignore localStorage errors
  }
}

function clearCachedUserProfile(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SESSION_CACHE_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

export function useSupabaseAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Load user profile with caching and optimized database lookup
  const loadUserProfile = async (userId: string): Promise<User> => {
    try {
      console.log('🔍 DEBUG: loadUserProfile called for userId:', userId)
      
      const supabase = getSupabase()
      const supabaseUser = (await getSupabase().auth.getUser()).data.user
      
      if (!supabaseUser) {
        throw new Error('No authenticated user found')
      }

      // 🚀 PERFORMANCE: Optimized query - only select needed fields
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, role, status, created_at, force_password_change, is_active')
        .eq('id', userId)
        .eq('is_active', true) // Only active users
        .single()

      let role: string
      let fullName: string
      let status: string

      if (profileError || !userProfile) {
        console.log('🔍 DEBUG: User profile not found, creating new profile...')
        
        // 🆕 AUTO-CREATE USER PROFILE: If user doesn't exist in database, create them
        try {
          const newUserProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            full_name: supabaseUser.user_metadata?.full_name || 'New User',
            role: 'user', // Default role
            status: 'active', // Default status
            is_active: true, // Ensure active
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            force_password_change: false,
            email_verified: supabaseUser.email_confirmed_at ? true : false
          }

          console.log('🔍 DEBUG: Creating new user profile:', newUserProfile)
          
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert(newUserProfile)
            .select('id, email, full_name, role, status, created_at, force_password_change, is_active')
            .single()

          if (createError) {
            console.error('❌ ERROR: Failed to create user profile:', createError)
            throw new Error(`Failed to create user profile: ${createError.message}`)
          }

          console.log('✅ SUCCESS: User profile created successfully:', createdProfile)
          
          // Use the newly created profile
          role = createdProfile.role
          fullName = createdProfile.full_name
          status = createdProfile.status
          
        } catch (createException) {
          console.error('❌ ERROR: Exception during profile creation:', createException)
          // Fallback to basic user object if profile creation fails
          role = 'user'
          fullName = supabaseUser.user_metadata?.full_name || 'New User'
          status = 'active'
        }
      } else {
        console.log('🔍 DEBUG: Existing user profile found:', userProfile)
        role = userProfile.role || 'user'
        fullName = userProfile.full_name || fullName
        status = userProfile.status || 'active'
      }

      // 🏦 BANKING-GRADE USER OBJECT: Complete with all security fields
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: fullName,
        role: role,
        status: status,
        permissions: [],
        garden_access: [], // Load separately to avoid blocking login
        created_at: userProfile?.created_at || new Date().toISOString(),
        force_password_change: userProfile?.force_password_change || false // 🏦 BANKING REQUIREMENT
      }
      
      console.log('🔍 DEBUG: User object created successfully:', user)
      
      // Cache the user profile for faster subsequent loads
      setCachedUserProfile(user)
      
      return user

    } catch (error) {
      console.error('❌ ERROR: Error in loadUserProfile:', error)
      throw error
    }
  }

  // Initialize auth state with faster session recovery
  useEffect(() => {
    let isMounted = true
    let subscription: any = null
    // 🚫 REMOVED: Loading timeout variable - no longer needed

    const initializeAuth = async () => {
      try {
        // Try to get cached user first for instant loading
        const cachedUser = getCachedUserProfile()
        if (cachedUser && isMounted) {
          setState(prev => ({
            ...prev,
            user: cachedUser,
            loading: false
          }))
        }

        // Get current session with error handling
        let session
        try {
          const supabase = getSupabase();
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) {
            console.warn('Session error, continuing without session:', sessionError.message)
            session = null
          } else {
            session = data.session
          }
        } catch (error) {
          console.warn('Failed to get session, continuing without session:', error)
          session = null
        }

        if (session?.user && isMounted) {
          // If we have a cached user and it matches, just update session
          if (cachedUser && cachedUser.id === session.user.id) {
            setState(prev => ({
              ...prev,
              session,
              loading: false,
              error: null
            }))
          } else {
            // Load fresh profile if no cache or different user
            const userProfile = await loadUserProfile(session.user.id) // Don't use cache on init
            if (isMounted) {
              setState({
                user: userProfile,
                session,
                loading: false,
                error: null
              })
            }
          }
        } else if (isMounted) {
          // Clear cache if no session
          clearCachedUserProfile()
          setState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
        }
        
        // Ensure loading is always set to false
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false
          }))
        }
      } catch (error) {
        if (isMounted) {
          // Console logging removed for banking standards.error('Auth initialization error:', error)
          clearCachedUserProfile()
          setState({
            user: null,
            session: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication error'
          })
        }
        
        // Ensure loading is always set to false even on error
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false
          }))
        }
      }
    }

    initializeAuth()

    // 🚫 REMOVED: Loading timeout - causes false errors and poor UX
    // The auth flow will complete naturally without artificial timeouts

            // Listen for auth changes - ensure only one subscription
        try {
          const supabase = getSupabase();
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Only load profile if we don't already have it or it's a different user
          if (!state.user || state.user.id !== session.user.id) {
            const userProfile = await loadUserProfile(session.user.id)
            if (isMounted) {
              setState({
                user: userProfile,
                session,
                loading: false,
                error: null
              })
            }
          } else {
            // Just update session if user is the same
            if (isMounted) {
              setState(prev => ({
                ...prev,
                session,
                loading: false
              }))
            }
          }
        } else if (event === 'SIGNED_OUT' && isMounted) {
          clearCachedUserProfile()
          setState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
        }
      })
      
      subscription = authSubscription
    } catch (error) {
      console.error('Failed to set up auth subscription:', error)
    }

    return () => {
      isMounted = false
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          // Ignore unsubscribe errors
        }
      }
      // 🚫 REMOVED: Loading timeout cleanup - no longer needed
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log('🔍 DEBUG: Starting signIn process for email:', email)
    console.log('🔍 DEBUG: Current state before signIn:', state)
    
    const startTime = Date.now()
    setState(prev => ({ ...prev, loading: true, error: null }))
    console.log('🔍 DEBUG: State updated to loading: true')
    
    try {
      console.log('🔍 DEBUG: Getting Supabase client...')
      const supabase = getSupabase()
      console.log('🔍 DEBUG: Supabase client obtained successfully')
      
      console.log('🔍 DEBUG: Calling signInWithPassword...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const duration = Date.now() - startTime
      console.log('🔍 DEBUG: signInWithPassword completed in', duration, 'ms')
      console.log('🔍 DEBUG: Auth response:', { 
        hasData: !!data, 
        hasError: !!error,
        user: data?.user?.id,
        session: !!data?.session
      })
      
      if (error) {
        console.error('❌ ERROR: SignIn failed:', error)
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        return
      }

      if (!data.user) {
        console.error('❌ ERROR: No user data returned')
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No user data returned' 
        }))
        return
      }

      console.log('🔍 DEBUG: User authenticated successfully:', data.user.id)
      
      // 🚀 PERFORMANCE: Update state immediately with basic user info
      const basicUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        full_name: data.user.user_metadata?.full_name || 'User',
        role: 'user', // Will be updated after profile load
        status: 'active',
        permissions: [],
        garden_access: [],
        created_at: new Date().toISOString(),
        force_password_change: false
      }
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        user: basicUser,
        session: data.session
      }))
      
      console.log('🔍 DEBUG: Basic user state set, starting background profile load...')
      
      // 🚀 PERFORMANCE: Load profile and garden access in parallel (non-blocking)
      Promise.all([
        loadUserProfile(data.user.id),
        loadGardenAccess(data.user.id)
      ]).then(([userProfile, gardenAccess]) => {
        console.log('🔍 DEBUG: Background profile load completed')
        
        // Update state with complete user info
        setState(prev => ({
          ...prev,
          user: userProfile
        }))
      }).catch((error) => {
        console.error('❌ ERROR: Background profile load failed:', error)
        // Don't show error to user, basic login already succeeded
      })
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ ERROR: SignIn exception after', duration, 'ms:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }))
    }
  }

  const signOut = async (): Promise<void> => {
    console.log('🔍 DEBUG: Starting signOut process')
    
    // 🚀 PERFORMANCE: Update state immediately to remove spinner
    setState(prev => ({ 
      ...prev, 
      loading: false, // Remove loading state immediately
      user: null,
      session: null,
      error: null
    }))
    
    console.log('🔍 DEBUG: State cleared immediately, starting background cleanup...')
    
    try {
      // Clear cache immediately
      clearCachedUserProfile()
      
      // Start background cleanup (non-blocking)
      const supabase = getSupabase()
      
      // Sign out in background
      supabase.auth.signOut().then(() => {
        console.log('🔍 DEBUG: Background signOut completed')
      }).catch((error) => {
        console.error('❌ ERROR: Background signOut failed:', error)
        // Don't show error to user, state already cleared
      })
      
      console.log('🔍 DEBUG: SignOut process completed (non-blocking)')
      
    } catch (error) {
      console.error('❌ ERROR: SignOut error:', error)
      // State already cleared, no need to update again
    }
  }

  const signUp = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        throw error
      }

      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }))
      throw error
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Password reset failed')
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (state.session?.user) {
      const userProfile = await loadUserProfile(state.session.user.id) // Force fresh load
      setState(prev => ({ ...prev, user: userProfile }))
    }
  }

  // 🏦 NEW: Force refresh user profile (clears cache)
  const forceRefreshUser = async (): Promise<void> => {
    // Clear all cache including host tracking
    clearCachedUserProfile()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tuinbeheer_cached_host')
      // Console logging removed for banking standards.log('🔧 PRODUCTION: Cleared all user cache including host tracking')
    }
    
    if (state.session?.user) {
      const userProfile = await loadUserProfile(state.session.user.id) // Force fresh load
      setState(prev => ({ ...prev, user: userProfile }))
    }
  }

  // Load garden access separately after login
  const loadGardenAccess = async (userId: string): Promise<void> => {
    try {
      console.log('🔍 DEBUG: loadGardenAccess called for userId:', userId)
      
      const supabase = getSupabase()
      const { data: accessData, error: accessError } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', userId)
      
      if (accessError) {
        console.error('❌ ERROR: Failed to load garden access:', accessError)
        return
      }
      
      if (accessData) {
        const gardenAccess = accessData.map(row => row.garden_id)
        console.log('🔍 DEBUG: Garden access loaded:', gardenAccess)
        
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, garden_access: gardenAccess } : null
        }))
      } else {
        console.log('🔍 DEBUG: No garden access found for user')
      }
    } catch (error) {
      console.error('❌ ERROR: Garden access loading failed:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    if (state.user.role === 'admin') return true // Admin has all permissions
    return state.user.permissions.includes(permission)
  }

  const isAdmin = (): boolean => {
    return state.user?.role === 'admin' || false
  }

  const hasGardenAccess = (gardenId: string): boolean => {
    if (!state.user) return false
    if (state.user.role === 'admin') return true // Admin has access to all gardens
    return state.user.garden_access.includes(gardenId)
  }

  const getAccessibleGardens = (): string[] => {
    if (!state.user) {
      // Console logging removed for banking standards.warn('⚠️ SECURITY: getAccessibleGardens called without user')
      return []
    }
    if (state.user.role === 'admin') {
      return [] // Empty array means access to all for admin
    }
    
    const gardens = state.user.garden_access || []
    return gardens
  }

  return {
    ...state,
    signIn,
    signOut,
    signUp,
    resetPassword,
    hasPermission,
    isAdmin,
    hasGardenAccess,
    getAccessibleGardens,
    refreshUser,
    forceRefreshUser,
    loadGardenAccess
  }
}

export const SupabaseAuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
}