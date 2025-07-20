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
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GRID_SIZE = 20

export default function GardenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [showVisualView, setShowVisualView] = useState(false)

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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }

  const resetView = () => {
    setScale(1)
  }

  const getPlantBedColor = (bedId: string) => {
    const index = plantBeds.findIndex(bed => bed.id === bedId)
    const colors = [
      'bg-green-100 border-green-300',
      'bg-blue-100 border-blue-300',
      'bg-purple-100 border-purple-300',
      'bg-yellow-100 border-yellow-300',
      'bg-pink-100 border-pink-300',
      'bg-indigo-100 border-indigo-300',
    ]
    return colors[index % colors.length]
  }

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
            <p className="text-gray-600">
              Beheer je tuin en plantvakken
              {(garden.total_area || (garden.length && garden.width)) && (
                <span className="ml-2 text-sm font-medium text-green-600">
                  • Tuingrootte: {garden.total_area || 
                    (garden.length && garden.width && 
                      `${(parseFloat(garden.length) * parseFloat(garden.width)).toFixed(1)} m²`
                    )
                  }
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showVisualView ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVisualView(!showVisualView)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            {showVisualView ? "Lijst Weergave" : "Visuele Weergave"}
          </Button>
        </div>
      </div>

      {/* Garden Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-600" />
            Tuin Informatie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">Locatie</div>
                <div className="text-sm text-gray-600">{garden.location}</div>
              </div>
            </div>
            <div>
              <div className="font-medium">Grootte</div>
              <div className="text-sm text-gray-600">
                {garden.total_area || 
                  (garden.length && garden.width && 
                    `${(parseFloat(garden.length) * parseFloat(garden.width)).toFixed(1)} m²`
                  ) || 'Niet opgegeven'
                }
              </div>
            </div>
            <div>
              <div className="font-medium">Plantvakken</div>
              <div className="text-sm text-gray-600">{plantBeds.length}</div>
            </div>
            <div>
              <div className="font-medium">Totaal bloemen</div>
              <div className="text-sm text-gray-600">
                {plantBeds.reduce((total, bed) => total + bed.plants.length, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showVisualView ? (
        /* Visual Garden Layout */
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-blue-600" />
                Tuin Layout - Op Schaal
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-green-200">
              <div
                className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  maxWidth: "100%",
                }}
              >
                {/* Grid */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #10b98120 1px, transparent 1px),
                      linear-gradient(to bottom, #10b98120 1px, transparent 1px)
                    `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                  }}
                />

                {/* Plant Beds */}
                {plantBeds.map((bed) => (
                  <Link
                    key={bed.id}
                    href={`/gardens/${garden.id}/plantvak-view/${bed.id}`}
                    className="absolute border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    style={{
                      left: bed.position_x || 100,
                      top: bed.position_y || 100,
                      width: bed.visual_width || 150,
                      height: bed.visual_height || 100,
                    }}
                  >
                    <div className={`w-full h-full rounded-lg ${getPlantBedColor(bed.id)} flex flex-col justify-between p-2`}>
                      <div className="text-xs font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
                        {bed.name}
                      </div>
                      <div className="text-xs bg-white/80 px-2 py-1 rounded flex items-center justify-between">
                        <span>{bed.plants.length} 🌸</span>
                        <span>{bed.size || 'Onbekend'}</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Empty State */}
                {plantBeds.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Leaf className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Nog geen plantvakken</h3>
                      <p className="text-gray-600 mb-4">Voeg plantvakken toe om je tuin in te richten.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 <strong>Tip:</strong> Klik op een plantvak om de bloemen te beheren</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View of Plant Beds */
        plantBeds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Nog geen plantvakken
              </h3>
              <p className="text-gray-500 mb-6">
                Voeg je eerste plantvak toe om bloemen te kunnen planten.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Eerste Plantvak Maken
              </Button>
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
                    <Link href={`/gardens/${garden.id}/plantvak-view/${bed.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Plantvak Beheren
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}
