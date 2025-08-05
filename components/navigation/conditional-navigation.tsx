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

  // Hide navigation on auth pages
  if (AUTH_PAGES.includes(pathname)) {
    return null
  }

  // Hide navigation if no user and not loading
  if (!loading && !user) {
    return null
  }

  // Show navigation if user is logged in
  if (user) {
    return <Navigation />
  }

  // Default: no navigation
  return null
}