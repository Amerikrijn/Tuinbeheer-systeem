'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home, TreePine } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error | null
    errorInfo: React.ErrorInfo | null
    resetError: () => void
  }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log to external service if needed
    // logErrorToService(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        )
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-xl border border-red-200 p-8">
              <div className="text-center mb-6">
                <TreePine className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tuinbeheer Systeem - Fout
                </h1>
                <p className="text-gray-600">Er is een onverwachte fout opgetreden in de applicatie</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">Foutdetails:</h3>
                <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                  {this.state.error?.message || 'Onbekende React fout'}
                </p>
                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">Stack trace</summary>
                    <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">Component stack</summary>
                    <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Mogelijke oorzaken:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• JavaScript fout in een component</li>
                  <li>• Ontbrekende of incorrecte data</li>
                  <li>• Netwerk verbindingsproblemen</li>
                  <li>• Browser compatibiliteitsproblemen</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Wat te doen:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Klik op "Opnieuw Proberen" om de component te herstarten</li>
                  <li>• Ververs de pagina (F5 of Ctrl+R)</li>
                  <li>• Controleer de browser console (F12) voor meer details</li>
                  <li>• Controleer of de development server draait</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={this.resetError}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Opnieuw Proberen
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Pagina Vernieuwen
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Hoofdpagina
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // You can dispatch to a global error state here
    // or show a toast notification
  }
}