import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, TreePine, BookOpen, ClipboardList, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  onClick: () => void
  label: string
}

interface UnifiedHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  backButton?: BackButtonProps
  variant?: 'default' | 'compact' | 'minimal'
  icon?: 'calendar' | 'tree' | 'book' | 'tasks' | 'leaf' | 'custom'
  customIcon?: React.ReactNode
}

const iconMap = {
  calendar: Calendar,
  tree: TreePine,
  book: BookOpen,
  tasks: ClipboardList,
  leaf: Leaf,
  custom: null
}

export function UnifiedHeader({ 
  title, 
  subtitle, 
  actions, 
  backButton,
  variant = 'default',
  icon = 'calendar',
  customIcon
}: UnifiedHeaderProps) {
  const IconComponent = icon === 'custom' ? null : iconMap[icon]
  
  return (
    <div className={cn(
      "border-b-2 border-green-200 dark:border-green-800 pb-3 mb-4 sm:mb-6",
      variant === 'compact' && "pb-2 mb-3 sm:mb-4",
      variant === 'minimal' && "pb-2 mb-2 sm:mb-3"
    )}>
      {/* Mobile-First Layout - Stacked on mobile, horizontal on desktop */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Header Content - Always stacked on mobile */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          {backButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={backButton.onClick} 
              className="w-full sm:w-auto h-12 sm:h-10 px-4 sm:px-3 text-sm border-green-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButton.label}
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 sm:p-2 rounded-xl",
              variant === 'default' && "bg-green-100 dark:bg-green-900/30 p-3 sm:p-3",
              variant === 'compact' && "bg-green-100 dark:bg-green-900/30 p-2.5 sm:p-2.5",
              variant === 'minimal' && "bg-green-100 dark:bg-green-900/30 p-2 sm:p-2"
            )}>
              {customIcon || (IconComponent && <IconComponent className={cn(
                "text-green-700 dark:text-green-400",
                variant === 'default' && "w-7 h-7 sm:w-6 sm:h-6 md:w-7 md:h-7",
                variant === 'compact' && "w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6",
                variant === 'minimal' && "w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5"
              )} />)}
            </div>
            
            <div>
              <h1 className={cn(
                "font-bold text-foreground text-green-800 dark:text-green-200",
                variant === 'default' && "text-2xl sm:text-xl md:text-2xl lg:text-3xl",
                variant === 'compact' && "text-xl sm:text-lg md:text-xl lg:text-2xl",
                variant === 'minimal' && "text-lg sm:text-base md:text-lg lg:text-xl"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  "text-muted-foreground mt-1",
                  variant === 'default' && "text-base sm:text-sm md:text-base lg:text-lg",
                  variant === 'compact' && "text-sm sm:text-xs md:text-sm lg:text-base",
                  variant === 'minimal' && "text-sm sm:text-xs md:text-sm"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions - Full width on mobile, compact on desktop */}
        {actions && (
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}