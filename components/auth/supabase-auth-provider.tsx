'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useSupabaseAuth, SupabaseAuthContext } from '@/hooks/use-supabase-auth'
import { useActivityTimeout } from '@/hooks/use-activity-timeout'
import { ForcePasswordChange } from '@/components/auth/force-password-change'

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

// Mounts the activity timeout logic within the auth context
function ActivityTimeoutMount() {
  useActivityTimeout()
  return null
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [authError, setAuthError] = React.useState<Error | null>(null)
  
  let auth
  try {
    auth = useSupabaseAuth()
  } catch (error) {
    if (error instanceof Error) {
      setAuthError(error)
    }
    // Return children without auth if there's an error
    return <>{children}</>
  }
  
  const pathname = usePathname()
  
  // If there's an auth error, just render children without auth
  if (authError) {
    return <>{children}</>
  }

  // 🏦 BANKING SECURITY: Check if user needs password change
  // More robust check to prevent infinite loops
  const needsPasswordChange = React.useMemo(() => {
    // Only check if we have a user and they're authenticated
    if (!auth.user || !auth.session) return false
    
    // Check the force_password_change flag
    return auth.user.force_password_change === true
  }, [auth.user, auth.session])

  const isAuthPage = pathname.startsWith('/auth/')
  const isPasswordChangePage = pathname === '/auth/force-password-change'
  
  // 🏦 BANKING SECURITY: Force password change is MANDATORY
  // User cannot access ANY page until password is changed
  // But avoid showing on auth pages or if already on password change page
  if (needsPasswordChange && !isAuthPage && !isPasswordChangePage) {
    return (
      <SupabaseAuthContext.Provider value={auth}>
        <ActivityTimeoutMount />
        <ForcePasswordChange 
          user={auth.user} 
          onPasswordChanged={async () => {
            // 🏦 NEW: After password change, force refresh user profile
            // This should update the auth.user object and remove force_password_change flag
            // Console logging removed for banking standards.log('🏦 Password change completed, refreshing auth state...')
            await auth.forceRefreshUser()
          }} 
        />
      </SupabaseAuthContext.Provider>
    )
  }

  return (
    <SupabaseAuthContext.Provider value={auth}>
      <ActivityTimeoutMount />
      {children}
    </SupabaseAuthContext.Provider>
  )
}