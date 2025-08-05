'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { Navigation } from '@/components/navigation'

// Pages where navigation should be hidden
const AUTH_PAGES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/pending'
]

export function ConditionalNavigation() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  console.log('🔍 ConditionalNavigation:', { 
    pathname, 
    isAuthPage: AUTH_PAGES.includes(pathname),
    loading, 
    hasUser: !!user,
    userRole: user?.role 
  })

  // Hide navigation on auth pages
  if (AUTH_PAGES.includes(pathname)) {
    console.log('🔍 Hiding navigation - auth page')
    return null
  }

  // Hide navigation if no user and not loading
  if (!loading && !user) {
    console.log('🔍 Hiding navigation - no user')
    return null
  }

  // Show navigation if user is logged in
  if (user) {
    console.log('🔍 Showing navigation - user logged in')
    return <Navigation />
  }

  // Default: no navigation
  console.log('🔍 Hiding navigation - default')
  return null
}