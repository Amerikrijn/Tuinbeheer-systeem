'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { TreePine, Database, AlertCircle } from 'lucide-react'

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
  const [authError, setAuthError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Ensure component is mounted on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Try to get auth with error handling
  useEffect(() => {
    let auth
    try {
      auth = useAuth()
      setUser(auth.user)
      setLoading(auth.loading)
    } catch (error) {
      console.error('Auth hook failed:', error)
      setAuthError(error instanceof Error ? error.message : 'Authentication service unavailable')
      setLoading(false)
    }
  }, [])

  // Show database connection error if auth fails
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-600 dark:bg-red-700 rounded-full">
                <Database className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Database Verbinding Mislukt</h2>
            <p className="text-muted-foreground mb-6">
              De authenticatie service is momenteel niet beschikbaar. Dit kan komen door database verbindingsproblemen.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Probeer opnieuw
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/test-database')}
                className="w-full"
              >
                Test Database Verbinding
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/plants')}
                className="w-full"
              >
                Bekijk Demo Planten
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

      // 🏦 BANKING SECURITY: Access control check
      const hasAccess = user && user.status === 'active'
      
      if (!hasAccess) {
        router.push('/auth/login')
        return
      }

      // 🏦 NEW ARCHITECTURE: Password change is now handled by auth provider
      // No need for temp_password checks here - the auth provider will show
      // ForcePasswordChange component if needed based on force_password_change flag

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authenticatie controleren...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <TreePine className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Inloggen vereist</h2>
            <p className="text-muted-foreground mb-6">
              Je moet ingelogd zijn om deze pagina te bekijken.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Inloggen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Terug naar home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Laden...</p>
      </div>
    </div>
  )
})