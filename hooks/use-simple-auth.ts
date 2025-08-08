'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

// Simple User interface
export interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'user'
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
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useSimpleAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Simple user profile loading - NO complex database queries
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    // For now, just use email-based role detection (SIMPLE)
    const isAdmin = supabaseUser.email?.includes('admin') || 
                   supabaseUser.email === 'amerik.rijn@gmail.com'
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: supabaseUser.email?.split('@')[0] || 'User',
      role: isAdmin ? 'admin' : 'user'
    }
  }

  // Initialize auth state - SIMPLE
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user)
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
        setState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      }
    }

    initializeAuth()

    // Listen for auth changes - SIMPLE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await loadUserProfile(session.user)
        setState({
          user: userProfile,
          session,
          loading: false,
          error: null
        })
      } else if (event === 'SIGNED_OUT') {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  const isAdmin = (): boolean => {
    return state.user?.role === 'admin' || false
  }

  return {
    ...state,
    signIn,
    signOut,
    isAdmin
  }
}

export const SimpleAuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(SimpleAuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider')
  }
  return context
}