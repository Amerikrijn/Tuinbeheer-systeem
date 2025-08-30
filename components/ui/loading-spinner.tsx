import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  label = 'Laden...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 
        className={cn('animate-spin text-primary', sizeClasses[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface LoadingOverlayProps {
  visible: boolean
  label?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ 
  visible, 
  label = 'Bezig met verwerken...',
  fullScreen = false
}: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <div 
      className={cn(
        'flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0 rounded-lg'
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSaving?: boolean
  saveLabel?: string
  savingLabel?: string
}

export function SaveButton({ 
  isSaving = false,
  saveLabel = 'Opslaan',
  savingLabel = 'Opslaan...',
  children,
  disabled,
  ...props
}: SaveButtonProps) {
  return (
    <button
      disabled={isSaving || disabled}
      aria-busy={isSaving}
      {...props}
    >
      {isSaving ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{savingLabel}</span>
        </span>
      ) : (
        children || saveLabel
      )}
    </button>
  )
}