'use client'

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
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

  // Load user profile without doing DB writes; return minimal user if missing
  const loadUserProfile = async (userId: string): Promise<User> => {
    try {
      console.log('🔍 DEBUG: loadUserProfile called for userId:', userId)
      
      const supabase = getSupabase()
      const supabaseUser = (await getSupabase().auth.getUser()).data.user
      
      if (!supabaseUser) {
        throw new Error('No authenticated user found')
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, role, status, created_at, force_password_change, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      // Build user object without creating rows if profile is missing
      const role: 'admin' | 'user' = userProfile?.role === 'admin' ? 'admin' : 'user'
      const fullName = userProfile?.full_name ?? (supabaseUser.user_metadata?.full_name || 'User')
      const status: 'pending' | 'active' | 'inactive' = (userProfile?.status === 'pending' || userProfile?.status === 'inactive') ? (userProfile.status as 'pending' | 'inactive') : 'active'

      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: fullName,
        role,
        status,
        permissions: [],
        garden_access: [], // Load separately to avoid blocking login
        created_at: userProfile?.created_at || new Date().toISOString(),
        force_password_change: userProfile?.force_password_change || false
      }
      
      console.log('🔍 DEBUG: User object created successfully:', user)
      setCachedUserProfile(user)
      return user

    } catch (error) {
      console.error('❌ ERROR: Error in loadUserProfile:', error)
      // Fallback to minimal user from session if available
      try {
        const sessionUser = (await getSupabase().auth.getUser()).data.user
        if (sessionUser) {
          const fallback: User = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            full_name: sessionUser.user_metadata?.full_name || 'User',
            role: 'user',
            status: 'active',
            permissions: [],
            garden_access: [],
            created_at: new Date().toISOString(),
            force_password_change: false
          }
          setCachedUserProfile(fallback)
          return fallback
        }
      } catch {}
      throw error
    }
  }

  // Initialize auth state with faster session recovery
  useEffect(() => {
    let isMounted = true
    let subscription: any = null

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
        let session: Session | null = null
        try {
          const supabase = getSupabase();
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (!sessionError) {
            session = data.session
          }
        } catch (error) {
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
            // Load fresh profile in background; don't block UI
            setState(prev => ({ ...prev, session, loading: false }))
            void loadUserProfile(session.user.id).then(userProfile => {
              if (isMounted) {
                setState(prev => ({ ...prev, user: userProfile }))
              }
            }).catch(() => {/* ignore profile errors for UX */})
          }
        } else if (isMounted) {
          // Clear cache if no session
          clearCachedUserProfile()
          setState({ user: null, session: null, loading: false, error: null })
        }

        // Ensure loading is false
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        if (isMounted) {
          clearCachedUserProfile()
          setState({ user: null, session: null, loading: false, error: error instanceof Error ? error.message : 'Authentication error' })
        }
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes - ensure only one subscription
    try {
      const supabase = getSupabase();
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Load profile in background
          setState(prev => ({ ...prev, session, loading: false }))
          const userProfile = await loadUserProfile(session.user.id)
          if (isMounted) {
            setState(prev => ({ ...prev, user: userProfile, loading: false }))
          }
        } else if (event === 'SIGNED_OUT' && isMounted) {
          clearCachedUserProfile()
          setState({ user: null, session: null, loading: false, error: null })
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
        } catch {}
      }
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
      
      const normalizedEmail = email.trim().toLowerCase()

      const attempt = async (timeoutMs: number) => {
        const signInCall = supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        })
        const signInTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('LOGIN_TIMEOUT')), timeoutMs)
        })
        return await Promise.race([signInCall, signInTimeout]) as { data: any; error: any }
      }

      let data: any | null = null
      let error: any | null = null

      // Eerste poging met ruimere timeout
      try {
        const res = await attempt(25000)
        data = res.data; error = res.error
      } catch (e) {
        console.warn('⚠️ WARN: First signIn attempt failed:', e)
        // Tweede poging met nog iets ruimere timeout
        const res2 = await attempt(35000)
        data = res2.data; error = res2.error
      }
      
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
        setState(prev => ({ ...prev, loading: false, error: error.message || 'Login failed' }))
        return
      }

      if (!data?.user) {
        console.error('❌ ERROR: No user data returned')
        setState(prev => ({ ...prev, loading: false, error: 'No user data returned' }))
        return
      }

      console.log('🔍 DEBUG: User authenticated successfully:', data.user.id)
      
      // Update state immediately with basic user info and cache it
      const basicUser: User = {
        id: data.user.id,
        email: data.user.email || normalizedEmail,
        full_name: data.user.user_metadata?.full_name || 'User',
        role: 'user',
        status: 'active',
        permissions: [],
        garden_access: [],
        created_at: new Date().toISOString(),
        force_password_change: false
      }
      setCachedUserProfile(basicUser)
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        user: basicUser,
        session: data.session
      }))
      
      console.log('🔍 DEBUG: Basic user state set, starting background profile load...')
      
      // Load profile and garden access in background (non-blocking)
      Promise.all([
        loadUserProfile(data.user.id),
        (async () => { await loadGardenAccess() })()
      ]).then(([userProfile]) => {
        console.log('🔍 DEBUG: Background profile load completed')
        setCachedUserProfile(userProfile)
        setState(prev => ({ ...prev, user: userProfile }))
      }).catch((error) => {
        console.error('❌ ERROR: Background profile load failed:', error)
      })
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ ERROR: SignIn exception after', duration, 'ms:', error)
      const message = error instanceof Error ? (error.message === 'LOGIN_TIMEOUT' ? 'Login timeout. Probeer het later opnieuw.' : error.message) : 'An unexpected error occurred'
      setState(prev => ({ ...prev, loading: false, error: message }))
    }
  }

  const signOut = async (): Promise<void> => {
    console.log('🔍 DEBUG: Starting signOut process')
    
    // Update state immediately to remove spinner
    setState(prev => ({ ...prev, loading: false, user: null, session: null, error: null }))
    
    console.log('🔍 DEBUG: State cleared immediately, starting background cleanup...')
    
    try {
      clearCachedUserProfile()
      const supabase = getSupabase()
      await supabase.auth.signOut().catch(() => {})
      console.log('🔍 DEBUG: SignOut process completed (awaited)')
      
    } catch (error) {
      console.error('❌ ERROR: SignOut error:', error)
    }
  }

  const signUp = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Sign up failed' }))
      throw error
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      if (error) throw error
    } catch (error) {
      throw error instanceof Error ? error : new Error('Password reset failed')
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (state.session?.user) {
      const userProfile = await loadUserProfile(state.session.user.id)
      setState(prev => ({ ...prev, user: userProfile }))
    }
  }

  // Force refresh user profile (clears cache)
  const forceRefreshUser = async (): Promise<void> => {
    clearCachedUserProfile()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tuinbeheer_cached_host')
    }
    
    if (state.session?.user) {
      const userProfile = await loadUserProfile(state.session.user.id)
      setState(prev => ({ ...prev, user: userProfile }))
    }
  }

  // Load garden access separately after login
  const loadGardenAccess = async (): Promise<void> => {
    try {
      const currentUserId = state.session?.user?.id
      if (!currentUserId) return
      console.log('🔍 DEBUG: loadGardenAccess called for userId:', currentUserId)
      
      const supabase = getSupabase()
      const { data: accessData, error: accessError } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', currentUserId)
      
      if (accessError) {
        console.error('❌ ERROR: Failed to load garden access:', accessError)
        return
      }
      
      if (accessData) {
        const gardenAccess = accessData.map(row => row.garden_id)
        console.log('🔍 DEBUG: Garden access loaded:', gardenAccess)
        setState(prev => ({ ...prev, user: prev.user ? { ...prev.user, garden_access: gardenAccess } : null }))
      }
    } catch (error) {
      console.error('❌ ERROR: Garden access loading failed:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    if (state.user.role === 'admin') return true
    return state.user.permissions.includes(permission)
  }

  const isAdmin = (): boolean => {
    return state.user?.role === 'admin' || false
  }

  const hasGardenAccess = (gardenId: string): boolean => {
    if (!state.user) return false
    if (state.user.role === 'admin') return true
    return state.user.garden_access.includes(gardenId)
  }

  const getAccessibleGardens = (): string[] => {
    if (!state.user) return []
    if (state.user.role === 'admin') {
      return [] // Empty means all for admin
    }
    return state.user.garden_access || []
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

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth()
  return React.createElement(
    SupabaseAuthContext.Provider,
    { value: auth },
    children
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
}