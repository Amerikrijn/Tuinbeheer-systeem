import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UnifiedButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'default' | 'compact' | 'minimal' | 'mobile'
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export function UnifiedButton({ 
  variant = 'primary',
  size = 'default',
  children,
  className,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  loading = false
}: UnifiedButtonProps) {
  const baseClasses = "font-medium transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
  
  // Mobile-first sizing - larger on mobile for better touch targets
  const sizeClasses = {
    default: "h-12 sm:h-10 px-4 sm:px-4 text-base sm:text-sm",
    compact: "h-11 sm:h-9 px-3 sm:px-3 text-sm sm:text-sm", 
    minimal: "h-10 sm:h-8 px-2.5 sm:px-2 text-sm sm:text-xs",
    mobile: "h-14 sm:h-12 px-5 sm:px-4 text-lg sm:text-base" // Extra large for mobile
  }
  
  const variantClasses = {
    primary: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-lg shadow-green-600/25 hover:shadow-green-700/30",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30",
    ghost: "text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/25 hover:shadow-red-700/30",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-700/30",
    outline: "border-2 border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-950/30"
  }
  
  const widthClasses = fullWidth ? "w-full" : "w-auto"
  
  const iconClasses = icon ? "flex items-center justify-center gap-2" : ""
  
  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  )

  return (
    <Button 
      className={cn(
        baseClasses, 
        sizeClasses[size], 
        variantClasses[variant], 
        widthClasses,
        iconClasses,
        disabled && "opacity-50 cursor-not-allowed",
        loading && "relative",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </Button>
  )
}