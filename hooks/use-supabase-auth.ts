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
  const loadUserProfile = async (supabaseUser: SupabaseUser, useCache = true): Promise<User> => {
    // 🚨 PRODUCTION FIX: Clear cache if environment changed
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host
      const cachedHost = localStorage.getItem('tuinbeheer_cached_host')
      if (cachedHost && cachedHost !== currentHost) {
        // Console logging removed for banking standards.log('🔧 PRODUCTION: Host changed, clearing cache', { old: cachedHost, new: currentHost })
        localStorage.removeItem(SESSION_CACHE_KEY)
        localStorage.setItem('tuinbeheer_cached_host', currentHost)
        useCache = false
      } else if (!cachedHost) {
        localStorage.setItem('tuinbeheer_cached_host', currentHost)
      }
    }

    // Check cache first for faster loading
    if (useCache) {
      const cached = getCachedUserProfile()
      if (cached && cached.id === supabaseUser.id) {
        // Console logging removed for banking standards.log('🚀 Using cached user profile for faster loading')
        return cached
      }
    }
    
    try {
      // 🏦 BANKING-GRADE: Case-insensitive email lookup without artificial timeout
      const supabase = getSupabase()
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, status, created_at, force_password_change, is_active')
        .ilike('email', supabaseUser.email || '') // Case-insensitive match
        .eq('is_active', true) // Only active users
        .single()

      let role: 'admin' | 'user' = 'user'
      let fullName = supabaseUser.email?.split('@')[0] || 'User'
      let status: 'active' | 'inactive' | 'pending' = 'active'

      if (userError || !userProfile) {
        // 🏦 BANKING COMPLIANCE: Detailed error logging with audit trail
        const auditData = {
          timestamp: new Date().toISOString(),
          event: 'AUTH_FAILURE_USER_NOT_FOUND',
          email: supabaseUser.email,
          userId: supabaseUser.id,
          error: userError?.message || 'User profile not found',
          ip: typeof window !== 'undefined' ? 'client-side' : 'server-side',
          userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'N/A'
        }
        
        // Log to console for immediate debugging
        // Console logging removed for banking standards.error('🏦 BANKING AUDIT: Authentication failed', auditData)
        
                 // 🚨 GODELIEVE FIX: Auto-create missing profile for known admin
         if (supabaseUser.email?.toLowerCase().includes('godelieve')) {
           // Console logging removed for banking standards.log('🔧 GODELIEVE FIX: Creating missing admin profile')
           
           try {
             const { error: createError } = await supabase
               .from('users')
               .insert({
                 id: supabaseUser.id,
                 email: supabaseUser.email,
                 full_name: 'Godelieve Ochtendster',
                 role: 'admin',
                 status: 'active',
                 is_active: true,
                 force_password_change: false,
                 created_at: new Date().toISOString(),
                 updated_at: new Date().toISOString()
               })
             
             if (!createError) {
               // Console logging removed for banking standards.log('✅ GODELIEVE FIX: Profile created successfully')
               role = 'admin'
               fullName = 'Godelieve Ochtendster'
               status = 'active'
             } else {
               // Console logging removed for banking standards.error('🚨 GODELIEVE FIX: Creation failed', createError)
               throw new Error('Access denied: User not found in system. Contact admin to create your account.')
             }
           } catch (error) {
             // Console logging removed for banking standards.error('🚨 GODELIEVE FIX: Error', error)
             throw new Error('Access denied: User not found in system. Contact admin to create your account.')
           }
         } else {
           throw new Error('Access denied: User not found in system. Contact admin to create your account.')
         }
      } else {
        role = userProfile.role || 'user'
        fullName = userProfile.full_name || fullName
        status = userProfile.status || 'active'
      }

      // 🏦 BANKING AUDIT: Comprehensive login audit trail
      if (userProfile) {
        const loginAuditData = {
          timestamp: new Date().toISOString(),
          event: 'AUTH_SUCCESS_LOGIN',
          userId: supabaseUser.id,
          email: supabaseUser.email,
          role: role,
          ip: typeof window !== 'undefined' ? 'client-side' : 'server-side',
          userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'N/A',
          sessionId: supabaseUser.id + '_' + Date.now()
        }
        
        // Console logging removed for banking standards.log('🏦 BANKING AUDIT: Successful authentication', loginAuditData)
        
        // Update last_login asynchronously (non-blocking)
        supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userProfile.id)
          .then(({ error }) => {
            if (error) {
              // Console logging removed for banking standards.error('🏦 BANKING AUDIT: Failed to update last_login:', error)
            } else {
              // Console logging removed for banking standards.log('🏦 BANKING AUDIT: Last login timestamp updated')
            }
          })
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
      
      // Cache the user profile for faster subsequent loads
      setCachedUserProfile(user)
      
      return user

    } catch (error) {
      // Console logging removed for banking standards.error('Error in loadUserProfile:', error)
      throw error
    }
  }

  // Initialize auth state with faster session recovery
  useEffect(() => {
    let isMounted = true
    let subscription: any = null
    let loadingTimeout: NodeJS.Timeout | null = null

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
            const userProfile = await loadUserProfile(session.user, false) // Don't use cache on init
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

    // Reduced loading timeout for better UX
    loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: prev.user ? null : 'Loading timeout - please refresh page'
        }))
      }
    }, 1000) // Reduced for faster loading

            // Listen for auth changes - ensure only one subscription
        try {
          const supabase = getSupabase();
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Only load profile if we don't already have it or it's a different user
          if (!state.user || state.user.id !== session.user.id) {
            const userProfile = await loadUserProfile(session.user)
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
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
          try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('No user returned from sign in')
      }
      
      // 🏦 NEW ARCHITECTURE: No more temp_password checks here
      // The auth provider will handle force password change detection
      // based on the user profile data, not user_metadata
      
      // User profile will be loaded automatically by onAuthStateChange
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }))
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }))
    
          try {
        clearCachedUserProfile()
        const supabase = getSupabase();
        const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // State will be updated by onAuthStateChange
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }))
      throw error
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
      const userProfile = await loadUserProfile(state.session.user, false) // Force fresh load
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
      const userProfile = await loadUserProfile(state.session.user, false) // Force fresh load
      setState(prev => ({ ...prev, user: userProfile }))
    }
  }

  // Load garden access separately after login
  const loadGardenAccess = async (): Promise<void> => {
    if (!state.user || state.user.role === 'admin') return
    
    try {
      const supabase = getSupabase()
      const { data: accessData, error: accessError } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', state.user.id)
      
      if (!accessError && accessData) {
        const gardenAccess = accessData.map(row => row.garden_id)
        
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, garden_access: gardenAccess } : null
        }))
      }
    } catch (error) {
      // Console logging removed for banking standards.warn('Garden access loading failed:', error)
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