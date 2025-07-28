"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Leaf,
  Sun,
  CloudSun,
  Cloud,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save
} from "lucide-react"
import { getGarden, getPlantBeds, getPlantsWithPositions, createVisualPlant, updatePlantPosition, deletePlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"
import { 
  METERS_TO_PIXELS,
  FLOWER_SIZE_MEDIUM,
  parsePlantBedDimensions
} from "@/lib/scaling-constants"
import { FlowerVisualization } from "@/components/flower-visualization"

export default function PlantvakDetailPage() {
  const router = useRouter()
  const params = useParams()
  
  // State
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [flowers, setFlowers] = useState<PlantWithPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [selectedFlower, setSelectedFlower] = useState<PlantWithPosition | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Add flower dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newFlower, setNewFlower] = useState({
    name: '',
    plant_type: 'flower',
    status: 'healthy' as const
  })
  
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        const gardenId = params.id as string
        const bedId = params.bedId as string
        
        // Load garden and plant bed
        const [gardenData, plantBedsData] = await Promise.all([
          getGarden(gardenId),
          getPlantBeds(gardenId)
        ])
        
        if (!gardenData) {
          router.push('/gardens')
          return
        }
        
        const currentBed = plantBedsData.find(bed => bed.id === bedId)
        if (!currentBed) {
          router.push(`/gardens/${gardenId}`)
          return
        }
        
        setGarden(gardenData)
        setPlantBed(currentBed)
        
        // Load flowers for this plant bed
        const flowersData = await getPlantsWithPositions(bedId)
        setFlowers(flowersData)
        
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/gardens')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id && params.bedId) {
      loadData()
    }
  }, [params.id, params.bedId, router])
  
  // Calculate canvas size based on plant bed dimensions
  const getCanvasSize = useCallback(() => {
    if (!plantBed?.size) {
      return { width: 800, height: 400 }
    }
    
    const dimensions = parsePlantBedDimensions(plantBed.size)
    if (!dimensions) {
      return { width: 800, height: 400 }
    }
    
    // Scale up for better detail view
    const scaleFactor = 2
    return {
      width: dimensions.lengthPixels * scaleFactor,
      height: dimensions.widthPixels * scaleFactor
    }
  }, [plantBed?.size])
  
  // Add new flower
  const handleAddFlower = useCallback(async () => {
    if (!plantBed || !newFlower.name.trim()) return
    
    try {
      const canvasSize = getCanvasSize()
      
             // Place new flower in center of plantvak
       const centerX = canvasSize.width / 2 - FLOWER_SIZE_MEDIUM / 2
       const centerY = canvasSize.height / 2 - FLOWER_SIZE_MEDIUM / 2
      
      const flowerData = {
        name: newFlower.name.trim(),
        plant_type: newFlower.plant_type,
        status: newFlower.status,
        position_x: centerX,
        position_y: centerY,
                 visual_width: FLOWER_SIZE_MEDIUM,
         visual_height: FLOWER_SIZE_MEDIUM,
        notes: ''
      }
      
      const newFlowerRecord = await createVisualPlant(plantBed.id, flowerData)
      setFlowers(prev => [...prev, newFlowerRecord])
      
      // Reset form
      setNewFlower({
        name: '',
        plant_type: 'flower',
        status: 'healthy'
      })
      setShowAddDialog(false)
      
    } catch (error) {
      console.error('Error adding flower:', error)
    }
  }, [plantBed, newFlower, getCanvasSize])
  
  // Delete flower
  const handleDeleteFlower = useCallback(async (flowerId: string) => {
    try {
      await deletePlant(flowerId)
      setFlowers(prev => prev.filter(f => f.id !== flowerId))
      setSelectedFlower(null)
    } catch (error) {
      console.error('Error deleting flower:', error)
    }
  }, [])
  
  // Save flower position
  const handleSavePosition = useCallback(async (flower: PlantWithPosition) => {
    try {
      await updatePlantPosition(flower.id, {
        position_x: flower.position_x,
        position_y: flower.position_y,
        visual_width: flower.visual_width,
        visual_height: flower.visual_height,
        notes: flower.notes
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving position:', error)
    }
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!garden || !plantBed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">Plantvak niet gevonden</p>
          <Link href="/gardens" className="text-blue-600 hover:underline">
            Terug naar tuinen
          </Link>
        </div>
      </div>
    )
  }
  
  const canvasSize = getCanvasSize()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/gardens/${garden.id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Terug naar tuin
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plantBed.name}</h1>
              <p className="text-gray-600">{garden.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(1)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plantvak Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Plantvak Weergave
                  </CardTitle>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Bloem Toevoegen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                        <DialogDescription>
                          Voeg een nieuwe bloem toe aan dit plantvak
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Naam
                          </label>
                          <Input
                            value={newFlower.name}
                            onChange={(e) => setNewFlower(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Bijv. Zonnebloem"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Type
                          </label>
                          <Select
                            value={newFlower.plant_type}
                            onValueChange={(value) => setNewFlower(prev => ({ ...prev, plant_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flower">Bloem</SelectItem>
                              <SelectItem value="herb">Kruid</SelectItem>
                              <SelectItem value="vegetable">Groente</SelectItem>
                              <SelectItem value="shrub">Struik</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddDialog(false)}
                          >
                            Annuleren
                          </Button>
                          <Button
                            onClick={handleAddFlower}
                            disabled={!newFlower.name.trim()}
                          >
                            Toevoegen
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div 
                    ref={canvasRef}
                    className="relative bg-gradient-to-br from-green-100 to-green-200 border-2 border-dashed border-green-400 rounded-lg overflow-hidden"
                    style={{
                      width: `${canvasSize.width * scale}px`,
                      height: `${canvasSize.height * scale}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    {/* FlowerVisualization for interactive flowers */}
                    <FlowerVisualization 
                      plantBed={plantBed}
                      plants={flowers}
                      containerWidth={canvasSize.width}
                      containerHeight={canvasSize.height}
                      onFlowerSelect={setSelectedFlower}
                      onFlowerUpdate={(updatedFlower) => {
                        setFlowers(prev => prev.map(f => 
                          f.id === updatedFlower.id ? updatedFlower : f
                        ))
                        setHasChanges(true)
                      }}
                      onFlowerSave={handleSavePosition}
                    />
                    
                    {flowers.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                          <Leaf className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Geen bloemen toegevoegd</p>
                          <p className="text-xs text-gray-400">Klik op "Bloem Toevoegen" om te beginnen</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Plantvak Info */}
                <div className="mt-4 text-center space-y-2">
                  <h3 className="font-semibold text-lg">{plantBed.name}</h3>
                  <p className="text-gray-600">{plantBed.size}</p>
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <span>{flowers.length} bloemen</span>
                    {plantBed.sun_exposure && (
                      <span className="flex items-center gap-1">
                        {plantBed.sun_exposure === 'full-sun' && <Sun className="h-4 w-4" />}
                        {plantBed.sun_exposure === 'partial-sun' && <CloudSun className="h-4 w-4" />}
                        {plantBed.sun_exposure === 'shade' && <Cloud className="h-4 w-4" />}
                        {plantBed.sun_exposure === 'full-sun' ? 'Volle zon' :
                         plantBed.sun_exposure === 'partial-sun' ? 'Gedeeltelijke zon' : 'Schaduw'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Flower Info */}
            {selectedFlower && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Geselecteerde Bloem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{selectedFlower.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{selectedFlower.plant_type}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Positie:</span> {Math.round(selectedFlower.position_x)}, {Math.round(selectedFlower.position_y)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Grootte:</span> {selectedFlower.visual_width}×{selectedFlower.visual_height}px
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFlower(null)}
                    >
                      Deselecteren
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => selectedFlower && handleDeleteFlower(selectedFlower.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Verwijderen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Flower List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bloemen in dit Plantvak</CardTitle>
              </CardHeader>
              <CardContent>
                {flowers.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Nog geen bloemen toegevoegd
                  </p>
                ) : (
                  <div className="space-y-2">
                    {flowers.map((flower) => (
                      <div
                        key={flower.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedFlower?.id === flower.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFlower(flower)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{flower.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{flower.plant_type}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {flower.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions */}
            {hasChanges && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // Save all changes
                      flowers.forEach(handleSavePosition)
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Wijzigingen Opslaan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}