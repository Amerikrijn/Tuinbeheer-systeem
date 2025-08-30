'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home, TreePine } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to the console

  }, [error])

  return (
    <div className=""min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex items-center justify-center p-6">
      <div className=""container max-w-2xl">
        <div className=""text-center mb-8">
          <TreePine className=""h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" data-testid="tree-pine-icon" />
          <h1 className=""text-3xl font-bold text-foreground mb-2">
            Tuinbeheer Systeem
          </h1>
          <p className=""text-muted-foreground">Garden Management System</p>
        </div>

        <Card className=""border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className=""flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className=""h-5 w-5" data-testid="alert-circle-icon" />
              Er is een fout opgetreden
            </CardTitle>
          </CardHeader>
          <CardContent className=""space-y-4">
            <div className=""bg-card p-4 rounded-lg border border-destructive/20">
              <p className=""text-red-700 dark:text-red-300 font-medium mb-2">Foutmelding:</p>
              <p className=""text-sm text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-950/30 p-2 rounded">
                {error.message || 'Er is een onverwachte fout opgetreden'}
              </p>
              {error.digest && (
                <p className=""text-xs text-red-500 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className=""bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <h3 className=""font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Wat kunt u doen:</h3>
              <ul className=""text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Probeer de pagina te vernieuwen</li>
                <li>• Controleer uw internetverbinding</li>
                <li>• Wacht een moment en probeer het opnieuw</li>
                <li>• Ga terug naar de hoofdpagina</li>
              </ul>
            </div>

            <div className=""flex flex-col sm:flex-row gap-3">
              <Button
                onClick={reset}
                className=""flex-1 bg-green-600 dark:bg-green-700 hover:bg-green-700"
                data-testid="retry-button"
              >
                <RefreshCw className=""h-4 w-4 mr-2" data-testid="refresh-cw-icon" />
                Probeer Opnieuw
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className=""flex-1"
                data-testid="home-button"
              >
                <Home className=""h-4 w-4 mr-2" data-testid="home-icon" />
                Naar Hoofdpagina
              </Button>
            </div>

            <div className=""text-center">
              <p className=""text-xs text-muted-foreground">
                Als dit probleem blijft bestaan, neem dan contact op met de systeembeheerder.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}