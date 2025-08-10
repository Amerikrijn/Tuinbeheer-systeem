'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { TreePine, Home, BookOpen, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: string;
}

export function BankingNavigation() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  
  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { href: '/gardens', label: 'Tuinen', icon: <TreePine className="h-4 w-4" /> },
    { href: '/logbook', label: 'Logboek', icon: <BookOpen className="h-4 w-4" /> },
    { href: '/tasks', label: 'Taken', icon: <ClipboardList className="h-4 w-4" /> },
    { href: '/admin/users', label: 'Gebruikersbeheer', icon: <User className="h-4 w-4" />, requiredPermission: 'admin' },
  ];
  
  // Filter items based on permissions
  const visibleItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission?.(item.requiredPermission)
  );

  const isAdmin = () => {
    return user?.role === 'admin';
  };
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50" role="navigation" aria-label="Hoofdnavigatie">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <TreePine className="h-6 w-6" />
            <span className="font-bold text-lg">Tuinbeheer</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleItems.filter(item => item.href !== "/").map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Ga naar ${item.label}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu (Banking Standards) */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.full_name || user.email}</span>
                {isAdmin() && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Export as Navigation for backwards compatibility
export const Navigation = BankingNavigation;