"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, MapPin, Calendar, ArrowLeft } from "lucide-react"
import { getGardens } from "@/lib/database"
import type { Garden } from "@/lib/supabase"

export default function GardensPage() {
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [loading, setLoading] = React.useState(true)

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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <TreePine className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-green-700">Mijn Tuinen</h1>
            </div>
          </div>
          <Link href="/gardens/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Tuin
            </Button>
          </Link>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="text-sm text-gray-500">
          <span className="font-medium">Tuin</span> → Plantvak → Bloem
        </div>

        {/* Gardens Grid */}
        {gardens.length === 0 ? (
          <Card className="text-center py-12">
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
        ) : (
          <div className="grid gap-4">
            {gardens.map((garden) => (
              <Card key={garden.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-green-700">
                        {garden.name}
                      </CardTitle>
                      {garden.description && (
                        <p className="text-gray-600 mt-1">{garden.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Actief
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {garden.location}
                    </div>
                    {garden.established_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(garden.established_date).toLocaleDateString('nl-NL')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/gardens/${garden.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700 flex-1">
                        Bekijk Plantvakken
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
