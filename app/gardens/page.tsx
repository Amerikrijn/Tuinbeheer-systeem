"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, MapPin, Calendar, AlertCircle } from "lucide-react"
import { getGardens } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function GardensPage() {
  const [gardens, setGardens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadGardens() {
      try {
        setLoading(true)
        setError(null)
        
        const data = await getGardens()
        setGardens(data || [])
      } catch (err) {
        console.error("Error loading gardens:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load gardens"
        setError(errorMessage)
        toast({
          title: "Fout bij laden",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadGardens()
  }, [toast])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Fout bij laden</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Probeer opnieuw
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mijn Tuinen
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Beheer al je tuinen op één plek
        </p>
      </div>

      {gardens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <TreePine className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nog geen tuinen</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Maak je eerste tuin aan om te beginnen
          </p>
          <Link href="/gardens/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe tuin aanmaken
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <Link href="/gardens/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nieuwe tuin aanmaken
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gardens.map((garden) => (
              <Link key={garden.id} href={`/gardens/${garden.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-green-600" />
                      {garden.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {garden.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {garden.location}
                        </div>
                      )}
                      {garden.established_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Aangelegd: {new Date(garden.established_date).toLocaleDateString('nl-NL')}
                        </div>
                      )}
                      {garden.total_area && (
                        <div>
                          Oppervlakte: {garden.total_area} m²
                        </div>
                      )}
                      {garden.description && (
                        <p className="text-gray-500 dark:text-gray-400 line-clamp-2">
                          {garden.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}