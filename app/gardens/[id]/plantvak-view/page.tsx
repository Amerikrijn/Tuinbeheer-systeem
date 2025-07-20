"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Trash2,
  TreePine,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

interface FlowerPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  name: string
  color: string
  type: string
  status: 'healthy' | 'needs_attention' | 'blooming' | 'sick'
  plant_bed_id: string
}

const GRID_SIZE = 20
const SCALE_MIN = 0.5
const SCALE_MAX = 2
const FLOWER_SIZE = 50
const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 700

const FLOWER_TYPES = [
  { name: 'Roos', color: '#FF69B4', emoji: '🌹' },
  { name: 'Tulp', color: '#FF4500', emoji: '🌷' },
  { name: 'Zonnebloem', color: '#FFD700', emoji: '🌻' },
  { name: 'Lavendel', color: '#9370DB', emoji: '🪻' },
  { name: 'Dahlia', color: '#FF1493', emoji: '🌺' },
  { name: 'Chrysant', color: '#FFA500', emoji: '🌼' },
  { name: 'Narcis', color: '#FFFF00', emoji: '🌻' },
  { name: 'Iris', color: '#4B0082', emoji: '🌸' },
  { name: 'Petunia', color: '#FF6B6B', emoji: '🌺' },
  { name: 'Begonia', color: '#FF8C69', emoji: '🌸' },
]

