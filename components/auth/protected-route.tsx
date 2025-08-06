'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

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

  // Ensure component is mounted on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add timeout to prevent infinite loading - but only when actually loading
  useEffect(() => {
    if (!loading && !user) {
      // Only set timeout if we're not loading and have no user
      const timeout = setTimeout(() => {
        console.log('🔍 ProtectedRoute timeout reached - forcing redirect to login')
        setTimeoutReached(true)
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }
  }, [loading, user])

  useEffect(() => {
    console.log('🔍 ProtectedRoute check:', { loading, hasUser: !!user, userRole: user?.role, userEmail: user?.email, timeoutReached })
    
    // Only run checks after component is mounted
    if (!mounted) return
    
    // If timeout reached, force redirect to login
    if (timeoutReached) {
      console.log('🔍 ProtectedRoute: Timeout reached, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    if (!loading) {
      // No user - redirect to login
      if (!user) {
        console.log('🔍 ProtectedRoute: No user, redirecting to login')
        router.push('/auth/login')
        return
      }

      // Check if user has temp password and needs to change it
      const checkTempPassword = async () => {
        try {
          const { data: { user: freshUser } } = await supabase.auth.getUser()
          if (freshUser?.user_metadata?.temp_password && router.pathname !== '/auth/change-password') {
            console.log('🔍 ProtectedRoute: User has temp_password, redirecting to change password page')
            router.push('/auth/change-password')
            return
          }
        } catch (error) {
          console.error('🔍 ProtectedRoute: Error checking temp password:', error)
        }
      }
      
      checkTempPassword()

      // Check user status
      if (user.status !== 'active') {
        console.log('🔍 ProtectedRoute: User not active, redirecting to login')
        router.push('/auth/login')
        return
      }

      // Check admin requirement
      if (requireAdmin && user.role !== 'admin') {
        console.log('🔍 ProtectedRoute: Admin required but user is not admin')
        router.push('/')
        return
      }

      // Check allowed roles
      if (allowedRoles && !allowedRoles.includes(user.role as 'admin' | 'user')) {
        console.log('🔍 ProtectedRoute: User role not in allowed roles')
        router.push('/')
        return
      }

      console.log('🔍 ProtectedRoute: All checks passed, rendering children')
    }
  }, [user, loading, requireAdmin, allowedRoles, router, timeoutReached, mounted])

  // Show loading during SSR or while mounting
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  // Don't render children until auth checks are complete
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