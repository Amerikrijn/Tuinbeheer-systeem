'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { TreePine } from 'lucide-react'

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
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Ensure component is mounted on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Safety redirect: if still loading without user after 2s, go to login
  useEffect(() => {
    if (!mounted || redirecting || user) return
    const timer = setTimeout(() => {
      if (!user && !redirecting) {
        setRedirecting(true)
        router.replace('/auth/login')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [mounted, redirecting, user, router])

  useEffect(() => {
    if (!mounted) return

    // If not loading and no user, redirect to login once
    if (!loading && !user && !redirecting) {
      setRedirecting(true)
      router.replace('/auth/login')
      return
    }

    if (!loading && user) {
      // 🏦 BANKING SECURITY: Access control check
      const hasAccess = user && user.status === 'active'
      if (!hasAccess && !redirecting) {
        setRedirecting(true)
        router.replace('/auth/login')
        return
      }

      // Check admin requirement
      if (requireAdmin && user.role !== 'admin' && !redirecting) {
        setRedirecting(true)
        router.replace('/')
        return
      }

      // Check allowed roles
      if (allowedRoles && !allowedRoles.includes(user.role as 'admin' | 'user') && !redirecting) {
        setRedirecting(true)
        router.replace('/')
        return
      }

      setAuthChecked(true)
    }
  }, [user, loading, requireAdmin, allowedRoles, router, mounted, redirecting])

  // While mounting or redirecting, render minimal fallback (no infinite spinner)
  if (!mounted || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  if (loading && !user) {
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
                onClick={() => router.replace('/auth/login')}
                className="w-full"
              >
                Inloggen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.replace('/')}
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

  if (!authChecked) {
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