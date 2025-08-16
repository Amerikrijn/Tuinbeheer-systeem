"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useNavigation } from "@/hooks/use-navigation"
import { useViewPreference } from "@/hooks/use-view-preference"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  TreePine,
  Plus,
  Leaf,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Edit,
  Sun,
  CloudSun,
  Cloud,
  Trash2,
} from "lucide-react"
import { getGarden, getPlantBeds, createPlantBed, updatePlantBed, deletePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { 
  METERS_TO_PIXELS, 
  GARDEN_CANVAS_WIDTH as DEFAULT_CANVAS_WIDTH,
  GARDEN_CANVAS_HEIGHT as DEFAULT_CANVAS_HEIGHT,
  PLANTVAK_MIN_WIDTH,
  PLANTVAK_MIN_HEIGHT,
  metersToPixels,
  parsePlantBedDimensions
} from "@/lib/scaling-constants"
import { FlowerVisualization } from "@/components/flower-visualization"

// PlantBedPosition interface removed - not used in simplified version

export default function GardenDetailPage() {
  const { goBack, navigateTo } = useNavigation()
  const { isVisualView, toggleView } = useViewPreference()
  const params = useParams()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [selectedBed, setSelectedBed] = useState<string | null>(null)
  
  // Drag and rotate state removed - simplified for basic functionality
  
  // hasChanges removed - not used in simplified version
  const [isAddingPlantBed, setIsAddingPlantBed] = useState(false)
  const [deletingBedId, setDeletingBedId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditingGarden, setIsEditingGarden] = useState(false)
  const [gardenForm, setGardenForm] = useState({
    name: '',
    length: '',
    width: '',
    description: ''
  })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Calculate canvas size based on garden dimensions
  const getCanvasSize = () => {
    if (!garden?.length || !garden?.width) {
      return { 
        width: DEFAULT_CANVAS_WIDTH, 
        height: DEFAULT_CANVAS_HEIGHT,
        widthMeters: DEFAULT_CANVAS_WIDTH / METERS_TO_PIXELS,
        heightMeters: DEFAULT_CANVAS_HEIGHT / METERS_TO_PIXELS
      }
    }
    
    const lengthMeters = parseFloat(garden.length)
    const widthMeters = parseFloat(garden.width)
    
    if (isNaN(lengthMeters) || isNaN(widthMeters) || lengthMeters <= 0 || widthMeters <= 0) {
      return { 
        width: DEFAULT_CANVAS_WIDTH, 
        height: DEFAULT_CANVAS_HEIGHT,
        widthMeters: DEFAULT_CANVAS_WIDTH / METERS_TO_PIXELS,
        heightMeters: DEFAULT_CANVAS_HEIGHT / METERS_TO_PIXELS
      }
    }
    
    // Use exact pixel conversion for garden dimensions
    const widthPixels = metersToPixels(lengthMeters)
    const heightPixels = metersToPixels(widthMeters)
    
    console.log("🏡 Tuin schaal debug:", {
      lengthMeters,
      widthMeters,
      widthPixels,
      heightPixels,
      metersToPixelsConstant: METERS_TO_PIXELS
    })
    
    return {
      width: widthPixels,
      height: heightPixels,
      widthMeters: lengthMeters,
      heightMeters: widthMeters
    }
  }

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, widthMeters, heightMeters } = getCanvasSize()

  // New plant bed form state with length and width
  const [newPlantBed, setNewPlantBed] = useState({
    length: '', // in meters
    width: '', // in meters
    description: '',
    sun_exposure: 'full-sun' as 'full-sun' | 'partial-sun' | 'shade',
    soil_type: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔍 Loading garden data:", { paramsId: params.id, type: typeof params.id })
        setLoading(true)
        const [gardenData, plantBedsData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBeds(params.id as string),
        ])
        console.log("✅ Garden loaded:", { id: gardenData?.id, name: gardenData?.name })
        setGarden(gardenData)
        
        // Initialize garden form
        if (gardenData) {
          setGardenForm({
            name: gardenData.name || '',
            length: gardenData.length || '',
            width: gardenData.width || '',
            description: gardenData.description || ''
          })
        }
        
        // Process plant beds to ensure they have correct visual dimensions
        const processedBeds = await Promise.all(plantBedsData.map(async bed => {
          let visualWidth = bed.visual_width
          let visualHeight = bed.visual_height
          
          // Always recalculate from size to ensure correct scaling
          if (bed.size) {
            const dims = getDimensionsFromSize(bed.size)
            visualWidth = dims.width
            visualHeight = dims.height
            
            // Update the database with recalculated dimensions if they're different
            if (bed.visual_width !== visualWidth || bed.visual_height !== visualHeight) {
              console.log(`🔧 Updating plantvak ${bed.name} dimensions:`, {
                oldWidth: bed.visual_width,
                oldHeight: bed.visual_height,
                newWidth: visualWidth,
                newHeight: visualHeight,
                size: bed.size
              })
              try {
                await updatePlantBed(bed.id, {
                  visual_width: visualWidth,
                  visual_height: visualHeight
                })
                console.log(`✅ Successfully updated plantvak ${bed.name} dimensions`)
              } catch (error) {
                console.error(`❌ Failed to update plantvak ${bed.name} dimensions:`, error)
              }
            }
          } else if (!visualWidth || !visualHeight) {
            visualWidth = PLANTVAK_MIN_WIDTH
            visualHeight = PLANTVAK_MIN_HEIGHT
          }
          
          return {
            ...bed,
            visual_width: visualWidth,
            visual_height: visualHeight,
            position_x: bed.position_x ?? 100,
            position_y: bed.position_y ?? 100,
            rotation: bed.rotation ?? 0,
            z_index: bed.z_index ?? 0,
            color_code: bed.color_code ?? '',
            visual_updated_at: bed.visual_updated_at ?? new Date().toISOString(),
          }
        }))
        
        setPlantBeds(processedBeds)
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

  // Convert dimensions from string (e.g., "2m x 1.5m" or "2 x 1.5") to pixels
  const getDimensionsFromSize = (size: string) => {
    const dimensions = parsePlantBedDimensions(size)
    if (dimensions) {
      console.log(`✅ Plantvak dimensies: ${size} -> ${dimensions.lengthPixels}px × ${dimensions.widthPixels}px`)
      // Fix: In size strings like "4x3 meter", the first number (lengthMeters) is the visual width,
      // and the second number (widthMeters) is the visual height
      return {
        width: dimensions.lengthPixels,  // First number = visual width (horizontal)
        height: dimensions.widthPixels   // Second number = visual height (vertical)
      }
    }
    console.log("❌ Plantvak dimensies niet geparsed, gebruik standaard 2x2m:", size)
    // Default to 2x2 meters instead of minimum size
    return {
      width: metersToPixels(2),
      height: metersToPixels(2)
    }
  }

  // Add new plant bed
  const addPlantBed = async () => {
    console.log("🔍 Adding plant bed:", { garden: garden?.id, newPlantBed })
    
    if (!garden || !newPlantBed.length || !newPlantBed.width) {
      console.log("❌ Validation failed:", { 
        garden: !!garden, 
        gardenId: garden?.id,
        length: newPlantBed.length, 
        width: newPlantBed.width 
      })
      return
    }

    try {
      // Calculate dimensions from length and width
      const length = parseFloat(newPlantBed.length)
      const width = parseFloat(newPlantBed.width)
      
      if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
        return
      }

      const visualWidth = metersToPixels(length)
      const visualHeight = metersToPixels(width)
      
      console.log("📐 Plantvak afmetingen:", {
        length: `${length}m`,
        width: `${width}m`, 
        visualWidth: `${visualWidth}px (horizontaal)`,
        visualHeight: `${visualHeight}px (verticaal)`,
        ratio: `${(visualWidth / visualHeight).toFixed(2)}:1`,
        sizeString: `${length}m x ${width}m`
      })

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
          newX + visualWidth > pos.x &&
          newY < pos.y + pos.height &&
          newY + visualHeight > pos.y
        )

        if (!overlaps) break

        newX += 50
        if (newX + visualWidth > CANVAS_WIDTH) {
          newX = 100
          newY += 50
        }
        if (newY + visualHeight > CANVAS_HEIGHT) {
          newY = 100
          newX = Math.random() * (CANVAS_WIDTH - visualWidth)
          newY = Math.random() * (CANVAS_HEIGHT - visualHeight)
        }
        attempts++
      }

      const sizeString = `${length}m x ${width}m`
      
      console.log("📝 Creating plant bed with data:", {
        garden_id: garden.id,
        size: sizeString,
        description: newPlantBed.description,
        sun_exposure: newPlantBed.sun_exposure,
        soil_type: newPlantBed.soil_type,
      })

      // Generate a unique ID for the plant bed (max 10 chars)
      const plantBedId = `${Date.now().toString(36).slice(-4)}${Math.random().toString(36).substr(2, 4)}`
      
      const plantBed = await createPlantBed({
        id: plantBedId,
        garden_id: garden.id,
        size: sizeString,
        description: newPlantBed.description?.trim() || undefined,
        sun_exposure: newPlantBed.sun_exposure,
        soil_type: newPlantBed.soil_type?.trim() || undefined,
      })

      if (plantBed) {
        // Update the plant bed with position and calculated dimensions
        const updatedBed = await updatePlantBed(plantBed.id, {
          position_x: newX,
          position_y: newY,
          visual_width: visualWidth,
          visual_height: visualHeight,
          rotation: 0
        })

        if (updatedBed) {
          const bedWithPlants: PlantBedWithPlants = {
            ...updatedBed,
            position_x: updatedBed.position_x ?? newX,
            position_y: updatedBed.position_y ?? newY,
            visual_width: updatedBed.visual_width ?? visualWidth,
            visual_height: updatedBed.visual_height ?? visualHeight,
            rotation: updatedBed.rotation ?? 0,
            z_index: updatedBed.z_index ?? 0,
            color_code: updatedBed.color_code ?? '',
            visual_updated_at: updatedBed.visual_updated_at ?? new Date().toISOString(),
            plants: []
          }
          setPlantBeds(prev => [...prev, bedWithPlants])
          setIsAddingPlantBed(false)
          setNewPlantBed({
            length: '',
            width: '',
            description: '',
            sun_exposure: 'full-sun',
            soil_type: ''
          })
        }
      }
    } catch (error) {
      console.error("Error creating plant bed:", error)
    }
  }

  // Delete plant bed function
  const handleDeletePlantBed = async (bedId: string) => {
    const bedToDelete = plantBeds.find(bed => bed.id === bedId)
    if (!bedToDelete) return

    setDeletingBedId(bedId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePlantBed = async () => {
    if (!deletingBedId) return

    try {
      await deletePlantBed(deletingBedId)
      
      setPlantBeds(prev => prev.filter(bed => bed.id !== deletingBedId))
      
    } catch (error) {
      console.error("Error deleting plant bed:", error)
    } finally {
      setDeletingBedId(null)
      setShowDeleteDialog(false)
      setSelectedBed(null)
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
          <Button onClick={() => navigateTo("/gardens")} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Tuinen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="flex items-center gap-1 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TreePine className="h-6 w-6 text-green-600" />
              {garden.name}
            </h1>
            {(garden.total_area || (garden.length && garden.width)) && (
              <p className="text-xs text-gray-600">
                {garden.length}m × {garden.width}m • {garden.total_area || 
                  (garden.length && garden.width && 
                    `${(parseFloat(garden.length) * parseFloat(garden.width)).toFixed(1)} m²`
                  )
                }
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingGarden(true)}
            className="px-2"
          >
            <Edit className="h-4 w-4 mr-1" />
            Bewerken
          </Button>
          
          <Button
            variant={isVisualView ? "default" : "outline"}
            size="sm"
            onClick={toggleView}
            className="px-2"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            {isVisualView ? "Lijst" : "Visueel"}
          </Button>
          
          <Dialog open={isAddingPlantBed} onOpenChange={(open) => {
            if (open) {
              // Reset form when dialog opens
              setNewPlantBed({
                length: '',
                width: '',
                description: '',
                sun_exposure: 'full-sun',
                soil_type: ''
              })
            }
            setIsAddingPlantBed(open)
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <Plus className="h-4 w-4 mr-1" />
                Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nieuw Plantvak Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuw plantvak toe aan je tuin. Het systeem wijst automatisch een letter toe (A, B, C, etc.).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="length" className="text-sm font-medium">
                      Lengte (m) *
                    </label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={newPlantBed.length}
                      onChange={(e) => setNewPlantBed(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="2.0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="width" className="text-sm font-medium">
                      Breedte (m) *
                    </label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={newPlantBed.width}
                      onChange={(e) => setNewPlantBed(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="1.5"
                    />
                  </div>
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

        </div>
      </div>

      {isVisualView ? (
        /* Visual Garden Layout */
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-blue-600" />
                Visuele Weergave
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(prev + 0.1, 2))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(1)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-auto rounded-lg border-2 border-dashed border-green-200" style={{ minHeight: "400px" }}>
              <div
                ref={canvasRef}
                className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 cursor-crosshair"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* Grid - 1m = 80px */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #10b98120 1px, transparent 1px),
                      linear-gradient(to bottom, #10b98120 1px, transparent 1px)
                    `,
                    backgroundSize: `${METERS_TO_PIXELS}px ${METERS_TO_PIXELS}px`,
                  }}
                />

                {/* Plant Beds */}
                {plantBeds.map((bed) => {
                  const isSelected = selectedBed === bed.id
                  
                  // Always recalculate dimensions from size to ensure correct scaling
                  let bedWidth = metersToPixels(2) // Default 2x2 meters
                  let bedHeight = metersToPixels(2)
                  
                  if (bed.size) {
                    const dims = getDimensionsFromSize(bed.size)
                    bedWidth = dims.width
                    bedHeight = dims.height
                  }

                  return (
                    <div
                      key={bed.id}
                      className="absolute"
                      style={{
                        left: bed.position_x || 100,
                        top: bed.position_y || 100,
                      }}
                    >
                      {/* Plantvak container */}
                      <div
                        className={`border-3 rounded-lg transition-all duration-200 group shadow-lg ${
                          isSelected ? 'border-blue-600 shadow-xl ring-3 ring-blue-300 cursor-grab' :
                          'cursor-grab hover:shadow-xl hover:scale-102 hover:border-green-500 hover:ring-2 hover:ring-green-300'
                        }`}
                        style={{
                          width: bedWidth,
                          height: bedHeight,
                          transform: `rotate(${bed.rotation || 0}deg)`,
                          transformOrigin: 'center center',
                        }}
                        onClick={() => setSelectedBed(bed.id)}
                        onDoubleClick={() => navigateTo(`/gardens/${garden?.id}/plantvak-view/${bed.id}`)}
                      >
                        <div className={`w-full h-full rounded-lg bg-green-50 border border-gray-200 group-hover:bg-green-100 transition-colors relative ${
                          isSelected ? 'bg-blue-100 border-blue-300' : ''
                        }`}>
                          {/* Top corner elements */}
                          <div className="flex items-start justify-between">
                            {bed.sun_exposure && (
                              <div className="bg-white/90 p-1 rounded shadow-sm">
                                {getSunExposureIcon(bed.sun_exposure)}
                              </div>
                            )}
                          </div>

                          {/* Main area for plants/flowers - full height for flowers */}
                          <div className="w-full h-full flex items-center justify-center relative overflow-hidden border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-green-25 to-green-50">
                            {/* Plantvak visual indicator */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none"></div>
                            
                            {/* Flower Visualization System */}
                            <FlowerVisualization 
                              plantBed={bed}
                              plants={bed.plants}
                              containerWidth={bedWidth}
                              containerHeight={bedHeight}
                            />
                            {bed.plants.length === 0 && (
                              <div className="text-gray-500 text-sm font-medium bg-white/80 px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
                                🌱 Leeg plantvak
                              </div>
                            )}
                            
                            {/* Corner decorations to emphasize the plant bed area */}
                            <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-green-400 rounded-tl-lg pointer-events-none"></div>
                            <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-green-400 rounded-tr-lg pointer-events-none"></div>
                            <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-green-400 rounded-bl-lg pointer-events-none"></div>
                            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-green-400 rounded-br-lg pointer-events-none"></div>
                          </div>

                          <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                        </div>
                        
                        {/* Plantvak info onder het vak */}
                        <div className="mt-1 text-center">
                          <div className="text-xs text-gray-600 font-medium">{bed.name}</div>
                          <div className="text-xs text-gray-500">
                            {bed.size || `${(bedWidth / METERS_TO_PIXELS).toFixed(1)}m × ${(bedHeight / METERS_TO_PIXELS).toFixed(1)}m`} • {bed.plants.length} 🌸
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

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
              <p>💡 <strong>Tip:</strong> Dubbelklik op een plantvak om het te beheren</p>
              <div className="flex items-center gap-4">
                <p className="text-xs">Zoom: {Math.round(scale * 100)}%</p>
                {selectedBed && (
                  <>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {plantBeds.find(b => b.id === selectedBed)?.name} geselecteerd
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlantBed(selectedBed)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Verwijder
                    </Button>
                  </>
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
                      
                      {/* Flower preview in plant bed list */}
                      {bed.plants.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {bed.plants.slice(0, 4).map((flower, index) => (
                              <div
                                key={`${flower.id}-${index}`}
                                className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1"
                                title={`${flower.name}${flower.color ? ` - ${flower.color}` : ''}`}
                              >
                                <span className="text-sm">
                                  {flower.emoji || '🌸'}
                                </span>
                                <span className="text-xs font-medium text-purple-800 truncate max-w-20">
                                  {flower.name}
                                </span>
                                {flower.color && (
                                  <div
                                    className="w-2 h-2 rounded-full border border-gray-300 ml-1"
                                    title={flower.color}
                                    style={{ backgroundColor: flower.color }}
                                  />
                                )}
                              </div>
                            ))}
                            {bed.plants.length > 4 && (
                              <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg px-2 py-1">
                                <span className="text-xs text-gray-600">
                                  +{bed.plants.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlantBed(bed.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription>
              Weet je zeker dat je dit plantvak wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          {deletingBedId && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    {plantBeds.find(bed => bed.id === deletingBedId)?.name}
                  </span>
                </div>
                <div className="text-sm text-red-700">
                  {plantBeds.find(bed => bed.id === deletingBedId)?.plants.length || 0} bloemen zullen ook worden verwijderd
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuleren
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePlantBed}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijderen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}