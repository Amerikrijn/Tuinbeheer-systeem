'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home, TreePine } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReporting.captureException(error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-card rounded-lg shadow-xl border border-destructive/20 p-8">
              <div className="text-center mb-6">
                <TreePine className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Tuinbeheer Systeem - Fout
                </h1>
                <p className="text-muted-foreground">Er is een onverwachte fout opgetreden</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">Foutdetails:</h3>
                <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                  {error.message || 'Er is een onverwachte fout opgetreden'}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
                {process.env.NODE_ENV === 'development' && error.stack && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">
                      Stack trace (development only)
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Wat kunt u doen:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Probeer de pagina te vernieuwen</li>
                  <li>• Controleer uw internetverbinding</li>
                  <li>• Wacht een moment en probeer het opnieuw</li>
                  <li>• Ga terug naar de hoofdpagina</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Technische informatie:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tijdstip: {new Date().toLocaleString('nl-NL')}</li>
                  <li>• Platform: {typeof window !== 'undefined' ? 'Browser' : 'Server'}</li>
                  <li>• Omgeving: {process.env.NODE_ENV || 'unknown'}</li>
                  {error.digest && <li>• Error ID: {error.digest}</li>}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reset}
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
      </body>
    </html>
  )
}