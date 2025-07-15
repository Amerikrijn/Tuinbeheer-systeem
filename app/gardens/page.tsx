"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, Eye, Settings } from "lucide-react"
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
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <TreePine className="h-7 w-7 text-green-600" />
              Tuinen Overzicht
            </h1>
            <p className="text-muted-foreground">Beheer al je tuinen op één plek</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/gardens/new">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Tuin
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <TreePine className="h-7 w-7 text-green-600" />
            Tuinen Overzicht
          </h1>
          <p className="text-muted-foreground">Beheer al je tuinen op één plek</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/gardens/new">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Tuin
          </Link>
        </Button>
      </div>

      {gardens.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek tuinen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredGardens.length} van {gardens.length} tuinen
          </div>
        </div>
      )}

      {gardens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TreePine className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nog geen tuinen</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Begin met het toevoegen van je eerste tuin om plantvakken en planten te kunnen beheren.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/gardens/new">
              <Plus className="mr-2 h-4 w-4" />
              Eerste Tuin Toevoegen
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGardens.map((garden) => (
            <Card key={garden.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="line-clamp-1">{garden.name}</span>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {garden.garden_type || "Tuin"}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{garden.location}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {garden.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{garden.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {garden.total_area && (
                    <div className="flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>{garden.total_area}</span>
                    </div>
                  )}
                  {garden.established_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{new Date(garden.established_date).getFullYear()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Link href={`/gardens/${garden.id}/plantvak-view`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijk
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/gardens/${garden.id}`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Beheer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGardens.length === 0 && gardens.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Geen tuinen gevonden</h2>
          <p className="text-muted-foreground mb-6">Probeer een andere zoekterm of voeg een nieuwe tuin toe.</p>
          <Button variant="outline" onClick={() => setSearchTerm("")} className="mr-2">
            Wis zoekopdracht
          </Button>
        </div>
      )}
    </div>
  )
}
