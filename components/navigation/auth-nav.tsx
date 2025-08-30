'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TreePine, User, LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { BankingNavigation } from '@/components/navigation'

export function AuthNavigation() {
  const { user, signOut, isAdmin } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {

    }
  }

  // If user is not logged in, show minimal nav
  if (!user) {
    return (
      <nav className="border-b bg-background" role="navigation" aria-label="Unauthenticated navigation">
        <div className="container mx-auto px-4 safe-area-px">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 dark:bg-green-700 rounded-full">
                <TreePine className="w-5 h-5 text-white dark:text-black" aria-hidden="true" />
              </div>
              <span className="font-semibold text-lg">Tuinbeheer</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/auth/login">Inloggen</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Use Banking Navigation for authenticated users
  return (
    <div>
      <BankingNavigation />
      
      {/* User Status Bar - Banking Addition */}
      <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800 py-2">
        <div className="container mx-auto px-4 safe-area-px">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                {user.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
                    Administrator
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 mr-1" aria-hidden="true" />
                    Gebruiker
                  </>
                )}
              </Badge>
              <span className="text-muted-foreground">
                Welkom, {user.full_name || user.email}
              </span>
            </div>
            
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2 text-destructive border-destructive hover:bg-destructive/10 hover:border-destructive focus:ring-destructive"
              aria-label="Uitloggen uit het systeem"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Uitloggen</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}