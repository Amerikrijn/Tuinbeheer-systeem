'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
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
  loadGardenAccess: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Session cache to prevent redundant database calls
const SESSION_CACHE_KEY = 'tuinbeheer_user_profile'
const CACHE_DURATION = 30 * 1000 // 30 seconds - shorter for critical updates

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
    // Check cache first for faster loading
    if (useCache) {
      const cached = getCachedUserProfile()
      if (cached && cached.id === supabaseUser.id) {
        console.log('🚀 Using cached user profile for faster loading')
        return cached
      }
    }
    
    try {
      // Reduced timeout for better UX
      // Database lookup with proper timeout handling
      let userProfile = null
      let userError = null
      
      try {
        const result = await Promise.race([
          supabase
            .from('users')
            .select('id, email, full_name, role, status, created_at')
            .eq('email', supabaseUser.email)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database lookup timeout')), 2000)
          )
        ]) as { data: any; error: any }
        
        userProfile = result.data
        userError = result.error
      } catch (timeoutError) {
        userError = timeoutError
      }

      let role: 'admin' | 'user' = 'user'
      let fullName = supabaseUser.email?.split('@')[0] || 'User'
      let status: 'active' | 'inactive' | 'pending' = 'active'

      if (userError || !userProfile) {
        // 🚨 EMERGENCY ADMIN ACCESS - Allow amerik.rijn@gmail.com to login as admin
        if (supabaseUser.email?.toLowerCase() === 'amerik.rijn@gmail.com') {
          role = 'admin'
          fullName = 'Amerik (Emergency Admin)'
          status = 'active'
        } else {
          throw new Error('Access denied: User not found in system. Contact admin to create your account.')
        }
      } else {
        role = userProfile.role || 'user'
        fullName = userProfile.full_name || fullName
        status = userProfile.status || 'active'
      }

      // Update last_login asynchronously (non-blocking)
      if (userProfile) {
        supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userProfile.id)
          .then(({ error }) => {
            if (error) {
              console.warn('Last login update failed (non-critical):', error.message)
            }
          })
      }

      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: fullName,
        role: role,
        status: status,
        permissions: [],
        garden_access: [], // Load separately to avoid blocking login
        created_at: userProfile?.created_at || new Date().toISOString()
      }
      
      // Cache the user profile for faster subsequent loads
      setCachedUserProfile(user)
      
      return user

    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      throw error
    }
  }

  // Initialize auth state with faster session recovery
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get cached user first for instant loading
        const cachedUser = getCachedUserProfile()
        if (cachedUser) {
          setState(prev => ({
            ...prev,
            user: cachedUser,
            loading: false
          }))
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session?.user) {
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
            setState({
              user: userProfile,
              session,
              loading: false,
              error: null
            })
          }
        } else {
          // Clear cache if no session
          clearCachedUserProfile()
          setState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearCachedUserProfile()
        setState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      }
    }

    initializeAuth()

    // Reduced loading timeout for better UX
    const loadingTimeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        loading: false,
        error: prev.user ? null : 'Loading timeout - please refresh page'
      }))
    }, 8000) // Reduced from 10000ms

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Only load profile if we don't already have it or it's a different user
        if (!state.user || state.user.id !== session.user.id) {
          const userProfile = await loadUserProfile(session.user)
          setState({
            user: userProfile,
            session,
            loading: false,
            error: null
          })
        } else {
          // Just update session if user is the same
          setState(prev => ({
            ...prev,
            session,
            loading: false
          }))
        }
      } else if (event === 'SIGNED_OUT') {
        clearCachedUserProfile()
        setState({
          user: null,
          session: null,
          loading: false,
          error: null
        })
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
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
      
      // Check if user needs to change password (first login)
      if (data.user.user_metadata?.temp_password) {
        return // Let the component handle the redirect
      }
      
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

  // Load garden access separately after login
  const loadGardenAccess = async (): Promise<void> => {
    if (!state.user || state.user.role === 'admin') return
    
    try {
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
      console.warn('Garden access loading failed:', error)
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
      console.warn('⚠️ SECURITY: getAccessibleGardens called without user')
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