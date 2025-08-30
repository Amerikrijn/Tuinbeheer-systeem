import React from 'react'
import { cn } from '@/lib/utils'

interface UnifiedGridProps {
  children: React.ReactNode
  variant?: 'default' | 'compact' | 'minimal' | 'mobile-optimized'
  className?: string
  gap?: 'small' | 'medium' | 'large'
}

export function UnifiedGrid({ 
  children, 
  variant = 'default',
  className,
  gap = 'medium'
}: UnifiedGridProps) {
  // Mobile-first grid system
  // Starts with 1 column on mobile, scales up on larger screens
  const gridClasses = {
    default: "grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    compact: "grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
    minimal: "grid grid-cols-1 gap-2 sm:gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
    'mobile-optimized': "grid grid-cols-1 gap-4 sm:gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Larger gaps on mobile
  }
  
  const gapClasses = {
    small: "gap-2 sm:gap-3",
    medium: "gap-3 sm:gap-4", 
    large: "gap-4 sm:gap-6"
  }
  
  // Override default gaps if specified
  const finalGridClasses = gap !== 'medium' 
    ? gridClasses[variant].replace(/gap-\d+(\.\d+)?/g, gapClasses[gap])
    : gridClasses[variant]
  
  return (
    <div className={cn(finalGridClasses, className)}>
      {children}
    </div>
  )
}

// Specialized grid variants for common use cases
export function MobileFirstGrid({ 
  children, 
  className 
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-4 sm:gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  )
}

export function CompactGrid({ 
  children, 
  className 
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      className
    )}>
      {children}
    </div>
  )
}

export function AdminGrid({ 
  children, 
  className 
}: { children: React.ReactNode; className?: string }) {
  // Optimized for desktop/admin use with more columns
  return (
    <div className={cn(
      "grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
      className
    )}>
      {children}
    </div>
  )
}