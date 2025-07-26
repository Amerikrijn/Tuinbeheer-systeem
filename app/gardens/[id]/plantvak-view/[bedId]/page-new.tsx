"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Flower, Plus, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { getGarden, getPlantBeds, getPlantsWithPositions, updatePlantPosition } from "@/lib/database"
import type { Garden, PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"
import { UnifiedPlantvakDetail } from "@/components/unified-plantvak-system"

export default function NewPlantvakDetailPage() {
  const router = useRouter()
  const params = useParams()
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [plants, setPlants] = useState<PlantWithPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [selectedFlower, setSelectedFlower] = useState<string | null>(null)

  // Plantvak detail canvas dimensions
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
        
        // Find the specific plant bed
        const specificBed = plantBedsData.find(bed => bed.id === params.bedId)
        setPlantBed(specificBed || null)
        
        // Load plants from database
        if (params.bedId) {
          const plantsData = await getPlantsWithPositions(params.bedId as string)
          setPlants(plantsData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setGarden(null)
        setPlantBed(null)
        setPlants([])
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id && params.bedId) {
      loadData()
    }
  }, [params.id, params.bedId])

  const handleFlowerClick = useCallback((flowerId: string) => {
    console.log('Flower clicked:', flowerId)
    setSelectedFlower(prev => prev === flowerId ? null : flowerId)
  }, [])

  const handleFlowerMove = useCallback(async (flowerId: string, newPercentX: number, newPercentY: number) => {
    console.log('Moving flower:', flowerId, 'to', newPercentX, newPercentY)
    
    // Convert percentage back to absolute pixels for database storage
    // This uses the same reference system as the old code for database compatibility
    const absoluteX = (newPercentX / 100) * 400  // Reference plantvak width
    const absoluteY = (newPercentY / 100) * 300  // Reference plantvak height
    
    try {
      // Update in database
      await updatePlantPosition(flowerId, {
        position_x: absoluteX,
        position_y: absoluteY
      })
      
      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === flowerId 
          ? { ...plant, position_x: absoluteX, position_y: absoluteY }
          : plant
      ))
      
      console.log('✅ Flower position updated successfully')
    } catch (error) {
      console.error('❌ Error updating flower position:', error)
    }
  }, [])

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))
  const resetView = () => setScale(1)

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!plantBed || !garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Flower className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <p className="text-gray-600 mb-4">Het plantvak dat je zoekt bestaat niet.</p>
          <Button onClick={() => router.push(`/gardens/${params.id}`)} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Tuin
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
            onClick={() => router.push(`/gardens/${params.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Tuin
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flower className="h-8 w-8 text-pink-600" />
              {plantBed.name}
            </h1>
            <p className="text-gray-600">
              <span className="text-sm font-medium text-green-600">
                • {plantBed.size || 'Onbekende grootte'} • {plants.length} bloemen
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Bloem Toevoegen
          </Button>
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

      {/* New Unified Plantvak Detail */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Flower className="h-5 w-5 text-purple-600" />
              Plantvak Detail (Nieuwe Unified System)
            </CardTitle>
            <div className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}% | {selectedFlower ? 'Bloem geselecteerd' : 'Geen selectie'}
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
              <UnifiedPlantvakDetail
                plantBed={plantBed}
                plants={plants}
                containerWidth={CANVAS_WIDTH}
                containerHeight={CANVAS_HEIGHT}
                onFlowerClick={handleFlowerClick}
                onFlowerMove={handleFlowerMove}
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🎯 Perfect Position Consistency</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✅ <strong>Same coordinate system:</strong> Garden overview and detail view use identical positioning</li>
              <li>✅ <strong>Free flower movement:</strong> Click and drag flowers anywhere within the plantvak</li>
              <li>✅ <strong>Real-time sync:</strong> Changes immediately saved to database</li>
              <li>✅ <strong>Visual consistency:</strong> What you see here matches exactly with garden overview</li>
            </ul>
            {selectedFlower && (
              <div className="mt-2 p-2 bg-white border border-green-300 rounded">
                <p className="text-xs text-green-700">
                  <strong>Selected:</strong> {plants.find(p => p.id === selectedFlower)?.name || 'Unknown flower'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
