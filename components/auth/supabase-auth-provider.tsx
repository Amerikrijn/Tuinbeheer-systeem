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

  // Check if user needs to change password (banking security requirement)
  const needsPasswordChange = auth.user && auth.user.force_password_change === true
  const isAuthPage = pathname.startsWith('/auth/')
  
  // 🏦 BANKING SECURITY: Force password change is MANDATORY
  // User cannot access ANY page until password is changed
  if (needsPasswordChange && !isAuthPage) {
    console.log('🔒 SECURITY: Force password change required for user:', auth.user?.email)
    return (
      <SupabaseAuthContext.Provider value={auth}>
        <ForcePasswordChange />
      </SupabaseAuthContext.Provider>
    )
  }

  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}