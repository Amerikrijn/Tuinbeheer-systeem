"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf } from "lucide-react"
import { getGardens } from "@/lib/database"
import type { Garden } from "@/lib/supabase"

export default function GardensPage() {
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function fetchGardens() {
      try {
        const data = await getGardens()
        setGardens(data)
      } catch (error) {
        console.error("Error fetching gardens:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGardens()
  }, [])

  const filteredGardens = gardens.filter(
    (garden) =>
      garden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      garden.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <TreePine className="h-7 w-7 text-green-600" />
            Tuinen Overzicht
          </h1>
          <p className="text-muted-foreground">Beheer al je tuinen op één plek</p>
        </div>

        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/gardens/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nieuwe Tuin
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Zoek tuinen op naam of locatie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      {gardens.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{gardens.length}</p>
                  <p className="text-sm text-muted-foreground">Totaal Tuinen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(gardens.map((g) => g.location.split(",")[1]?.trim() || g.location)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Locaties</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {gardens.filter((g) => g.garden_type === "Gemeenschapstuin").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Gemeenschapstuinen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      gardens.filter(
                        (g) =>
                          g.established_date && new Date(g.established_date).getFullYear() === new Date().getFullYear(),
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Dit Jaar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gardens Grid */}
      {filteredGardens.length === 0 && !loading ? (
        <Card className="p-12 text-center">
          <TreePine className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{searchTerm ? "Geen tuinen gevonden" : "Nog geen tuinen"}</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Probeer een andere zoekterm" : "Begin met het toevoegen van je eerste tuin"}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
              <Link href="/gardens/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nieuwe Tuin Toevoegen
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGardens.map((garden) => (
            <Card key={garden.id} className="group cursor-pointer transition-all hover:shadow-lg">
              <Link href={`/gardens/${garden.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TreePine className="h-5 w-5 text-green-600" />
                        {garden.name}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {garden.location}
                      </div>
                    </div>
                    {garden.garden_type && (
                      <Badge variant="secondary" className="text-xs">
                        {garden.garden_type}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {garden.description && (
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{garden.description}</p>
                  )}

                  <div className="space-y-2">
                    {garden.total_area && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Oppervlakte:</span>
                        <span className="text-muted-foreground">{garden.total_area}</span>
                      </div>
                    )}

                    {garden.length && garden.width && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Afmetingen:</span>
                        <span className="text-muted-foreground">
                          {garden.length}m × {garden.width}m
                        </span>
                      </div>
                    )}

                    {garden.maintenance_level && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Onderhoud:</span>
                        <span className="text-muted-foreground">{garden.maintenance_level}</span>
                      </div>
                    )}

                    {garden.established_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          Opgericht: {new Date(garden.established_date).toLocaleDateString("nl-NL")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Aangemaakt: {new Date(garden.created_at).toLocaleDateString("nl-NL")}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Actief
                    </Badge>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
