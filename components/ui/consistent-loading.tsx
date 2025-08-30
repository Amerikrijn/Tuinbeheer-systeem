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
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-green-600 dark:text-green-400`} />
      {text && (
        <p className={`${textSizes[size]} text-muted-foreground text-center`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Skeleton loading component for consistent placeholders
export function ConsistentSkeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-green-100 dark:bg-green-900/30 rounded-md animate-pulse ${className}`}
      {...props}
    />
  )
}

// Page loading component
export function PageLoading() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <ConsistentSkeleton className="h-8 w-20" />
          <ConsistentSkeleton className="h-6 w-32" />
        </div>
        
        {/* Content skeleton */}
        <div className="grid gap-4">
          <ConsistentSkeleton className="h-32 w-full" />
          <ConsistentSkeleton className="h-24 w-full" />
          <ConsistentSkeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

// Card loading component
export function CardLoading() {
  return (
    <div className="space-y-3">
      <ConsistentSkeleton className="h-6 w-3/4" />
      <ConsistentSkeleton className="h-4 w-1/2" />
      <ConsistentSkeleton className="h-20 w-full" />
    </div>
  )
}

// List loading component
export function ListLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-green-200 dark:border-green-800 rounded-lg">
          <ConsistentSkeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <ConsistentSkeleton className="h-4 w-3/4" />
            <ConsistentSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}