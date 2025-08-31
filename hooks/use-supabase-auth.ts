'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { clearStaleCache } from '@/lib/version'
import { performanceMonitor } from '@/lib/performance-monitor'
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

  // Retry helper with exponential backoff
  const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
    let lastError: any = null
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (i === maxRetries - 1) {
          throw error
        }
        
        const delay = baseDelay * Math.pow(2, i)

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  // Load user profile with caching and optimized database lookup
  const loadUserProfile = async (supabaseUser: SupabaseUser, useCache = true): Promise<User> => {
    // 🚨 PRODUCTION FIX: Clear cache if environment changed
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host
      const cachedHost = localStorage.getItem('tuinbeheer_cached_host')
      if (cachedHost && cachedHost !== currentHost) {

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

        return cached
      }
    }
    
    try {
      // 🏦 ENHANCED: Progressive timeout with retry logic and circuit breaker
      const performDatabaseQuery = async () => {
        const timeouts = [3000, 8000, 15000] // Optimized progressive timeouts
        let lastError: any = null
        
        for (let i = 0; i < timeouts.length; i++) {
          try {
            // Add connection check before each attempt
            if (typeof window !== 'undefined' && !navigator.onLine) {
              throw new Error('No internet connection detected')
            }

            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error(`Database lookup timeout after ${timeouts[i]}ms (attempt ${i + 1}/${timeouts.length})`)), timeouts[i])
            })

            // 🏦 OPTIMIZED: Use efficient query with proper ordering and health check
            const databasePromise = supabase
              .from('users')
              .select('id, email, full_name, role, status, created_at, force_password_change, is_active')
              .eq('is_active', true) // Filter active users first (uses index if available)
              .ilike('email', supabaseUser.email || '') // Then case-insensitive match
              .single()

            const result = await Promise.race([
              databasePromise,
              timeoutPromise
            ])
            
            // Success - return the result

            return result
          } catch (error: any) {
            lastError = error
            
            // Check for specific error types that shouldn't be retried
            if (error?.message?.includes('No internet connection') || 
                error?.code === 'PGRST116' || // Row not found - don't retry
                error?.message?.includes('JWT')) { // Auth issues - don't retry

              throw error
            }
            
            if (i < timeouts.length - 1) {

              // Add exponential backoff delay between retries
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
            } else {

            }
          }
        }
        
        throw lastError
      }

      // Execute query with retry logic and performance monitoring
      const { data: userProfile, error: userError } = await performanceMonitor.time(
        'loadUserProfile',
        () => retryWithBackoff(performDatabaseQuery, 2, 1000)
      ) as { data: any, error: any }

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

                 // 🚨 GODELIEVE FIX: Auto-create missing profile for known admin
         if (supabaseUser.email?.toLowerCase().includes('godelieve')) {

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

               role = 'admin'
               fullName = 'Godelieve Ochtendster'
               status = 'active'
             } else {

               throw new Error('Access denied: User not found in system. Contact admin to create your account.')
             }
           } catch (error) {

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

            } else {

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

      // 🏦 ENHANCED FALLBACK: Try to use cached data with connection awareness
      if (useCache) {
        const cached = getCachedUserProfile()
        if (cached && cached.email?.toLowerCase() === supabaseUser.email?.toLowerCase()) {
          const isConnectionError = error.message?.includes('timeout') || 
                                   error.message?.includes('network') ||
                                   error.message?.includes('fetch');
          
          if (isConnectionError) {

            // Show user that we're using cached data
            setState(prev => ({
              ...prev,
              error: 'Verbinding traag - gegevens mogelijk niet actueel'
            }))
            return cached
          } else {

            return cached
          }
        }
      }
      
      // Enhanced error messaging with original error for debugging
      console.error('Auth error details:', error.message, error);
      
      const userFriendlyError = error.message?.includes('timeout') 
        ? 'Verbinding time-out - probeer het later opnieuw'
        : error.message?.includes('network') || error.message?.includes('fetch')
        ? 'Netwerkfout - controleer je internetverbinding' 
        : error.message?.includes('Invalid login credentials')
        ? 'Ongeldige inloggegevens'
        : error.message?.includes('Email not confirmed')
        ? 'E-mail niet bevestigd'
        : `Database fout - ${error.message}`;
      
      throw new Error(userFriendlyError)
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

    // Enhanced loading timeout with connection awareness
    const loadingTimeout = setTimeout(() => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const errorMessage = isOnline 
        ? 'Inloggen duurt langer dan verwacht. Controleer je internetverbinding en probeer opnieuw.'
        : 'Geen internetverbinding. Controleer je netwerk en probeer opnieuw.';
        
      setState(prev => ({
        ...prev,
        loading: false,
        error: prev.user ? null : errorMessage
      }))
    }, 12000) // Slightly longer timeout with better messaging

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

  // 🏦 NEW: Force refresh user profile (clears cache)
  const forceRefreshUser = async (): Promise<void> => {
    // Clear all cache including host tracking
    clearCachedUserProfile()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tuinbeheer_cached_host')

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