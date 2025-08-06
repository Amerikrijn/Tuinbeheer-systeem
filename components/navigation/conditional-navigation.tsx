'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { AuthNavigation } from '@/components/navigation/auth-nav'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Pages where navigation should be hidden
const AUTH_PAGES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/pending',
  '/auth/change-password'
]

function ConditionalNavigationComponent() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  console.log('🔍 ConditionalNavigation:', { 
    pathname, 
    isAuthPage: AUTH_PAGES.includes(pathname),
    loading, 
    hasUser: !!user,
    userRole: user?.role 
  })

  // Don't render until mounted
  if (!mounted) {
    return null
  }

  // Hide navigation on auth pages
  if (AUTH_PAGES.includes(pathname)) {
    console.log('🔍 Hiding navigation - auth page')
    return null
  }

  // Don't show navigation while loading auth
  if (loading) {
    console.log('🔍 Hiding navigation - loading auth')
    return null
  }

  // Show navigation for authenticated users
  if (user) {
    console.log('🔍 Showing navigation - authenticated user')
    return <AuthNavigation />
  }

  // No navigation for unauthenticated users
  console.log('🔍 No navigation - unauthenticated')
  return null
}

// Export with dynamic import and SSR disabled
export const ConditionalNavigation = dynamic(() => Promise.resolve(ConditionalNavigationComponent), {
  ssr: false,
  loading: () => null
})