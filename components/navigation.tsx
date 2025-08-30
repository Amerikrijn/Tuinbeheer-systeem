'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { TreePine, Home, BookOpen, ClipboardList, User, Menu, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: string;
}

export function BankingNavigation() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = () => {
    return user?.role === 'admin';
  };
  
  const navItems: NavItem[] = [
    // Core user navigation
    { href: '/tasks', label: 'Taken', icon: <ClipboardList className="h-4 w-4" /> },
    { href: '/logbook', label: 'Logboek', icon: <BookOpen className="h-4 w-4" /> },
    // Admin-only functions
    { href: '/admin/users', label: 'Gebruikers', icon: <User className="h-4 w-4" />, requiredPermission: 'admin' },
  ];
  
  // Filter items based on permissions
  const visibleItems = navItems.filter(item => {
    // For admin items, use direct role check (more reliable than hasPermission)
    if (item.requiredPermission === 'admin') {
      return user?.role === 'admin';
    }
    
    return !item.requiredPermission || hasPermission?.(item.requiredPermission);
  });
  
  return (
    <nav className="bg-background/95 backdrop-blur-md border-b-2 border-green-200 dark:border-green-800 sticky top-0 z-50 supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]" role="navigation" aria-label="Hoofdnavigatie">
      <div className="container mx-auto px-4 safe-area-px">
        <div className="flex justify-between items-center h-16 touch-pan-y">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors group">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
              <TreePine className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-green-800 dark:text-green-300">Tuinbeheer</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
                      : "text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Ga naar ${item.label}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Compact User Menu & Theme Toggle */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <User className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
                  <span className="text-xs text-green-800 dark:text-green-300 font-medium">
                    {user.full_name || user.email}
                  </span>
                </div>
              </div>
            )}
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 active:scale-[0.98] transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu openen"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-green-700 dark:text-green-400" /> : <Menu className="h-4 w-4 text-green-700 dark:text-green-400" />}
            </Button>
          </div>
        </div>
        
        {/* Compact Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-200 dark:border-green-800 bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1" role="menu" aria-label="Mobiele navigatie">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
                        : "text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Export as Navigation for backwards compatibility
export const Navigation = BankingNavigation;