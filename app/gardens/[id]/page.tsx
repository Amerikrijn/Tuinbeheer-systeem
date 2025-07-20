"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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
  Save,
  Edit,
  Sun,
  CloudSun,
  Cloud,
} from "lucide-react"
import { getGarden, getPlantBeds, createPlantBed, updatePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GRID_SIZE = 20
const PLANTVAK_MIN_WIDTH = 100
const PLANTVAK_MIN_HEIGHT = 80

interface PlantBedPosition {
  id: string
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
}

export default function GardenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [showVisualView, setShowVisualView] = useState(true)
  const [draggedBed, setDraggedBed] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasChanges, setHasChanges] = useState(false)
  const [isAddingPlantBed, setIsAddingPlantBed] = useState(false)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // New plant bed form state
  const [newPlantBed, setNewPlantBed] = useState({
    name: '',
    size: '',
    description: '',
    sun_exposure: 'full-sun' as 'full-sun' | 'partial-sun' | 'shade',
    soil_type: ''
  })

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

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, bedId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const bed = plantBeds.find(b => b.id === bedId)
    if (!bed) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const offsetX = e.clientX - rect.left - (bed.position_x || 100) * scale
    const offsetY = e.clientY - rect.top - (bed.position_y || 100) * scale

    setDraggedBed(bedId)
    setDragOffset({ x: offsetX / scale, y: offsetY / scale })
  }, [plantBeds, scale])

  // Handle drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedBed || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min((e.clientX - rect.left) / scale - dragOffset.x, CANVAS_WIDTH - PLANTVAK_MIN_WIDTH))
    const y = Math.max(0, Math.min((e.clientY - rect.top) / scale - dragOffset.y, CANVAS_HEIGHT - PLANTVAK_MIN_HEIGHT))

    setPlantBeds(prev => prev.map(bed => 
      bed.id === draggedBed 
        ? { ...bed, position_x: x, position_y: y }
        : bed
    ))
    setHasChanges(true)
  }, [draggedBed, dragOffset, scale])

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setDraggedBed(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  // Add event listeners for drag
  useEffect(() => {
    if (draggedBed) {
      const handleMouseMoveGlobal = (e: MouseEvent) => {
        const mockReactEvent = {
          clientX: e.clientX,
          clientY: e.clientY
        } as React.MouseEvent
        handleMouseMove(mockReactEvent)
      }
      
      document.addEventListener('mousemove', handleMouseMoveGlobal)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedBed, handleMouseMove, handleMouseUp])

  // Save layout changes
  const saveLayout = async () => {
    if (!hasChanges) return

    setSaving(true)
    try {
      const updates = plantBeds.map(bed => ({
        id: bed.id,
        position_x: bed.position_x,
        position_y: bed.position_y,
        visual_width: bed.visual_width,
        visual_height: bed.visual_height
      }))

      await Promise.all(
        updates.map(update => 
          updatePlantBed(update.id, {
            position_x: update.position_x,
            position_y: update.position_y,
            visual_width: update.visual_width,
            visual_height: update.visual_height
          })
        )
      )

      setHasChanges(false)
      toast({
        title: "Layout opgeslagen",
        description: "De tuinindeling is succesvol opgeslagen.",
      })
    } catch (error) {
      console.error("Error saving layout:", error)
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de layout.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Add new plant bed
  const addPlantBed = async () => {
    if (!garden || !newPlantBed.name || !newPlantBed.size) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      })
      return
    }

    try {
      // Find a good position for the new plant bed
      const existingPositions = plantBeds.map(bed => ({
        x: bed.position_x || 100,
        y: bed.position_y || 100,
        width: bed.visual_width || 150,
        height: bed.visual_height || 100
      }))

      let newX = 100
      let newY = 100
      let attempts = 0
      const maxAttempts = 50

      // Simple positioning algorithm - try to find free space
      while (attempts < maxAttempts) {
        const overlaps = existingPositions.some(pos => 
          newX < pos.x + pos.width &&
          newX + PLANTVAK_MIN_WIDTH > pos.x &&
          newY < pos.y + pos.height &&
          newY + PLANTVAK_MIN_HEIGHT > pos.y
        )

        if (!overlaps) break

        newX += 50
        if (newX + PLANTVAK_MIN_WIDTH > CANVAS_WIDTH) {
          newX = 100
          newY += 50
        }
        if (newY + PLANTVAK_MIN_HEIGHT > CANVAS_HEIGHT) {
          newY = 100
          newX = Math.random() * (CANVAS_WIDTH - PLANTVAK_MIN_WIDTH)
          newY = Math.random() * (CANVAS_HEIGHT - PLANTVAK_MIN_HEIGHT)
        }
        attempts++
      }

      const plantBed = await createPlantBed({
        garden_id: garden.id,
        name: newPlantBed.name,
        size: newPlantBed.size,
        description: newPlantBed.description,
        sun_exposure: newPlantBed.sun_exposure,
        soil_type: newPlantBed.soil_type,
      })

      if (plantBed) {
        // Update the plant bed with position
        const updatedBed = await updatePlantBed(plantBed.id, {
          position_x: newX,
          position_y: newY,
          visual_width: 150,
          visual_height: 100
        })

        if (updatedBed) {
          const bedWithPlants: PlantBedWithPlants = {
            ...updatedBed,
            position_x: updatedBed.position_x ?? newX,
            position_y: updatedBed.position_y ?? newY,
            visual_width: updatedBed.visual_width ?? 150,
            visual_height: updatedBed.visual_height ?? 100,
            rotation: updatedBed.rotation ?? 0,
            z_index: updatedBed.z_index ?? 0,
            color_code: updatedBed.color_code ?? '',
            visual_updated_at: updatedBed.visual_updated_at ?? new Date().toISOString(),
            plants: []
          }
          setPlantBeds(prev => [...prev, bedWithPlants])
          setIsAddingPlantBed(false)
          setNewPlantBed({
            name: '',
            size: '',
            description: '',
            sun_exposure: 'full-sun',
            soil_type: ''
          })
          toast({
            title: "Plantvak toegevoegd",
            description: `${plantBed.name} is toegevoegd aan de tuin.`,
          })
        }
      }
    } catch (error) {
      console.error("Error creating plant bed:", error)
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het toevoegen van het plantvak.",
        variant: "destructive",
      })
    }
  }

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case 'full-sun': return <Sun className="h-4 w-4 text-yellow-500" />
      case 'partial-sun': return <CloudSun className="h-4 w-4 text-orange-500" />
      case 'shade': return <Cloud className="h-4 w-4 text-gray-500" />
      default: return <Sun className="h-4 w-4 text-yellow-500" />
    }
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
              Klik op een plantvak om de bloemen te beheren
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
          <Dialog open={isAddingPlantBed} onOpenChange={setIsAddingPlantBed}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Plantvak Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nieuw Plantvak Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuw plantvak toe aan je tuin. Je kunt het later verplaatsen in de visuele weergave.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Naam *
                  </label>
                  <Input
                    id="name"
                    value={newPlantBed.name}
                    onChange={(e) => setNewPlantBed(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijvoorbeeld: Voorste border"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="size" className="text-sm font-medium">
                    Grootte *
                  </label>
                  <Input
                    id="size"
                    value={newPlantBed.size}
                    onChange={(e) => setNewPlantBed(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="Bijvoorbeeld: 2m x 1.5m"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="sun_exposure" className="text-sm font-medium">
                    Zonligging
                  </label>
                  <Select
                    value={newPlantBed.sun_exposure}
                    onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') => 
                      setNewPlantBed(prev => ({ ...prev, sun_exposure: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-sun">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          Volle zon
                        </div>
                      </SelectItem>
                      <SelectItem value="partial-sun">
                        <div className="flex items-center gap-2">
                          <CloudSun className="h-4 w-4 text-orange-500" />
                          Halfschaduw
                        </div>
                      </SelectItem>
                      <SelectItem value="shade">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-gray-500" />
                          Schaduw
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="soil_type" className="text-sm font-medium">
                    Grondsoort
                  </label>
                  <Input
                    id="soil_type"
                    value={newPlantBed.soil_type}
                    onChange={(e) => setNewPlantBed(prev => ({ ...prev, soil_type: e.target.value }))}
                    placeholder="Bijvoorbeeld: Kleigrond, zandgrond"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Beschrijving
                  </label>
                  <Textarea
                    id="description"
                    value={newPlantBed.description}
                    onChange={(e) => setNewPlantBed(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optionele beschrijving van het plantvak"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPlantBed(false)}>
                  Annuleren
                </Button>
                <Button onClick={addPlantBed} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Toevoegen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {hasChanges && (
            <Button onClick={saveLayout} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Opslaan..." : "Layout Opslaan"}
            </Button>
          )}
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
                ref={canvasRef}
                className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 cursor-crosshair"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  maxWidth: "100%",
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
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
                  <div
                    key={bed.id}
                    className={`absolute border-2 rounded-lg cursor-move transition-all hover:shadow-xl hover:scale-105 hover:border-green-500 group ${
                      draggedBed === bed.id ? 'shadow-2xl scale-110 border-green-500 z-50' : ''
                    }`}
                    style={{
                      left: bed.position_x || 100,
                      top: bed.position_y || 100,
                      width: bed.visual_width || 150,
                      height: bed.visual_height || 100,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, bed.id)}
                  >
                    <Link
                      href={`/gardens/${garden.id}/plantvak-view/${bed.id}`}
                      className="block w-full h-full"
                      onClick={(e) => {
                        if (draggedBed) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <div className={`w-full h-full rounded-lg ${getPlantBedColor(bed.id)} flex flex-col justify-between p-2 group-hover:bg-green-50 transition-colors`}>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow-sm">
                            {bed.name}
                          </div>
                          {bed.sun_exposure && (
                            <div className="bg-white/90 p-1 rounded shadow-sm">
                              {getSunExposureIcon(bed.sun_exposure)}
                            </div>
                          )}
                        </div>
                        <div className="text-xs bg-white/90 px-2 py-1 rounded shadow-sm flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>{bed.plants.length}</span>
                            <span>🌸</span>
                          </span>
                          <span>{bed.size || 'Onbekend'}</span>
                        </div>
                        <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                      </div>
                    </Link>
                  </div>
                ))}

                {/* Empty State */}
                {plantBeds.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/80 p-8 rounded-lg border-2 border-dashed border-gray-300">
                      <Leaf className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Nog geen plantvakken</h3>
                      <p className="text-gray-600 mb-4">Voeg je eerste plantvak toe om te beginnen met tuinieren.</p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setIsAddingPlantBed(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Eerste Plantvak Maken
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
              <p>💡 <strong>Tip:</strong> Sleep plantvakken om ze te verplaatsen, klik om bloemen te beheren</p>
              <div className="flex items-center gap-4">
                <p className="text-xs">Zoom: {Math.round(scale * 100)}%</p>
                {hasChanges && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Niet opgeslagen wijzigingen
                  </Badge>
                )}
              </div>
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
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsAddingPlantBed(true)}
              >
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
                      <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                        {bed.name}
                        {bed.sun_exposure && getSunExposureIcon(bed.sun_exposure)}
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
