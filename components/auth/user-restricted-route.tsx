'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { AlertTriangle } from 'lucide-react'

interface UserRestrictedRouteProps {
  children: React.ReactNode
}

/**
 * SECURITY COMPONENT: Blocks non-admin users from accessing restricted pages
 * This prevents users from accessing tasks overview, logbook overview, etc.
 */
export function UserRestrictedRoute({ children }: UserRestrictedRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !isAdmin()) {
      console.error('🚨 SECURITY VIOLATION: Non-admin user attempted to access restricted page:', {
        user: user.email,
        role: user.role,
        path: window.location.pathname
      })
      
      // Redirect to dashboard
      router.push('/')
    }
  }, [user, loading, isAdmin, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Toegang controleren...</p>
        </div>
      </div>
    )
  }

  // Block non-admin users
  if (user && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Toegang Geweigerd
          </h1>
          <p className="text-gray-600 mb-6">
            Je hebt geen toegang tot deze pagina. Alleen beheerders kunnen deze functionaliteit gebruiken.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Terug naar Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Allow admin users
  if (user && isAdmin()) {
    return <>{children}</>
  }

  // Redirect to login if no user
  if (!user) {
    router.push('/auth/login')
    return null
  }

  return null
}