'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

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
      // Security violation: Non-admin user attempted to access restricted page
      
      // Redirect to dashboard
      router.push('/')
    }
  }, [user, loading, isAdmin, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Toegang controleren...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Geen toegang</h2>
          <p className="text-muted-foreground mb-6">
            Je hebt geen toegang tot deze pagina. Neem contact op met een beheerder als je denkt dat dit een fout is.
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Terug naar dashboard
          </Button>
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