export default function PlantvakViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [flowerPositions, setFlowerPositions] = useState<FlowerPosition[]>([])
  const [scale, setScale] = useState(1)
  const [selectedFlower, setSelectedFlower] = useState<FlowerPosition | null>(null)
  const [selectedPlantBed, setSelectedPlantBed] = useState<string | null>(null)
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasChanges, setHasChanges] = useState(false)
  const [isAddingFlower, setIsAddingFlower] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newFlower, setNewFlower] = useState({
    name: '',
    type: '',
    color: '#FF69B4',
    plant_bed_id: ''
  })
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Load garden and plant beds data
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
        
        // Set first plant bed as selected if available
        if (plantBedsData && plantBedsData.length > 0) {
          setSelectedPlantBed(plantBedsData[0].id)
          setNewFlower(prev => ({ ...prev, plant_bed_id: plantBedsData[0].id }))
        }
        
        // Load saved flower positions from localStorage (in real app this would be from database)
        const savedPositions = localStorage.getItem(`garden-${params.id}-flowers`)
        if (savedPositions) {
          setFlowerPositions(JSON.parse(savedPositions))
        }
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
    setScale(prev => Math.min(prev + 0.1, SCALE_MAX))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, SCALE_MIN))
  }

  const resetView = () => {
    setScale(1)
  }

  const saveLayout = () => {
    // Save to localStorage (in real app this would save to database)
    localStorage.setItem(`garden-${params.id}-flowers`, JSON.stringify(flowerPositions))
    setHasChanges(false)
    toast({
      title: "Layout opgeslagen",
      description: "De bloemen posities zijn succesvol opgeslagen.",
    })
  }

  const addFlower = () => {
    if (!newFlower.name || !newFlower.type || !newFlower.plant_bed_id) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle velden in om een bloem toe te voegen.",
        variant: "destructive",
      })
      return
    }

    const selectedType = FLOWER_TYPES.find(type => type.name === newFlower.type)
    const selectedBed = plantBeds.find(bed => bed.id === newFlower.plant_bed_id)
    
    if (!selectedBed) {
      toast({
        title: "Plantvak niet gevonden",
        description: "Selecteer een geldig plantvak.",
        variant: "destructive",
      })
      return
    }

    // Calculate plant bed boundaries
    const bedX = selectedBed.position_x || 100
    const bedY = selectedBed.position_y || 100
    const bedWidth = selectedBed.visual_width || 200
    const bedHeight = selectedBed.visual_height || 150

    const newFlowerPosition: FlowerPosition = {
      id: Date.now().toString(),
      x: bedX + Math.random() * (bedWidth - FLOWER_SIZE),
      y: bedY + Math.random() * (bedHeight - FLOWER_SIZE),
      width: FLOWER_SIZE,
      height: FLOWER_SIZE,
      name: newFlower.name,
      color: selectedType?.color || newFlower.color,
      type: newFlower.type,
      status: 'healthy',
      plant_bed_id: newFlower.plant_bed_id
    }

    setFlowerPositions(prev => [...prev, newFlowerPosition])
    setHasChanges(true)
    setIsAddingFlower(false)
    setNewFlower(prev => ({ ...prev, name: '', type: '', color: '#FF69B4' }))
    
    toast({
      title: "Bloem toegevoegd",
      description: `${newFlower.name} is toegevoegd aan ${selectedBed.name}.`,
    })
  }

  const removeFlower = (flowerId: string) => {
    setFlowerPositions(prev => prev.filter(f => f.id !== flowerId))
    setHasChanges(true)
    setSelectedFlower(null)
    toast({
      title: "Bloem verwijderd",
      description: "De bloem is verwijderd uit het plantvak.",
    })
  }

  const onMouseDown = (e: React.MouseEvent, flowerId: string) => {
    e.preventDefault()
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setDraggedFlower(flowerId)
    setDragOffset({
      x: (e.clientX - rect.left) / scale - flower.x,
      y: (e.clientY - rect.top) / scale - flower.y
    })
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedFlower || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newX = (e.clientX - rect.left) / scale - dragOffset.x
    const newY = (e.clientY - rect.top) / scale - dragOffset.y

    // Find the flower being dragged
    const flower = flowerPositions.find(f => f.id === draggedFlower)
    if (!flower) return

    // Find the plant bed this flower belongs to
    const plantBed = plantBeds.find(bed => bed.id === flower.plant_bed_id)
    if (!plantBed) return

    // Constrain movement to the plant bed boundaries
    const bedX = plantBed.position_x || 100
    const bedY = plantBed.position_y || 100
    const bedWidth = plantBed.visual_width || 200
    const bedHeight = plantBed.visual_height || 150

    const constrainedX = Math.max(bedX, Math.min(newX, bedX + bedWidth - FLOWER_SIZE))
    const constrainedY = Math.max(bedY, Math.min(newY, bedY + bedHeight - FLOWER_SIZE))

    setFlowerPositions(prev =>
      prev.map(f =>
        f.id === draggedFlower
          ? { ...f, x: constrainedX, y: constrainedY }
          : f
      )
    )
    setHasChanges(true)
  }, [draggedFlower, dragOffset, scale, flowerPositions, plantBeds])

  const onMouseUp = useCallback(() => {
    setDraggedFlower(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case 'full-sun':
        return <Sun className="h-4 w-4 text-yellow-500" />
      case 'partial-sun':
        return <CloudSun className="h-4 w-4 text-yellow-400" />
      default:
        return <Cloud className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500 shadow-green-200'
      case 'needs_attention':
        return 'border-yellow-500 shadow-yellow-200'
      case 'blooming':
        return 'border-purple-500 shadow-purple-200'
      case 'sick':
        return 'border-red-500 shadow-red-200'
      default:
        return 'border-gray-500 shadow-gray-200'
    }
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TreePine className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900">Tuin wordt geladen...</h2>
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
            onClick={() => router.push(`/gardens/${garden.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Tuin
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TreePine className="h-8 w-8 text-green-600" />
              {garden.name} - Plantvakken
            </h1>
            <p className="text-gray-600">Sleep bloemen om ze te verplaatsen binnen hun plantvak</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingFlower} onOpenChange={setIsAddingFlower}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={plantBeds.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Bloem Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuwe bloem toe aan een plantvak
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Plantvak</label>
                  <Select value={newFlower.plant_bed_id} onValueChange={(value) => {
                    setNewFlower(prev => ({ ...prev, plant_bed_id: value }))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer plantvak" />
                    </SelectTrigger>
                    <SelectContent>
                      {plantBeds.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          {bed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Naam</label>
                  <Input
                    value={newFlower.name}
                    onChange={(e) => setNewFlower(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijv. Mijn mooie roos"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newFlower.type} onValueChange={(value) => {
                    const selectedType = FLOWER_TYPES.find(type => type.name === value)
                    setNewFlower(prev => ({ 
                      ...prev, 
                      type: value,
                      color: selectedType?.color || prev.color
                    }))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer bloem type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOWER_TYPES.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
                          <div className="flex items-center gap-2">
                            <span>{type.emoji}</span>
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addFlower} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Toevoegen
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingFlower(false)}>
                    Annuleren
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
            <div>
              <div className="font-medium">Locatie</div>
              <div className="text-sm text-gray-600">{garden.location}</div>
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
              <div className="text-sm text-gray-600">{flowerPositions.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plant Beds Overview */}
      {plantBeds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Plantvakken Overzicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantBeds.map((bed) => {
                const bedFlowers = flowerPositions.filter(f => f.plant_bed_id === bed.id)
                return (
                  <div
                    key={bed.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlantBed === bed.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedPlantBed(bed.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{bed.name}</h4>
                      <Badge variant="outline">{bedFlowers.length} bloemen</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        {getSunExposureIcon(bed.sun_exposure || 'partial-sun')}
                        <span>{bed.sun_exposure || 'Onbekend'}</span>
                      </div>
                      <div>Grond: {bed.soil_type || 'Onbekend'}</div>
                      <div>Grootte: {bed.size || 'Onbekend'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Garden Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            Tuin Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-green-200">
            <div
              ref={containerRef}
              className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                maxWidth: "100%",
              }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
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
                  className={`absolute border-2 rounded-lg ${getPlantBedColor(bed.id)} ${
                    selectedPlantBed === bed.id ? 'ring-2 ring-green-500' : ''
                  } transition-all cursor-pointer`}
                  style={{
                    left: bed.position_x || 100,
                    top: bed.position_y || 100,
                    width: bed.visual_width || 200,
                    height: bed.visual_height || 150,
                  }}
                  onClick={() => setSelectedPlantBed(bed.id)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="outline" className="bg-white/80 text-xs">
                      {bed.name}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 z-10">
                    <Badge variant="secondary" className="bg-white/80 text-xs">
                      {flowerPositions.filter(f => f.plant_bed_id === bed.id).length} 🌸
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Flowers */}
              {flowerPositions.map((flower) => {
                const flowerType = FLOWER_TYPES.find(type => type.name === flower.type)
                return (
                  <div
                    key={flower.id}
                    className={`absolute cursor-move rounded-full border-4 ${getStatusColor(flower.status)} ${
                      draggedFlower === flower.id ? "shadow-2xl ring-4 ring-green-500 z-20 scale-110" : "shadow-lg hover:shadow-xl z-10"
                    } transition-all duration-200 flex items-center justify-center text-2xl font-bold text-white`}
                    style={{
                      left: flower.x,
                      top: flower.y,
                      width: flower.width,
                      height: flower.height,
                      backgroundColor: flower.color,
                    }}
                    onMouseDown={(e) => onMouseDown(e, flower.id)}
                    onClick={() => !draggedFlower && setSelectedFlower(flower)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{flowerType?.emoji || '🌸'}</div>
                    </div>
                  </div>
                )
              })}

              {/* Empty State */}
              {plantBeds.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Leaf className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Nog geen plantvakken</h3>
                    <p className="text-gray-600 mb-4">Voeg eerst plantvakken toe aan je tuin.</p>
                    <Button onClick={() => router.push(`/gardens/${garden.id}`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Terug naar Tuin
                    </Button>
                  </div>
                </div>
              )}

              {plantBeds.length > 0 && flowerPositions.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white/80 p-6 rounded-lg">
                    <Flower className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen bloemen</h3>
                    <p className="text-gray-600">Voeg bloemen toe aan je plantvakken.</p>
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
            Legenda & Instructies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Bloem Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-400 border-4 border-green-500 rounded-full"></div>
                  <span>Gezond</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-400 border-4 border-yellow-500 rounded-full"></div>
                  <span>Aandacht nodig</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-400 border-4 border-purple-500 rounded-full"></div>
                  <span>Bloeiend</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-400 border-4 border-red-500 rounded-full"></div>
                  <span>Ziek</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Instructies</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Klik op "Bloem Toevoegen" om nieuwe bloemen toe te voegen</div>
                <div>• Sleep bloemen om ze binnen hun plantvak te verplaatsen</div>
                <div>• Klik op een plantvak om het te selecteren</div>
                <div>• Klik op een bloem voor meer informatie en opties</div>
                <div>• Gebruik zoom knoppen om in/uit te zoomen</div>
                <div>• Vergeet niet te opslaan na wijzigingen</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flower Details Dialog */}
      <Dialog open={!!selectedFlower} onOpenChange={() => setSelectedFlower(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flower className="h-5 w-5" />
              {selectedFlower?.name}
            </DialogTitle>
            <DialogDescription>
              Bloem details en opties
            </DialogDescription>
          </DialogHeader>
          {selectedFlower && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Type:</span>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <span>{FLOWER_TYPES.find(t => t.name === selectedFlower.type)?.emoji}</span>
                    {selectedFlower.type}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Plantvak:</span>
                  <div className="text-sm text-gray-600">
                    {plantBeds.find(bed => bed.id === selectedFlower.plant_bed_id)?.name || 'Onbekend'}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Kleur:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: selectedFlower.color }}
                    />
                    <span className="text-sm text-gray-600">{selectedFlower.color}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="secondary">{selectedFlower.status}</Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium">Positie:</span>
                  <div className="text-sm text-gray-600">
                    {Math.round(selectedFlower.x)}, {Math.round(selectedFlower.y)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeFlower(selectedFlower.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Verwijderen
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedFlower(null)}>
                  Sluiten
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}