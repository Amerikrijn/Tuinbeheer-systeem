"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TreePine, Grid3X3 } from "lucide-react"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { UnifiedGardenOverview } from "@/components/unified-plantvak-system"
import { Skeleton } from "@/components/ui/skeleton"

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
        setPlantBeds(plantBedsData)
      } catch (error) {
        console.error("Error loading data:", error)
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
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
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
          <Button onClick={() => router.push("/gardens")} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Tuinen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/gardens")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TreePine className="h-8 w-8 text-green-600" />
              {garden.name}
            </h1>
            {(garden.total_area || (garden.length && garden.width)) && (
              <p className="text-gray-600">
                <span className="text-sm font-medium text-green-600">
                  • Afmetingen: {garden.length}m × {garden.width}m • Oppervlakte: {garden.total_area || 
                    (garden.length && garden.width && 
                      `${(parseFloat(garden.length) * parseFloat(garden.width)).toFixed(1)} m²`
                    )
                  }
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Unified Garden System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            Tuin Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedGardenOverview 
            plantBeds={plantBeds}
            containerWidth={800}
            containerHeight={600}
            onPlantvakClick={(bedId) => router.push(`/gardens/${params.id}/plantvak-view/${bedId}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
