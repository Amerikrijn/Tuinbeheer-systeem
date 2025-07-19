"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Info,
  Sun,
  CloudSun,
  Cloud,
  ArrowLeft,
  Flower,
  Plus,
  Leaf,
} from "lucide-react"
import { getMockPlantBeds, type PlantBed, type Plant } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PlantPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
}

const GRID_SIZE = 20
const SCALE_MIN = 0.5
const SCALE_MAX = 2
const PLANT_BLOCK_SIZE = 40

export default function PlantBedLayoutPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [plantPositions, setPlantPositions] = useState<PlantPosition[]>([])
  const [scale, setScale] = useState(1)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [draggedPlant, setDraggedPlant] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const beds = getMockPlantBeds()
        const bed = beds.find((b) => b.id === params.id)
        if (bed) {
          setPlantBed(bed)
          
          // Generate initial positions for plants
          const initialPositions: PlantPosition[] = bed.plants.map((plant, index) => ({
            id: plant.id,
            x: 50 + (index % 5) * (PLANT_BLOCK_SIZE + 10),
            y: 50 + Math.floor(index / 5) * (PLANT_BLOCK_SIZE + 10),
            width: PLANT_BLOCK_SIZE,
            height: PLANT_BLOCK_SIZE,
          }))
          setPlantPositions(initialPositions)
        }
      } catch (error) {
        console.error("Error loading plant bed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const getPlantColor = (plant: Plant) => {
    const colorMap: { [key: string]: string } = {
      'Geel': 'bg-yellow-400',
      'Rood': 'bg-red-400',
      'Blauw': 'bg-blue-400',
      'Wit': 'bg-white border-2 border-gray-300',
      'Paars': 'bg-purple-400',
      'Roze': 'bg-pink-400',
      'Oranje': 'bg-orange-400',
    }
    return colorMap[plant.color] || 'bg-green-400'
  }

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'healthy': 'border-green-500',
      'needs_attention': 'border-yellow-500',
      'flowering': 'border-purple-500',
      'dormant': 'border-gray-500',
      'diseased': 'border-red-500',
    }
    return statusMap[status] || 'border-green-500'
  }

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return <Sun className="h-4 w-4 text-yellow-500" />
      case "partial-sun":
        return <CloudSun className="h-4 w-4 text-orange-500" />
      case "shade":
        return <Cloud className="h-4 w-4 text-gray-500" />
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  const onMouseDown = (e: React.MouseEvent, plantId: string) => {
    e.preventDefault()
    const position = plantPositions.find((p) => p.id === plantId)
    if (!position || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    setDraggedPlant(plantId)
    setDragOffset({
      x: (e.clientX - rect.left) / scale - position.x,
      y: (e.clientY - rect.top) / scale - position.y,
    })
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggedPlant || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const newX = (e.clientX - rect.left) / scale - dragOffset.x
    const newY = (e.clientY - rect.top) / scale - dragOffset.y
    
    // Snap to grid
    const snapX = Math.round(newX / GRID_SIZE) * GRID_SIZE
    const snapY = Math.round(newY / GRID_SIZE) * GRID_SIZE
    
    setPlantPositions((prev) =>
      prev.map((p) => (p.id === draggedPlant ? { ...p, x: Math.max(0, snapX), y: Math.max(0, snapY) } : p))
    )
    setHasChanges(true)
  }

  const onMouseUp = () => {
    setDraggedPlant(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, SCALE_MAX))
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, SCALE_MIN))
  const resetView = () => {
    setScale(1)
    setHasChanges(false)
  }

  const saveLayout = async () => {
    try {
      // Mock save - in real app, this would save to database
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Layout opgeslagen",
        description: "De planten layout is succesvol opgeslagen.",
      })
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving layout:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de layout.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse h-12 bg-gray-200 rounded" />
        <div className="animate-pulse h-96 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Plantvak niet gevonden</h1>
          <p className="text-gray-600 mt-2">Het opgegeven plantvak bestaat niet.</p>
          <Link href="/plant-beds">
            <Button className="mt-4">Terug naar Plantvakken</Button>
          </Link>
        </div>
      </div>
    )
  }

  const plantsInBed = plantBed.plants || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/plant-beds/${plantBed.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Plantvak
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Grid3X3 className="h-8 w-8 text-green-600" />
              {plantBed.name} Layout
            </h1>
            <p className="text-gray-600">Sleep planten om ze te verplaatsen</p>
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
          <Button onClick={saveLayout} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* Plant Bed Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Plantvak Informatie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getSunExposureIcon(plantBed.sunExposure)}
              <div>
                <div className="font-medium">Zonlicht</div>
                <div className="text-sm text-gray-600">{plantBed.sunExposure}</div>
              </div>
            </div>
            <div>
              <div className="font-medium">Grootte</div>
              <div className="text-sm text-gray-600">{plantBed.size}</div>
            </div>
            <div>
              <div className="font-medium">Grondsoort</div>
              <div className="text-sm text-gray-600">{plantBed.soilType}</div>
            </div>
            <div>
              <div className="font-medium">Aantal planten</div>
              <div className="text-sm text-gray-600">{plantsInBed.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            Planten Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div
              ref={containerRef}
              className="relative bg-green-50 border-2 border-dashed border-green-200 rounded-lg overflow-hidden"
              style={{
                width: "100%",
                height: "500px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #10b98120 1px, transparent 1px),
                    linear-gradient(to bottom, #10b98120 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
              />

              {/* Plants */}
              {plantPositions.map((position) => {
                const plant = plantsInBed.find((p) => p.id === position.id)
                if (!plant) return null

                return (
                  <div
                    key={position.id}
                    className={`absolute cursor-move rounded-lg border-2 ${getPlantColor(plant)} ${getStatusColor(plant.status)} ${
                      draggedPlant === position.id ? "shadow-2xl ring-2 ring-green-500 z-10" : "shadow-md"
                    } transition-all duration-200 hover:shadow-lg flex items-center justify-center text-xs font-medium text-white`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: position.width,
                      height: position.height,
                    }}
                    onMouseDown={(e) => onMouseDown(e, position.id)}
                    onClick={() => !draggedPlant && setSelectedPlant(plant)}
                  >
                    <div className="text-center">
                      <Flower className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs truncate px-1">{plant.name}</div>
                    </div>
                  </div>
                )
              })}

              {/* Empty State */}
              {plantsInBed.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Flower className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen planten</h3>
                    <p className="text-gray-600 mb-4">Begin met het toevoegen van planten aan dit plantvak.</p>
                    <Link href={`/plant-beds/${plantBed.id}/plants/new`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Eerste Plant Toevoegen
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Plant Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 border-2 border-green-500 rounded"></div>
                  <span>Gezond</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-500 rounded"></div>
                  <span>Aandacht nodig</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-400 border-2 border-purple-500 rounded"></div>
                  <span>Bloeiend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 border-2 border-red-500 rounded"></div>
                  <span>Ziek</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Instructies</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Sleep planten om ze te verplaatsen</div>
                <div>• Klik op een plant voor meer informatie</div>
                <div>• Gebruik zoom knoppen om in/uit te zoomen</div>
                <div>• Vergeet niet te opslaan na wijzigingen</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plant Details Dialog */}
      <Dialog open={!!selectedPlant} onOpenChange={() => setSelectedPlant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flower className="h-5 w-5" />
              {selectedPlant?.name}
            </DialogTitle>
            <DialogDescription>
              Plant details en informatie
            </DialogDescription>
          </DialogHeader>
          {selectedPlant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Kleur:</span>
                  <div className="text-sm text-gray-600">{selectedPlant.color}</div>
                </div>
                <div>
                  <span className="text-sm font-medium">Hoogte:</span>
                  <div className="text-sm text-gray-600">{selectedPlant.height}cm</div>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="secondary">{selectedPlant.status}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Geplant:</span>
                  <div className="text-sm text-gray-600">
                    {new Date(selectedPlant.plantingDate).toLocaleDateString("nl-NL")}
                  </div>
                </div>
              </div>
              {selectedPlant.notes && (
                <div>
                  <span className="text-sm font-medium">Notities:</span>
                  <div className="text-sm text-gray-600 mt-1">{selectedPlant.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}