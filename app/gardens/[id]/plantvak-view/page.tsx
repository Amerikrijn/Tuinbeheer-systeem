"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings,
  Leaf,
  TreePine,
  Plus,
  Move,
  Maximize,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

interface PlantPosition {
  id: string
  x: number
  y: number
  scale: number
  rotation: number
}

interface PlantBedPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  plants: PlantPosition[]
}

export default function PlantvakViewPage() {
  const params = useParams()
  const router = useRouter()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [plantBedPositions, setPlantBedPositions] = useState<PlantBedPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [selectedPlantBed, setSelectedPlantBed] = useState<string | null>(null)
  const [draggedPlant, setDraggedPlant] = useState<string | null>(null)

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
        
        // Initialize plant bed positions
        const initialPositions: PlantBedPosition[] = plantBedsData.map((bed, index) => ({
          id: bed.id,
          x: (index % 3) * 300 + 50,
          y: Math.floor(index / 3) * 200 + 50,
          width: bed.visual_width || 250,
          height: bed.visual_height || 150,
          plants: bed.plants.map((plant, plantIndex) => ({
            id: plant.id,
            x: (plantIndex % 3) * 60 + 20,
            y: Math.floor(plantIndex / 3) * 60 + 20,
            scale: 1,
            rotation: 0
          }))
        }))
        setPlantBedPositions(initialPositions)
      } catch (error) {
        console.error("Error loading data:", error)
        setErrorMessage("Fout bij het laden van de gegevens")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    setErrorMessage(null)

    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveMessage("Plantvak layout succesvol opgeslagen!")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setErrorMessage("Fout bij het opslaan van de layout")
      console.error("Save error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handlePlantBedMove = (bedId: string, newX: number, newY: number) => {
    setPlantBedPositions(prev => 
      prev.map(bed => 
        bed.id === bedId 
          ? { ...bed, x: newX, y: newY }
          : bed
      )
    )
  }

  const handlePlantMove = (bedId: string, plantId: string, newX: number, newY: number) => {
    setPlantBedPositions(prev => 
      prev.map(bed => 
        bed.id === bedId 
          ? {
              ...bed,
              plants: bed.plants.map(plant =>
                plant.id === plantId
                  ? { ...plant, x: newX, y: newY }
                  : plant
              )
            }
          : bed
      )
    )
  }

  const handlePlantScale = (bedId: string, plantId: string, scale: number) => {
    setPlantBedPositions(prev => 
      prev.map(bed => 
        bed.id === bedId 
          ? {
              ...bed,
              plants: bed.plants.map(plant =>
                plant.id === plantId
                  ? { ...plant, scale: Math.max(0.5, Math.min(2, scale)) }
                  : plant
              )
            }
          : bed
      )
    )
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))
  const handleResetZoom = () => setZoom(1)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <TreePine className="h-6 w-6 text-green-600" />
                  {garden.name} - Plantvak Weergave
                </h1>
                <p className="text-gray-600">Visuele weergave van plantvakken met verplaatsbare planten</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomOut}
                className="bg-white/80"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetZoom}
                className="bg-white/80"
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomIn}
                className="bg-white/80"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Opslaan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <Alert className="mx-4 mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Canvas */}
      <div className="flex-1 p-4">
        <div 
          className="relative bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{ 
            height: 'calc(100vh - 200px)',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Garden Canvas */}
          <div className="absolute inset-0 bg-green-50/50">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #10b981 1px, transparent 1px),
                  linear-gradient(to bottom, #10b981 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
            
            {/* Plant Beds */}
            {plantBedPositions.map((bedPosition) => {
              const bed = plantBeds.find(b => b.id === bedPosition.id)
              if (!bed) return null
              
              return (
                <div
                  key={bedPosition.id}
                  className={`absolute border-2 rounded-lg cursor-move transition-all ${
                    selectedPlantBed === bedPosition.id 
                      ? 'border-green-500 bg-green-100/50 shadow-lg' 
                      : 'border-gray-300 bg-white/70 hover:border-green-400'
                  }`}
                  style={{
                    left: bedPosition.x,
                    top: bedPosition.y,
                    width: bedPosition.width,
                    height: bedPosition.height
                  }}
                  onClick={() => setSelectedPlantBed(bedPosition.id)}
                  onMouseDown={(e) => {
                    const startX = e.clientX - bedPosition.x
                    const startY = e.clientY - bedPosition.y
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      handlePlantBedMove(bedPosition.id, e.clientX - startX, e.clientY - startY)
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                >
                  {/* Plant Bed Header */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="outline" className="bg-white/80 text-xs">
                      {bed.id}
                    </Badge>
                  </div>
                  
                  {/* Plant Bed Title */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="text-xs font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
                      {bed.name}
                    </div>
                  </div>
                  
                  {/* Plants */}
                  {bedPosition.plants.map((plantPos) => {
                    const plant = bed.plants.find(p => p.id === plantPos.id)
                    if (!plant) return null
                    
                    return (
                      <div
                        key={plantPos.id}
                        className={`absolute cursor-move transition-all ${
                          draggedPlant === plantPos.id 
                            ? 'z-20 shadow-lg' 
                            : 'z-10 hover:shadow-md'
                        }`}
                        style={{
                          left: plantPos.x,
                          top: plantPos.y,
                          transform: `scale(${plantPos.scale}) rotate(${plantPos.rotation}deg)`,
                          transformOrigin: 'center'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setDraggedPlant(plantPos.id)
                          
                          const startX = e.clientX - plantPos.x
                          const startY = e.clientY - plantPos.y
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            handlePlantMove(bedPosition.id, plantPos.id, e.clientX - startX, e.clientY - startY)
                          }
                          
                          const handleMouseUp = () => {
                            setDraggedPlant(null)
                            document.removeEventListener('mousemove', handleMouseMove)
                            document.removeEventListener('mouseup', handleMouseUp)
                          }
                          
                          document.addEventListener('mousemove', handleMouseMove)
                          document.addEventListener('mouseup', handleMouseUp)
                        }}
                        onWheel={(e) => {
                          e.preventDefault()
                          const delta = e.deltaY > 0 ? -0.1 : 0.1
                          handlePlantScale(bedPosition.id, plantPos.id, plantPos.scale + delta)
                        }}
                      >
                        {/* Plant Visual */}
                        <div className="w-12 h-12 bg-green-200 border-2 border-green-400 rounded-full flex items-center justify-center shadow-sm">
                          <Leaf className="h-6 w-6 text-green-600" />
                        </div>
                        
                        {/* Plant Name */}
                        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs bg-white/90 px-2 py-1 rounded shadow text-center whitespace-nowrap">
                          {plant.name}
                        </div>
                        
                        {/* Plant Status */}
                        <div className="absolute -top-2 -right-2">
                          <div className={`w-4 h-4 rounded-full border-2 border-white ${
                            plant.status === 'healthy' ? 'bg-green-500' :
                            plant.status === 'needs_attention' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-blue-600" />
              <span>Sleep plantvakken en planten om ze te verplaatsen</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize className="h-4 w-4 text-purple-600" />
              <span>Scroll op planten om ze te schalen</span>
            </div>
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-green-600" />
              <span>Sla wijzigingen op met de opslaan knop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}