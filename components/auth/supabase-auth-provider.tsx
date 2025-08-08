'use client'

import React from 'react'
import { useSupabaseAuth, SupabaseAuthContext } from '@/hooks/use-supabase-auth'
import { useActivityTimeout } from '@/hooks/use-activity-timeout'

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const auth = useSupabaseAuth()
  
  // TEMPORARILY DISABLED: Activity timeout causing infinite loops
  // useActivityTimeout()

  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}