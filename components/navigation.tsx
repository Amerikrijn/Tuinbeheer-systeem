'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { TreePine, Home, BookOpen, ClipboardList, User, Menu, X, Trash2, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: string;
  description?: string;
}

export function BankingNavigation() {
  const pathname = usePathname();
  const { user, hasPermission, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = () => {
    return user?.role === 'admin';
  };
  
  const navItems: NavItem[] = [
    // Core user navigation
    { 
      href: '/tasks', 
      label: 'Taken', 
      icon: <ClipboardList className="h-4 w-4" />,
      description: 'Beheer je tuintaken'
    },
    { 
      href: '/logbook', 
      label: 'Logboek', 
      icon: <BookOpen className="h-4 w-4" />,
      description: 'Bekijk je tuinactiviteiten'
    },
    // Admin-only functions
    { 
      href: '/admin/users', 
      label: 'Gebruikers', 
      icon: <User className="h-4 w-4" />, 
      requiredPermission: 'admin',
      description: 'Beheer gebruikers en rechten'
    },
  ];
  
  // Filter items based on permissions
  const visibleItems = navItems.filter(item => {
    if (item.requiredPermission === 'admin') {
      return user?.role === 'admin';
    }
    return !item.requiredPermission || hasPermission?.(item.requiredPermission);
  });

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50 supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]" role="navigation" aria-label="Hoofdnavigatie">
      <div className="container mx-auto px-4 safe-area-px">
        <div className="flex justify-between items-center h-16 touch-pan-y">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-200 group">
            <div className="relative">
              <TreePine className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Tuinbeheer
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 relative group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Ga naar ${item.label}`}
                  title={item.description}
                >
                  <span aria-hidden="true" className="group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* User Info - Desktop */}
            {user && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {user.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  {isAdmin() && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* User Menu Dropdown - Desktop */}
            {user && (
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center gap-2 hover:bg-muted/80 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  <DropdownMenuItem asChild>
                    <Link href="/user-dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profiel</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin() && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Beheer</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Uitloggen</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ThemeToggle />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 hover:bg-muted/80 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="py-4 space-y-2">
              {/* User Info - Mobile */}
              {user && (
                <div className="px-4 py-3 border-b border-border mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {isAdmin() && (
                        <Badge variant="secondary" className="text-xs mt-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items - Mobile */}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                    role="menuitem"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="w-5 h-5">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* User Actions - Mobile */}
              {user && (
                <>
                  <div className="border-t border-border pt-4 mt-4">
                    <Link
                      href="/user-dashboard"
                      className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        <span>Profiel</span>
                      </div>
                    </Link>
                    
                    {isAdmin() && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5" />
                          <span>Beheer</span>
                        </div>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5" />
                        <span>Uitloggen</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Export as Navigation for backwards compatibility
export const Navigation = BankingNavigation;