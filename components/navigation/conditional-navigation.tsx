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
  // 🚨 TEMPORARY FIX: Always show navigation for Cursor release issue
  // TODO: Re-enable authentication after environment variables are properly configured
  return <AuthNavigation />
  
  // ORIGINAL CODE (commented out temporarily):
  /*
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted
  if (!mounted) {
    return null
  }

  // Hide navigation on auth pages
  if (AUTH_PAGES.includes(pathname)) {
    return null
  }

  // Show navigation immediately if user is available (from cache)
  // Don't wait for loading to complete if we have a user
  if (user) {
    return <AuthNavigation />
  }

  // Only show loading state if we're actually loading and don't have a user
  if (loading && !user) {
    return null // Don't show loading spinner in navigation
  }

  // No navigation for unauthenticated users
  return null
  */
}

// Export with dynamic import and SSR disabled
export const ConditionalNavigation = dynamic(() => Promise.resolve(ConditionalNavigationComponent), {
  ssr: false,
  loading: () => null
})