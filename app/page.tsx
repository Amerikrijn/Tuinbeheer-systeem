"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, Eye, Settings, AlertCircle, Sparkles } from "lucide-react"
import { getGardens } from "@/lib/database"
import type { Garden } from "@/lib/supabase"
import { ErrorBoundary } from "@/components/error-boundary"

function HomePageContent() {
  const router = useRouter()
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function loadGardens() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[HomePage] Starting to load gardens...')
        
        // Check environment variables first
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error("Missing Supabase environment variables. Please check your .env.local file.")
        }
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        })
        
        const dataPromise = getGardens()
        const data = await Promise.race([dataPromise, timeoutPromise])
        
        console.log('[HomePage] Gardens loaded:', data)
        setGardens(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to load gardens:", error)
        
        let errorMessage = "Failed to load gardens. "
        
        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage += "Network connection issue. Please check your internet connection and try again."
          } else if (error.message.includes('timeout')) {
            errorMessage += "The request took too long. Please try again."
          } else if (error.message.includes('Supabase') || error.message.includes('environment')) {
            errorMessage += "Database connection issue. Please check your configuration."
          } else if (error.message.includes('relation') || error.message.includes('table')) {
            errorMessage += "Database tables not found. Please run the database setup script first."
          } else {
            errorMessage += error.message
          }
        } else {
          errorMessage = "An unexpected error occurred. Please try refreshing the page."
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
    garden.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          Welkom bij uw persoonlijke tuinbeheer dashboard. Beheer uw tuinen, plant bedden en houd bij wat u heeft geplant.
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
              <h3 className="font-semibold text-red-800">Error Loading Gardens</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
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
                  <Skeleton className="h-8 w-24" />
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
                        {garden.plant_beds?.length || 0} bedden
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {garden.description || "Geen beschrijving beschikbaar"}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{garden.location || "Geen locatie"}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/gardens/${garden.id}/plantvak-view`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visueel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/gardens/${garden.id}`)}
                        >
                          <Leaf className="h-4 w-4 mr-1" />
                          Beheer
                        </Button>
                      </div>
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
                {searchTerm ? 'Geen tuinen gevonden' : 'Geen tuinen nog'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Probeer een andere zoekterm of maak een nieuwe tuin aan.'
                  : 'Begin met het aanmaken van uw eerste tuin om uw planten te beheren.'
                }
              </p>
              <Button asChild>
                <Link href="/gardens/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Maak Eerste Tuin
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Snelle Acties</h3>
              <p className="text-sm text-gray-600">Veelgebruikte functies</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/gardens/new">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Tuin Aanmaken
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/plant-beds/new">
                <Leaf className="h-4 w-4 mr-2" />
                Nieuw Plantbed
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tuin Statistieken</h3>
              <p className="text-sm text-gray-600">Overzicht van uw tuinen</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Totaal Tuinen</span>
              <Badge variant="secondary">{gardens.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Totaal Plant Bedden</span>
              <Badge variant="secondary">
                {gardens.reduce((total, garden) => total + (garden.plant_beds?.length || 0), 0)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
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
