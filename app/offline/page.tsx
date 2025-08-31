'use client'
import { useRouter } from 'next/navigation'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw, Home, BookOpen, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = React.useState(true)
  const [lastOnline, setLastOnline] = React.useState<Date | null>(null)

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    // Set initial status
    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              {isOnline ? (
                <Wifi className="w-10 h-10 text-red-600 dark:text-red-400" />
              ) : (
                <WifiOff className="w-10 h-10 text-red-600 dark:text-red-400" />
              )}
            </div>
            <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">
              {isOnline ? 'Verbinding Hersteld!' : 'Geen Internetverbinding'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {isOnline 
                ? 'Je bent weer online. Je kunt nu alle functies gebruiken.'
                : 'Controleer je internetverbinding en probeer opnieuw.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!isOnline && (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800">
                        Offline Modus
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Sommige functies zijn mogelijk niet beschikbaar zonder internetverbinding.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Wat kun je nog wel doen:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Bekijk gecachte tuin informatie</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Bekijk gecachte planten data</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Bekijk gecachte taken</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isOnline && lastOnline && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Verbinding hersteld om {lastOnline.toLocaleTimeString('nl-NL')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              <Button 
                onClick={handleRetry} 
                className="w-full"
                variant={isOnline ? "default" : "outline"}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isOnline ? 'Ga naar Homepage' : 'Opnieuw proberen'}
              </Button>
              
              {!isOnline && (
                <Button 
                  onClick={handleGoHome} 
                  variant="ghost" 
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ga naar Homepage
                </Button>
              )}
            </div>

            {!isOnline && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Snelle Links (Offline)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/" passHref>
                    <Button variant="outline" size="sm" className="w-full">
                      <Home className="w-3 h-3 mr-1" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/logbook" passHref>
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Logboek
                    </Button>
                  </Link>
                  <Link href="/tasks" passHref>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-3 h-3 mr-1" />
                      Taken
                    </Button>
                  </Link>
                  <Link href="/gardens" passHref>
                    <Button variant="outline" size="sm" className="w-full">
                      <span className="text-xs">🌿</span>
                      Tuinen
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Information */}
        <div className="mt-6 text-center">
          <details className="text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer hover:text-gray-70 dark:hover:text-gray-700 dark:text-gray-200">
              Technische Informatie
            </summary>
            <div className="mt-2 space-y-1 text-left bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Worker:</span>
                <span className="text-blue-600 dark:text-blue-400">Actief</span>
              </div>
              <div className="flex justify-between">
                <span>Cache:</span>
                <span className="text-blue-600 dark:text-blue-400">Gecacht</span>
              </div>
              <div className="flex justify-between">
                <span>Laatste Update:</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {new Date().toLocaleString('nl-NL')}
                </span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}