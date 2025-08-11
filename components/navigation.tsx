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
    { href: '/admin/trash', label: 'Prullenbak', icon: <Trash2 className="h-4 w-4" />, requiredPermission: 'admin' },
  ];
  
  // Filter items based on permissions
  const visibleItems = navItems.filter(item => {
    // For admin items, use direct role check as fallback
    if (item.requiredPermission === 'admin') {
      const isAdminUser = user?.role === 'admin';
      const hasPermissionAccess = hasPermission?.(item.requiredPermission);
      const hasAccess = isAdminUser || hasPermissionAccess;
      
      console.log(`🔍 Navigation Debug: ${item.label} - User: ${user?.email}, Role: ${user?.role}, IsAdmin: ${isAdminUser}, HasPermission: ${hasPermissionAccess}, HasAccess: ${hasAccess}`);
      return hasAccess;
    }
    
    return !item.requiredPermission || hasPermission?.(item.requiredPermission);
  });
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50" role="navigation" aria-label="Hoofdnavigatie">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <TreePine className="h-6 w-6" />
            <span className="font-bold text-lg">Tuinbeheer</span>
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

          {/* User Menu & Theme Toggle */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.full_name || user.email}</span>
                {isAdmin() && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            )}
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu openen"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
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