"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  TreePine,
  Plus,
  Leaf,
  MapPin,
} from "lucide-react"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

export default function GardenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [gardenData, plantBedsData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBeds(params.id as string),
        ])
        setGarden(gardenData)
        setPlantBeds(Array.isArray(plantBedsData) ? plantBedsData : [])
      } catch (error) {
        console.error("Error loading data:", error)
        // Set empty states to prevent white screen
        setGarden(null)
        setPlantBeds([])
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
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

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tuin niet gevonden</h3>
          <p className="text-gray-600 mb-4">De tuin die je zoekt bestaat niet of is verwijderd.</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Tuinen
            </Button>
          </Link>
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
              <div>
                <h1 className="text-3xl font-bold text-green-700">{garden.name}</h1>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4" />
                  {garden.location}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/plant-beds/add-plant?garden_id=${garden.id}`}>
              <Button variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100">
                <Plus className="h-4 w-4 mr-2" />
                Planten/Bloemen Toevoegen
              </Button>
            </Link>
            <Link href="/plant-beds/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Plantvak Toevoegen
              </Button>
            </Link>
            <Link href={`/plant-beds/new?garden_id=${garden.id}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Plantvak
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="text-sm text-gray-500">
          <span className="text-gray-400">Tuin</span> → <span className="font-medium">Plantvak</span> → Bloem
        </div>

        {/* Plant Beds Grid */}
        {plantBeds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Nog geen plantvakken
              </h3>
              <p className="text-gray-500 mb-6">
                Voeg je eerste plantvak toe om bloemen te kunnen planten.
              </p>
              <Link href="/plant-beds/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Plantvak Toevoegen
                </Button>
              </Link>
              <Link href={`/plant-beds/new?garden_id=${garden.id}`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Eerste Plantvak Maken
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {plantBeds.map((bed) => (
              <Card key={bed.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-green-700">
                        {bed.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {bed.size && (
                          <div className="flex items-center gap-1">
                            <Leaf className="h-4 w-4" />
                            {bed.size}
                          </div>
                        )}
                        <div>
                          {bed.plants.length} bloemen
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {bed.plants.length > 0 ? 'Beplant' : 'Leeg'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {bed.description && (
                    <p className="text-gray-600 mb-4">{bed.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/plant-beds/${bed.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Beheer Bloemen
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Visual Garden Link */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Visuele Weergave</h3>
                <p className="text-blue-700 text-sm">
                  Bekijk je plantvakken op schaal in de visuele tuin weergave
                </p>
              </div>
              <Link href={`/gardens/${garden.id}/plantvak-view`}>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Bekijk Visueel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
