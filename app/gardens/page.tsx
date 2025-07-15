"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, MapPin, Calendar, ArrowLeft, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModernPageWrapper } from "@/components/modern-page-wrapper"
import { getGardens } from "@/lib/database"
import type { Garden } from "@/lib/supabase"

export default function GardensPage() {
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function loadGardens() {
      try {
        const data = await getGardens()
        setGardens(data)
      } catch (error) {
        console.error("Failed to load gardens:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGardens()
  }, [])

  const filteredGardens = gardens.filter(garden =>
    garden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garden.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garden.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <ModernPageWrapper title="Mijn Tuinen" subtitle="Laden van tuinen...">
        <div className="space-y-6">
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </ModernPageWrapper>
    )
  }

  return (
    <ModernPageWrapper
      title="Mijn Tuinen"
      subtitle={`${gardens.length} tuinen beheerd`}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {gardens.length} tuinen
          </Badge>
          <Link href="/gardens/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Tuin
            </Button>
          </Link>
        </div>
      }
    >
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Zoek tuinen op naam, locatie of beschrijving..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Gardens Grid */}
      {gardens.length === 0 ? (
        <Card className="border-0 bg-white/80 backdrop-blur shadow-sm text-center py-12">
          <CardContent>
            <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Nog geen tuinen
            </h3>
            <p className="text-gray-500 mb-6">
              Maak je eerste tuin aan om te beginnen met het beheren van plantvakken.
            </p>
            <Link href="/gardens/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Eerste Tuin Maken
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredGardens.length === 0 ? (
        <Card className="border-0 bg-white/80 backdrop-blur shadow-sm text-center py-12">
          <CardContent>
            <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Geen tuinen gevonden
            </h3>
            <p className="text-gray-500 mb-6">
              Probeer een andere zoekterm of maak een nieuwe tuin aan.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Reset zoeken
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGardens.map((garden) => (
            <Card key={garden.id} className="border-0 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-green-700 mb-1">
                      {garden.name}
                    </CardTitle>
                    {garden.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{garden.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                    Actief
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{garden.location}</span>
                  </div>
                  {garden.established_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="flex-1">
                        {new Date(garden.established_date).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/gardens/${garden.id}`} className="w-full">
                    <Button className="bg-green-600 hover:bg-green-700 w-full">
                      Bekijk Plantvakken
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/gardens/${garden.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Bewerken
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex-1">
                      Statistieken
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ModernPageWrapper>
  )
}
