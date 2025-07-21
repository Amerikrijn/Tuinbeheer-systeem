"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TreePine, Plus, Search, MapPin, Leaf, AlertCircle } from "lucide-react"
import { getGardens, deleteGarden } from "@/lib/database"
import type { Garden } from "@/lib/supabase"
import { ErrorBoundary } from "@/components/error-boundary"
import { debugEnvironmentVariables } from "@/lib/debug-vercel-env"
import { useToast } from "@/hooks/use-toast"

function HomePageContent() {
  const router = useRouter()
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function loadGardens() {
      try {
        console.log('[HomePage] Loading gardens...')
        
        // Run debug diagnostics
        const debugInfo = debugEnvironmentVariables()
        console.log('[HomePage] Debug info:', debugInfo)
        
        setLoading(true)
        setError(null)
        
        // Environment variables are now hardcoded in config.ts
        // No need to check them here
        
        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 8000)
        })
        
        const dataPromise = getGardens()
        const data = await Promise.race([dataPromise, timeoutPromise])
        
        console.log('[HomePage] Gardens loaded:', data)
        setGardens(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to load gardens:", error)
        
        let errorMessage = "Kan tuinen niet laden. "
        
        if (error instanceof Error) {
          if (error.message.includes('Environment variables')) {
            errorMessage += "Configuratie ontbreekt. Controleer environment variables."
          } else if (error.message.includes('timeout')) {
            errorMessage += "Verbinding duurt te lang. Probeer opnieuw."
          } else if (error.message.includes('fetch')) {
            errorMessage += "Netwerkfout. Controleer internetverbinding."
          } else if (error.message.includes('relation') || error.message.includes('table')) {
            errorMessage += "Database tabellen niet gevonden. Voer database setup uit."
          } else {
            errorMessage += error.message
          }
        } else {
          errorMessage += "Onbekende fout opgetreden."
        }
        
        setError(errorMessage)
        setGardens([])
      } finally {
        setLoading(false)
      }
    }

    loadGardens()
  }, [])

  // Filter gardens based on search term
  const filteredGardens = gardens.filter(garden =>
    garden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garden.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garden.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TreePine className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Tuinbeheer Systeem</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Welkom bij uw persoonlijke tuinbeheer dashboard. Beheer uw tuinen, plantbedden en houd bij wat u heeft geplant.
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Zoek tuinen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/gardens/new">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Tuin
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Fout bij laden van tuinen</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Opnieuw proberen
            </Button>
            <Button 
              onClick={() => setError(null)} 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Sluiten
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gardens Grid */}
      {!loading && (
        <>
          {filteredGardens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredGardens.map((garden) => (
                <Card key={garden.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                        {garden.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        Tuin
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {garden.description || "Geen beschrijving beschikbaar"}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{garden.location || "Geen locatie"}</span>
                      </div>
                      {garden.established_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(garden.established_date).getFullYear()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/gardens/${garden.id}`)}
                        className="flex-1"
                      >
                        <Leaf className="h-4 w-4 mr-1" />
                        Beheer Tuin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <TreePine className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Geen tuinen gevonden' : 'Nog geen tuinen'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Probeer een andere zoekterm of maak een nieuwe tuin aan.'
                  : 'Begin met het aanmaken van uw eerste tuin om uw planten te beheren.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Zoeken wissen
                  </Button>
                )}
                <Button asChild>
                  <Link href="/gardens/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {searchTerm ? 'Nieuwe tuin' : 'Eerste tuin aanmaken'}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </>
      )}


    </div>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <HomePageContent />
    </ErrorBoundary>
  )
}
