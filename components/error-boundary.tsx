"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Don't block render for Supabase errors
    if (error.message.includes('Supabase') || 
        error.message.includes('auth') || 
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('timeout')) {
      return { hasError: false, error }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only catch critical errors, not Supabase auth errors
    if (this.isSupabaseError(error)) {
      console.warn('Supabase error caught, not blocking render:', error.message)
      return
    }
    
    this.setState({
      error,
      errorInfo
    })
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private isSupabaseError(error: Error): boolean {
    return (
      error.message.includes('supabaseKey') ||
      error.message.includes('GoTrueClient') ||
      error.message.includes('Supabase') ||
      error.message.includes('auth') ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    )
  }

  private getSupabaseErrorGuidance(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🔧 Supabase Configuration Issue</h3>
          <p className="text-blue-800 text-sm mb-3">
            This error is related to Supabase configuration. Please check your environment variables.
          </p>
          <div className="space-y-2 text-sm text-blue-700">
            <p>1. Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root</p>
            <p>2. Add your Supabase credentials:</p>
            <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=@supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=@supabase-service-role-key`}
            </pre>
            <p>3. Restart your development server</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>📖 See <code className="bg-gray-100 px-1 rounded">SUPABASE_SETUP.md</code> for detailed instructions.</p>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      const isSupabase = this.state.error && this.isSupabaseError(this.state.error)
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            {isSupabase && this.getSupabaseErrorGuidance()}

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="w-full"
                variant="default"
              >
                <Settings className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                  <pre className="text-xs text-red-600 overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}