import { cn } from '@/lib/utils'
import React from 'react'

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper component for tables to make them responsive on mobile
 * Adds horizontal scrolling on small screens
 */
export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop view */}
      <div className="hidden md:block">
        {children}
      </div>
      
      {/* Mobile view with horizontal scroll */}
      <div className="md:hidden">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="inline-block min-w-full align-middle">
            {children}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center md:hidden">
          ← Swipe voor meer →
        </p>
      </div>
    </div>
  )
}

/**
 * Mobile-friendly card layout for data that would normally be in a table
 */
interface MobileCardProps {
  children: React.ReactNode
  className?: string
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <div className={cn(
      "block md:hidden space-y-4",
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Desktop table that hides on mobile
 */
interface DesktopTableProps {
  children: React.ReactNode
  className?: string
}

export function DesktopTable({ children, className }: DesktopTableProps) {
  return (
    <div className={cn(
      "hidden md:block",
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Responsive wrapper that shows different content on mobile vs desktop
 */
interface ResponsiveViewProps {
  mobile: React.ReactNode
  desktop: React.ReactNode
}

export function ResponsiveView({ mobile, desktop }: ResponsiveViewProps) {
  return (
    <>
      <div className="md:hidden">{mobile}</div>
      <div className="hidden md:block">{desktop}</div>
    </>
  )
}