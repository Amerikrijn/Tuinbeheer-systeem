'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { uiLogger } from '@/lib/logger'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  allowedRoles?: ('admin' | 'user')[]
}

function ProtectedRouteComponent({ 
  children, 
  requireAdmin = false, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Ensure component is mounted on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reduced timeout for better UX
  useEffect(() => {
    if (!loading && !user && mounted) {
      const timeout = setTimeout(() => {
        setTimeoutReached(true)
      }, 5000) // Reduced from 10000ms

      return () => clearTimeout(timeout)
    }
  }, [loading, user, mounted])

  useEffect(() => {
    // Only run checks after component is mounted
    if (!mounted) return
    
    // If timeout reached, force redirect to login
    if (timeoutReached) {
      router.push('/auth/login')
      return
    }
    
    if (!loading) {
      // No user - redirect to login
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user has temp password and needs to change it
      const checkTempPassword = async () => {
        try {
          const { data: { user: freshUser } } = await supabase.auth.getUser()
          if (freshUser?.user_metadata?.temp_password && window.location.pathname !== '/auth/change-password') {
            router.push('/auth/change-password')
            return
          }
        } catch (error) {
          // Banking-grade error logging without exposing sensitive data
          uiLogger.error('Error checking temp password', error as Error, { userId: user?.id })
        }
      }
      
      checkTempPassword()

      // Check user status
      if (user.status !== 'active') {
        router.push('/auth/login')
        return
      }

      // Check admin requirement
      if (requireAdmin && user.role !== 'admin') {
        router.push('/')
        return
      }

      // Check allowed roles
      if (allowedRoles && !allowedRoles.includes(user.role as 'admin' | 'user')) {
        router.push('/')
        return
      }

      setAuthChecked(true)
    }
  }, [user, loading, requireAdmin, allowedRoles, router, timeoutReached, mounted])

  // Show loading during SSR, mounting, or auth loading (but only briefly)
  if (!mounted || (loading && !user) || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  // Don't render children until all auth checks pass
  if (!user || (requireAdmin && user.role !== 'admin') || 
      (allowedRoles && !allowedRoles.includes(user.role as 'admin' | 'user'))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Export with dynamic import and SSR disabled
export const ProtectedRoute = dynamic(() => Promise.resolve(ProtectedRouteComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-gray-600">Laden...</p>
      </div>
    </div>
  )
})