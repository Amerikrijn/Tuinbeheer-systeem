'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useSupabaseAuth, SupabaseAuthContext } from '@/hooks/use-supabase-auth'
import { useActivityTimeout } from '@/hooks/use-activity-timeout'
import { ForcePasswordChange } from '@/components/auth/force-password-change'

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  // 🚨 TEMPORARY FIX: Disable auth for Cursor release issue
  // TODO: Re-enable after environment variables are properly configured
  return <>{children}</>
  
  // ORIGINAL CODE (commented out temporarily):
  /*
  const auth = useSupabaseAuth()
  const pathname = usePathname()
  
  // Initialize activity timeout for automatic logout
  useActivityTimeout()

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
      {children}
    </SupabaseAuthContext.Provider>
  )
  */
}