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
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useSupabaseAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Load user profile with permissions and garden access
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('🔍 START loadUserProfile for:', supabaseUser.email, 'ID:', supabaseUser.id)
    
    // IMMEDIATE FALLBACK: Just create user from auth data, skip database entirely for now
    const createFallbackUser = (role: 'admin' | 'user' = 'user'): User => {
      console.log('🔍 Creating fallback user with role:', role)
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: supabaseUser.email?.split('@')[0] || 'User',
        role: role,
        status: 'active',
        permissions: [],
        garden_access: [],
        created_at: new Date().toISOString()
      }
    }

    // Check if admin
    if (supabaseUser.email === 'admin@tuinbeheer.nl') {
      console.log('🔍 ADMIN USER: Returning admin fallback')
      return createFallbackUser('admin')
    }

    try {

      // Try fast database lookup first
      console.log('🔍 Fast database lookup for:', supabaseUser.email)
      
      // Simplified: Get user profile from public.users table with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      // Add 3 second timeout to prevent infinite waits
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 3000)
      )

      let userProfile = null
      let profileError = null

      try {
        const result = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as { data: any, error: any }
        userProfile = result.data
        profileError = result.error
      } catch (error) {
        console.log('🔍 Profile loading timed out or failed:', error)
        profileError = { code: 'TIMEOUT', message: 'Profile loading timeout' }
      }

      console.log('🔍 Profile query result:', { 
        hasData: !!userProfile, 
        errorCode: profileError?.code, 
        errorMessage: profileError?.message 
      })

      if (profileError || !userProfile) {
        console.log('🔍 Profile loading failed or no data, using UNIVERSAL FALLBACK')
        console.log('🔍 Error details:', profileError)
        
        // Universal fallback - try to get some garden access data
        console.log('🔍 UNIVERSAL FALLBACK: Trying to load garden access...')
        
        let gardenAccess: string[] = []
        try {
          const { data: accessData } = await supabase
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', supabaseUser.id)
          
          gardenAccess = accessData?.map(a => a.garden_id) || []
          console.log('🔍 Loaded garden access for fallback:', gardenAccess)
        } catch (accessError) {
          console.log('🔍 Could not load garden access, using empty array')
        }

        const basicProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          full_name: supabaseUser.email?.split('@')[0] || 'User',
          role: supabaseUser.email === 'admin@tuinbeheer.nl' ? 'admin' : 'user',
          status: 'active', // Assume active if they can authenticate
          permissions: [],
          garden_access: gardenAccess,
          created_at: new Date().toISOString()
        }
        
        console.log('🔍 UNIVERSAL FALLBACK profile:', basicProfile)
        return basicProfile as any
      }

      // Simplified: Just use basic permissions for now
      const allPermissions: string[] = []
      const gardenAccess: string[] = []

      return {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        avatar_url: userProfile.avatar_url,
        role: userProfile.role,
        status: userProfile.status,
        permissions: allPermissions,
        garden_access: gardenAccess,
        created_at: userProfile.created_at,
        last_login: userProfile.last_login
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      
      // FINAL FALLBACK: Even if everything fails, don't return null
      console.log('🔍 FINAL FALLBACK: Creating emergency user for:', supabaseUser.email)
      
      // Try one last garden access lookup
      let emergencyGardenAccess: string[] = []
      try {
        const { data } = await supabase
          .from('user_garden_access')
          .select('garden_id')
          .eq('user_id', supabaseUser.id)
        emergencyGardenAccess = data?.map(a => a.garden_id) || []
      } catch {
        // Ignore errors in final fallback
      }
      
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: supabaseUser.email?.split('@')[0] || 'User',
        role: supabaseUser.email === 'admin@tuinbeheer.nl' ? 'admin' : 'user',
        status: 'active',
        permissions: [],
        garden_access: emergencyGardenAccess,
        created_at: new Date().toISOString()
      }
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

          // CRITICAL: Never set user to null, always ensure we have a valid user object
          if (userProfile) {
            setState({
              user: userProfile,
              session,
              loading: false,
              error: null
            })
          } else {
            console.error('🔍 CRITICAL: Initial profile loading returned null!')
            // Emergency fallback for initial session
            const emergencyUser = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.email?.split('@')[0] || 'User',
              role: session.user.email === 'admin@tuinbeheer.nl' ? 'admin' : 'user',
              status: 'active',
              permissions: [],
              garden_access: [],
              created_at: new Date().toISOString()
            } as User
            
            setState({
              user: emergencyUser,
              session,
              loading: false,
              error: 'Initial profile loading failed - using emergency fallback'
            })
          }
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

    // Failsafe: Force loading to false after 5 seconds
    const loadingTimeout = setTimeout(() => {
      console.log('🔍 LOADING TIMEOUT: Forcing loading to false')
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Loading timeout - please refresh page'
      }))
    }, 5000)

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
          
          // CRITICAL: Never set user to null, always ensure we have a valid user object
          if (userProfile) {
            setState({
              user: userProfile,
              session,
              loading: false,
              error: null
            })
          } else {
            console.error('🔍 CRITICAL: Profile loading returned null, this should never happen!')
            // Emergency fallback - create minimal user to prevent redirect loop
            const emergencyUser = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.email?.split('@')[0] || 'User',
              role: session.user.email === 'admin@tuinbeheer.nl' ? 'admin' : 'user',
              status: 'active',
              permissions: [],
              garden_access: [],
              created_at: new Date().toISOString()
            } as User
            
            setState({
              user: emergencyUser,
              session,
              loading: false,
              error: 'Profile loading failed - using emergency fallback'
            })
          }
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
    if (!state.user) return []
    if (state.user.role === 'admin') return [] // Empty array means access to all
    return state.user.garden_access
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
    refreshUser
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