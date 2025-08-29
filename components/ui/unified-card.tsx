import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface UnifiedCardProps {
  children: React.ReactNode
  variant?: 'default' | 'compact' | 'minimal'
  hover?: boolean
  className?: string
  header?: {
    title: string
    subtitle?: string
    badge?: React.ReactNode
    actions?: React.ReactNode
  }
  footer?: React.ReactNode
  onClick?: () => void
}

export function UnifiedCard({ 
  children, 
  variant = 'default', 
  hover = true,
  className,
  header,
  footer,
  onClick
}: UnifiedCardProps) {
  const cardClasses = cn(
    "group transition-all duration-200 overflow-hidden relative",
    variant === 'default' && "border-2 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700",
    variant === 'compact' && "border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700",
    variant === 'minimal' && "border border-green-200/50 dark:border-green-800/50 hover:border-green-300/70 dark:hover:border-green-700/70",
    hover && "hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-800/20",
    onClick && "cursor-pointer active:scale-[0.98] sm:active:scale-100",
    className
  )

  const content = (
    <>
      {header && (
        <CardHeader className={cn(
          "pb-3 pt-4 px-4 sm:px-4",
          variant === 'compact' && "pb-2 pt-3 px-3 sm:px-3",
          variant === 'minimal' && "pb-2 pt-3 px-3 sm:px-3"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "font-semibold text-foreground group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate",
                variant === 'default' && "text-base sm:text-lg",
                variant === 'compact' && "text-sm sm:text-base",
                variant === 'minimal' && "text-sm"
              )}>
                {header.title}
              </CardTitle>
              {header.subtitle && (
                <p className={cn(
                  "text-muted-foreground mt-1 truncate",
                  variant === 'default' && "text-sm",
                  variant === 'compact' && "text-xs sm:text-sm",
                  variant === 'minimal' && "text-xs"
                )}>
                  {header.subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              {header.badge}
              {header.actions}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(
        "pt-0 pb-4 px-4 sm:px-4",
        variant === 'compact' && "pt-0 pb-3 px-3 sm:px-3",
        variant === 'minimal' && "pt-0 pb-3 px-3 sm:px-3"
      )}>
        {children}
      </CardContent>
      
      {footer && (
        <div className={cn(
          "px-4 pb-4 pt-0 border-t border-green-100 dark:border-green-800/30",
          variant === 'compact' && "px-3 pb-3",
          variant === 'minimal' && "px-3 pb-3"
        )}>
          {footer}
        </div>
      )}
    </>
  )

  if (onClick) {
    return (
      <Card className={cardClasses} onClick={onClick}>
        {content}
      </Card>
    )
  }

  return (
    <Card className={cardClasses}>
      {content}
    </Card>
  )
}