'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthErrorHandlerProps {
  error: string | null
  onRetry?: () => void
  onClearError?: () => void
}

export function AuthErrorHandler({ error, onRetry, onClearError }: AuthErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  if (!error) return null

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry?.()
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return 'environment'
    }
    if (errorMessage.includes('Database lookup timeout')) {
      return 'timeout'
    }
    if (errorMessage.includes('User not found in system')) {
      return 'user_not_found'
    }
    if (errorMessage.includes('Access denied')) {
      return 'access_denied'
    }
    return 'general'
  }

  const errorType = getErrorType(error)

  const getErrorSolution = (type: string) => {
    switch (type) {
      case 'environment':
        return {
          title: 'Configuration Issue',
          description: 'Missing environment variables detected.',
          solutions: [
            'Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment',
            'Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured',
            'Verify your deployment platform environment variables'
          ],
          actionLabel: 'Check Configuration',
          actionUrl: '/admin/system-health'
        }
      case 'timeout':
        return {
          title: 'Database Connection Timeout',
          description: 'The database took too long to respond.',
          solutions: [
            'Check your internet connection',
            'Verify Supabase project status',
            'Try again in a few moments'
          ],
          actionLabel: 'Retry Connection',
          actionUrl: null
        }
      case 'user_not_found':
      case 'access_denied':
        return {
          title: 'User Account Issue',
          description: 'Your account is not set up in the system.',
          solutions: [
            'Contact an administrator to create your account',
            'Verify you\'re using the correct email address',
            'Check if your account has been activated'
          ],
          actionLabel: 'Contact Admin',
          actionUrl: 'mailto:admin@tuinbeheer.nl'
        }
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred.',
          solutions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support if the issue persists'
          ],
          actionLabel: 'Retry',
          actionUrl: null
        }
    }
  }

  const solution = getErrorSolution(errorType)

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          {solution.title}
        </CardTitle>
        <CardDescription>
          {solution.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-mono text-sm">
            {error}
          </AlertDescription>
        </Alert>

        <div>
          <h4 className="font-semibold mb-2">Possible Solutions:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {solution.solutions.map((sol, index) => (
              <li key={index}>{sol}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              variant="outline"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {solution.actionLabel}
                </>
              )}
            </Button>
          )}

          {solution.actionUrl && (
            <Button asChild variant="outline">
              <a 
                href={solution.actionUrl} 
                target={solution.actionUrl.startsWith('http') ? '_blank' : '_self'}
                rel={solution.actionUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {solution.actionUrl.startsWith('mailto:') ? (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Admin
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    System Health
                  </>
                )}
              </a>
            </Button>
          )}

          {onClearError && (
            <Button onClick={onClearError} variant="ghost">
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}