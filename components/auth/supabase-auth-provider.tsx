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
          onPasswordChanged={() => {
            // The password change manager will handle the complete flow
            // including logout and redirect to login
            // No action needed here
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
}