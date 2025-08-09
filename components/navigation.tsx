'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { TreePine, Home, BookOpen, Settings, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { href: '/admin', label: 'Beheer', icon: <Settings className="h-4 w-4" />, requiredPermission: 'admin' },
  ];
  
  // Filter items based on permissions
  const visibleItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission?.(item.requiredPermission)
  );
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" role="navigation" aria-label="Hoofdnavigatie">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Home Button with Banking Design */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              pathname === "/"
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            aria-current={pathname === "/" ? "page" : undefined}
            aria-label="Ga naar dashboard"
          >
            <div className="p-1 bg-green-100 rounded-lg">
              <TreePine className="h-4 w-4 text-green-600" aria-hidden="true" />
            </div>
            <span>Tuinbeheer</span>
          </Link>

          {/* Navigation items with Banking Standards */}
          <ul className="flex items-center space-x-1" role="menubar">
            {visibleItems.filter(item => item.href !== "/").map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                    role="menuitem"
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Ga naar ${item.label}`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="hidden sm:block">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Menu (Banking Standards) */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" aria-hidden="true" />
                <span aria-label={`Ingelogd als ${user.email}`}>
                  {user.email}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Export as Navigation for backwards compatibility
export const Navigation = BankingNavigation;