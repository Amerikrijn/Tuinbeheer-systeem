'use client'

import React from 'react'
import { useSimpleAuth, SimpleAuthContext } from '@/hooks/use-simple-auth'

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const auth = useSimpleAuth()

  return (
    <SimpleAuthContext.Provider value={auth}>
      {children}
    </SimpleAuthContext.Provider>
  )
}