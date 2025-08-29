import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnifiedSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  variant?: 'default' | 'compact' | 'minimal'
  fullWidth?: boolean
  showClearButton?: boolean
  onClear?: () => void
  className?: string
  disabled?: boolean
}

export function UnifiedSearch({ 
  value,
  onChange,
  placeholder = "Zoeken...",
  variant = 'default',
  fullWidth = true,
  showClearButton = true,
  onClear,
  className,
  disabled = false
}: UnifiedSearchProps) {
  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange("")
    }
  }

  const sizeClasses = {
    default: "h-12 sm:h-10 text-base sm:text-sm",
    compact: "h-11 sm:h-9 text-sm",
    minimal: "h-10 sm:h-8 text-sm sm:text-xs"
  }

  const paddingClasses = {
    default: "pl-12 sm:pl-10 pr-12 sm:pr-10",
    compact: "pl-11 sm:pl-9 pr-11 sm:pr-9", 
    minimal: "pl-10 sm:pl-8 pr-10 sm:pr-8"
  }

  const iconSizes = {
    default: "w-5 h-5 sm:w-4 sm:h-4",
    compact: "w-4 h-4 sm:w-4 sm:h-4",
    minimal: "w-4 h-4 sm:w-3.5 sm:h-3.5"
  }

  return (
    <div className={cn(
      "relative",
      fullWidth ? "w-full" : "w-auto",
      className
    )}>
      {/* Search Icon */}
      <Search className={cn(
        "absolute left-3 sm:left-3 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-400",
        iconSizes[variant]
      )} />
      
      {/* Input Field */}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          sizeClasses[variant],
          paddingClasses[variant],
          "border-2 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-600",
          "focus:ring-2 focus:ring-green-500/20 focus:ring-offset-0",
          "bg-white dark:bg-gray-900 placeholder:text-green-500/60 dark:placeholder:text-green-400/60",
          "transition-all duration-200",
          fullWidth && "w-full"
        )}
      />
      
      {/* Clear Button */}
      {showClearButton && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2",
            "h-8 w-8 sm:h-7 sm:w-7 p-0",
            "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30",
            "transition-all duration-200"
          )}
        >
          <X className={cn("h-4 w-4 sm:h-3.5 sm:w-3.5")} />
        </Button>
      )}
    </div>
  )
}

// Specialized search variants
export function MobileSearch({ 
  value,
  onChange,
  placeholder = "🔍 Zoeken...",
  ...props 
}: Omit<UnifiedSearchProps, 'variant'>) {
  return (
    <UnifiedSearch
      variant="default"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth={true}
      {...props}
    />
  )
}

export function CompactSearch({ 
  value,
  onChange,
  placeholder = "Zoeken...",
  ...props 
}: Omit<UnifiedSearchProps, 'variant'>) {
  return (
    <UnifiedSearch
      variant="compact"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth={false}
      {...props}
    />
  )
}