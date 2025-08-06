'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { 
  TreePine,
  User,
  Settings,
  LogOut,
  Shield,
  Users,
  Home,
  Leaf,
  ClipboardList,
  BookOpen,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { cn } from '@/lib/utils'

export function AuthNavigation() {
  const { user, signOut, hasPermission, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (email) {
      return email.split('@')[0].slice(0, 2).toUpperCase()
    }
    return '??'
  }

  // No navigation menu needed - just logo and user dropdown

  // If user is not logged in, show minimal nav
  if (!user) {
    return (
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
                <TreePine className="w-5 h-5 text-white" />
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

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Tuinbeheer</span>
          </Link>

          {/* Main Navigation - Desktop - ONLY FOR ADMINS */}
          {isAdmin() && (
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Link href="/tasks" className="flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4" />
                  <span>Taken</span>
                </Link>
              </Button>

              <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Link href="/logbook" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Logboek</span>
                </Link>
              </Button>

              <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Link href="/admin/users" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Gebruikers</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Menu <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Mobile Navigation - ONLY FOR ADMINS */}
                {isAdmin() && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/tasks" className="flex items-center space-x-2">
                        <ClipboardList className="w-4 h-4" />
                        <span>Taken</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/logbook" className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Logboek</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Gebruikers</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Uitloggen</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Spacer to push user menu to the right */}
          <div className="flex-1"></div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Logout Button */}
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Uitloggen</span>
            </Button>

            {/* User Dropdown - hele sectie als trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 h-auto px-3 py-2 rounded-md hover:bg-accent">
                  {/* User Status Badge */}
                  <div className="hidden sm:flex items-center">
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Administrator
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          Gebruiker
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(user.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="w-56 mt-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.full_name || 'Gebruiker'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Admin-only menu items */}
                {isAdmin() && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/gardens" className="flex items-center space-x-2">
                        <TreePine className="w-4 h-4" />
                        <span>Tuinen Beheer</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profiel</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Instellingen</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2 text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Uitloggen</span>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}