'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
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

export function useSupabaseAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Load user profile with proper database lookup and timeout handling
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('🔍 START loadUserProfile for:', supabaseUser.email, 'ID:', supabaseUser.id)
    
    try {
      // Create timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database lookup timeout')), 3000)
      })

      // Database lookup with timeout
      const databasePromise = supabase
        .from('users')
        .select('id, email, full_name, role, status, created_at')
        .eq('email', supabaseUser.email)
        .single()

      console.log('🔍 Fetching user profile from database...')
      const { data: userProfile, error: userError } = await Promise.race([
        databasePromise,
        timeoutPromise
      ]) as { data: any, error: any }

      let role: 'admin' | 'user' = 'user'
      let fullName = supabaseUser.email?.split('@')[0] || 'User'
      let status: 'active' | 'inactive' | 'pending' = 'active'

      if (userError || !userProfile) {
        console.log('🔍 No database profile found:', userError?.message)
        throw new Error('Access denied: User not found in system. Contact admin to create your account.')
      } else {
        console.log('🔍 Found existing user profile:', userProfile)
        role = userProfile.role || 'user'
        fullName = userProfile.full_name || fullName
        status = userProfile.status || 'active'
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
      
      console.log('🔍 USER PROFILE LOADED:', user)
      console.log('🔍 User role:', user.role)
      return user

    } catch (error) {
      console.error('🔍 Error in loadUserProfile:', error)
      // Re-throw the error - no fallback, no exceptions
      throw error
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session?.user) {
          console.log('🔍 Initial session found for:', session.user.email)
          // Load full user profile (no database updates during init)
          const userProfile = await loadUserProfile(session.user)
          console.log('🔍 Initial profile loaded:', !!userProfile)

          // loadUserProfile now always returns a User object, never null
          setState({
            user: userProfile,
            session,
            loading: false,
            error: null
          })
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      }
    }

    initializeAuth()

    // Failsafe: Force loading to false after 10 seconds (increased from 5)
    const loadingTimeout = setTimeout(() => {
      console.log('🔍 LOADING TIMEOUT: Forcing loading to false')
      setState(prev => ({
        ...prev,
        loading: false,
        error: prev.user ? null : 'Loading timeout - please refresh page' // Don't show error if user is loaded
      }))
    }, 10000)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state change:', event, !!session)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔍 Auth state SIGNED_IN for:', session.user.email)
        // Only load profile if we don't already have it
        if (!state.user || state.user.id !== session.user.id) {
          console.log('🔍 Loading user profile for new/different user')
          const userProfile = await loadUserProfile(session.user)
          console.log('🔍 User profile loaded via state change:', !!userProfile)
          
          // loadUserProfile now always returns a User object, never null
          setState({
            user: userProfile,
            session,
            loading: false,
            error: null
          })
        } else {
          console.log('🔍 User already loaded, just updating session')
          setState(prev => ({
            ...prev,
            session,
            loading: false
          }))
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔍 User signed out')
        setState({
          user: null,
          session: null,
          loading: false,
          error: null
        })
      } else if (event === 'INITIAL_SESSION') {
        console.log('🔍 Initial session event (handled by initializeAuth)')
        // Skip - already handled by initializeAuth
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
      console.log('🔍 Attempting sign in with:', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('🔍 Auth response:', { data: !!data, error: error?.message })

      if (error) {
        console.error('🔍 Auth error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user returned from sign in')
      }

      console.log('🔍 User signed in:', data.user.email)
      
      // Check if user needs to change password (first login)
      if (data.user.user_metadata?.temp_password) {
        console.log('🔍 User has temp password, redirecting to change password')
        // Don't throw error, let the component handle the redirect
        return
      }
      
      // User profile will be loaded automatically by onAuthStateChange
    } catch (error) {
      console.error('🔍 Sign in failed:', error)
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
      const userProfile = await loadUserProfile(state.session.user)
      setState(prev => ({ ...prev, user: userProfile }))
    }
  }

  // Load garden access separately after login
  const loadGardenAccess = async (): Promise<void> => {
    if (!state.user || state.user.role === 'admin') return
    
    console.log('🔍 Loading garden access post-login for:', state.user.id)
    try {
      const { data: accessData, error: accessError } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', state.user.id)
      
      if (!accessError && accessData) {
        const gardenAccess = accessData.map(row => row.garden_id)
        console.log('🔍 Post-login garden access loaded:', gardenAccess)
        
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, garden_access: gardenAccess } : null
        }))
      }
    } catch (error) {
      console.log('🔍 Post-login garden access loading failed:', error)
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
    console.log('🔍 SECURITY: User garden access:', { 
      user: state.user.email, 
      role: state.user.role, 
      gardens: gardens 
    })
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