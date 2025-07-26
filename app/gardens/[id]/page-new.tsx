"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TreePine, Grid3X3, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { UnifiedGardenOverview } from "@/components/unified-plantvak-system"

export default function NewGardenDetailPage() {
  const router = useRouter()
  const params = useParams()
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)

  // Garden canvas dimensions
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

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

  const handlePlantvakClick = (bedId: string) => {
    router.push(`/gardens/${params.id}/plantvak-view/${bedId}`)
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))
  const resetView = () => setScale(1)

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded" />
          <div className="h-32 w-full bg-gray-200 rounded" />
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* New Unified Garden Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
              Tuin Overzicht (Nieuwe Unified System)
            </CardTitle>
            <div className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-auto rounded-lg border-2 border-dashed border-green-200">
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <UnifiedGardenOverview
                plantBeds={plantBeds}
                containerWidth={CANVAS_WIDTH}
                containerHeight={CANVAS_HEIGHT}
                onPlantvakClick={handlePlantvakClick}
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Nieuwe Unified Visual System</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ <strong>Consistent positioning:</strong> Flowers appear in same relative position in both views</li>
              <li>✅ <strong>Percentage-based coordinates:</strong> No more complex coordinate transformations</li>
              <li>✅ <strong>Proper scaling:</strong> Plantvakken shown to scale in garden overview</li>
              <li>✅ <strong>Unified rendering:</strong> Same component renders both garden and detail views</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              🎯 Click on any plantvak to open detail view with perfect position consistency
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
