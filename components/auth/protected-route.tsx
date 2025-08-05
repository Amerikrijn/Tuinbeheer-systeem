'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  allowedRoles?: ('admin' | 'user')[]
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // No user - redirect to login
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check admin requirement
      if (requireAdmin && user.role !== 'admin') {
        router.push('/user-dashboard')
        return
      }

      // Check allowed roles
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(user.role === 'admin' ? '/' : '/user-dashboard')
        return
      }

      // Check if user is active
      if (user.status !== 'active') {
        router.push('/auth/pending')
        return
      }
    }
  }, [user, loading, router, requireAdmin, allowedRoles])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Authenticatie controleren...</p>
        </div>
      </div>
    )
  }

  // Show loading if no user yet (redirect happening)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Doorverwijzen...</p>
        </div>
      </div>
    )
  }

  // Check role permissions
  if (requireAdmin && user.role !== 'admin') {
    return null // Redirect happening
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null // Redirect happening
  }

  // Check user status
  if (user.status !== 'active') {
    return null // Redirect happening
  }

  // All checks passed - render children
  return <>{children}</>
}