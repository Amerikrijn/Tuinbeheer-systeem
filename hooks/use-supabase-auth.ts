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
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('🔍 Loading profile for user ID:', supabaseUser.id)
      
      // Get user profile from public.users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          user_permissions(permission),
          user_garden_access(garden_id)
        `)
        .eq('id', supabaseUser.id)
        .single()

      console.log('🔍 Profile query result:', { userProfile, profileError })

      if (profileError) {
        console.error('🔍 Profile error:', profileError)
        // If user doesn't exist in public.users, create a basic record
        if (profileError.code === 'PGRST116') {
          console.log('🔍 User not found in public.users, creating basic record...')
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email,
              role: 'user',
              status: 'active',
              created_at: new Date().toISOString()
            })
          
          if (insertError) {
            console.error('🔍 Error creating user record:', insertError)
            return null
          }
          
          // Return basic user profile
          return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'user',
            status: 'active',
            permissions: [],
            garden_access: [],
            created_at: new Date().toISOString()
          }
        }
        return null
      }

      if (!userProfile) {
        console.error('🔍 No user profile found for:', supabaseUser.id)
        return null
      }

      // Get role-based permissions
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role', userProfile.role)

      // Combine user-specific and role-based permissions
      const userPermissions = userProfile.user_permissions?.map((up: any) => up.permission) || []
      const basePermissions = rolePermissions?.map((rp: any) => rp.permission) || []
      const allPermissions = [...new Set([...userPermissions, ...basePermissions])]

      // Get garden access
      const gardenAccess = userProfile.user_garden_access?.map((uga: any) => uga.garden_id) || []

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
      return null
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
          // Load full user profile
          const userProfile = await loadUserProfile(session.user)
          if (userProfile) {
            // Update last_login
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id)
          }

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state change:', event, !!session)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔍 Loading user profile for:', session.user.email)
        const userProfile = await loadUserProfile(session.user)
        console.log('🔍 User profile loaded:', userProfile)
        
        setState({
          user: userProfile,
          session,
          loading: false,
          error: null
        })
      } else if (event === 'SIGNED_OUT') {
        console.log('🔍 User signed out')
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