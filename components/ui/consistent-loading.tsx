import { Loader2 } from 'lucide-react'

interface ConsistentLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function ConsistentLoading({ size = 'md', text, className = '' }: ConsistentLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={{`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className={{`${sizeClasses[size]} border-2 border-green-200 border-t-green-600 rounded-full animate-spin`} />
      {text && (
        <p className={{`${textSizes[size]} text-muted-foreground text-center`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Optimized skeleton loading component - fewer animate-pulse elements
export function ConsistentSkeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={{`bg-green-100 dark:bg-green-900/30 rounded-md ${className}`}
      {...props}
    />
  )
}

// Page loading component - optimized with fewer animations
export function PageLoading() {
  return (
    <div className=""container mx-auto p-4 max-w-6xl">
      <div className=""space-y-4">
        {/* Header skeleton */}
        <div className=""flex items-center gap-3 mb-4">
          <div className=""h-8 w-20 bg-green-100 dark:bg-green-900/30 rounded" />
          <div className=""h-6 w-32 bg-green-100 dark:bg-green-900/30 rounded" />
        </div>
        
        {/* Content skeleton - only one animate-pulse container */}
        <div className=""animate-pulse space-y-4">
          <div className=""h-32 w-full bg-green-100 dark:bg-green-900/30 rounded" />
          <div className=""h-24 w-full bg-green-100 dark:bg-green-900/30 rounded" />
          <div className=""h-40 w-full bg-green-100 dark:bg-green-900/30 rounded" />
        </div>
      </div>
    </div>
  )
}

// Card loading component - optimized
export function CardLoading() {
  return (
    <div className=""animate-pulse space-y-3">
      <div className=""h-6 w-3/4 bg-green-100 dark:bg-green-900/30 rounded" />
      <div className=""h-4 w-1/2 bg-green-100 dark:bg-green-900/30 rounded" />
      <div className=""h-20 w-full bg-green-100 dark:bg-green-900/30 rounded" />
    </div>
  )
}

// List loading component - optimized with single animate-pulse
export function ListLoading({ count = 3 }: { count?: number }) {
  return (
    <div className=""animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className=""flex items-center gap-3 p-3 border border-green-200 dark:border-green-800 rounded-lg">
          <div className=""h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full" />
          <div className=""flex-1 space-y-2">
            <div className=""h-4 w-3/4 bg-green-100 dark:bg-green-900/30 rounded" />
            <div className=""h-3 w-1/2 bg-green-100 dark:bg-green-900/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}