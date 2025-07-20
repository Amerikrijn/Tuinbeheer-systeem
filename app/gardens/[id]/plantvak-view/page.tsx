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
  Palette,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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
}

interface PlantBed {
  id: string
  name: string
  size: string
  sunExposure: string
  soilType: string
  garden_id: string
}

const GRID_SIZE = 20
const SCALE_MIN = 0.5
const SCALE_MAX = 2
const FLOWER_SIZE = 50
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const FLOWER_TYPES = [
  { name: 'Roos', color: '#FF69B4', emoji: '🌹' },
  { name: 'Tulp', color: '#FF4500', emoji: '🌷' },
  { name: 'Zonnebloem', color: '#FFD700', emoji: '🌻' },
  { name: 'Lavendel', color: '#9370DB', emoji: '🪻' },
  { name: 'Dahlia', color: '#FF1493', emoji: '🌺' },
  { name: 'Chrysant', color: '#FFA500', emoji: '🌼' },
  { name: 'Narcis', color: '#FFFF00', emoji: '🌻' },
  { name: 'Iris', color: '#4B0082', emoji: '🌸' },
]

export default function PlantVakViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [flowerPositions, setFlowerPositions] = useState<FlowerPosition[]>([])
  const [scale, setScale] = useState(1)
  const [selectedFlower, setSelectedFlower] = useState<FlowerPosition | null>(null)
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasChanges, setHasChanges] = useState(false)
  const [isAddingFlower, setIsAddingFlower] = useState(false)
  const [newFlower, setNewFlower] = useState({
    name: '',
    type: '',
    color: '#FF69B4'
  })
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Load plant bed data
  useEffect(() => {
    const loadPlantBed = () => {
      // Mock data - in real app this would come from the database
      const mockPlantBed: PlantBed = {
        id: params.id as string,
        name: `Plantvak ${params.id}`,
        size: "3x2 meter",
        sunExposure: "Volle zon",
        soilType: "Klei",
        garden_id: params.id as string
      }
      
      setPlantBed(mockPlantBed)
      
      // Load saved flower positions from localStorage (in real app this would be from database)
      const savedPositions = localStorage.getItem(`plantvak-${params.id}-flowers`)
      if (savedPositions) {
        setFlowerPositions(JSON.parse(savedPositions))
      }
    }
    
    loadPlantBed()
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
    localStorage.setItem(`plantvak-${params.id}-flowers`, JSON.stringify(flowerPositions))
    setHasChanges(false)
    toast({
      title: "Layout opgeslagen",
      description: "De bloemen posities zijn succesvol opgeslagen.",
    })
  }

  const addFlower = () => {
    if (!newFlower.name || !newFlower.type) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle velden in om een bloem toe te voegen.",
        variant: "destructive",
      })
      return
    }

    const selectedType = FLOWER_TYPES.find(type => type.name === newFlower.type)
    const newFlowerPosition: FlowerPosition = {
      id: Date.now().toString(),
      x: Math.random() * (CANVAS_WIDTH - FLOWER_SIZE),
      y: Math.random() * (CANVAS_HEIGHT - FLOWER_SIZE),
      width: FLOWER_SIZE,
      height: FLOWER_SIZE,
      name: newFlower.name,
      color: selectedType?.color || newFlower.color,
      type: newFlower.type,
      status: 'healthy'
    }

    setFlowerPositions(prev => [...prev, newFlowerPosition])
    setHasChanges(true)
    setIsAddingFlower(false)
    setNewFlower({ name: '', type: '', color: '#FF69B4' })
    
    toast({
      title: "Bloem toegevoegd",
      description: `${newFlower.name} is toegevoegd aan het plantvak.`,
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

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, CANVAS_WIDTH - FLOWER_SIZE))
    const constrainedY = Math.max(0, Math.min(newY, CANVAS_HEIGHT - FLOWER_SIZE))

    setFlowerPositions(prev =>
      prev.map(flower =>
        flower.id === draggedFlower
          ? { ...flower, x: constrainedX, y: constrainedY }
          : flower
      )
    )
    setHasChanges(true)
  }, [draggedFlower, dragOffset, scale])

  const onMouseUp = useCallback(() => {
    setDraggedFlower(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case 'Volle zon':
        return <Sun className="h-4 w-4 text-yellow-500" />
      case 'Halfschaduw':
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

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Plantvak wordt geladen...</h2>
          </div>
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
            onClick={() => router.push(`/gardens/${plantBed.garden_id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Tuin
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Grid3X3 className="h-8 w-8 text-green-600" />
              {plantBed.name}
            </h1>
            <p className="text-gray-600">Sleep bloemen om ze te verplaatsen in het plantvak</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingFlower} onOpenChange={setIsAddingFlower}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Bloem Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuwe bloem toe aan het plantvak
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
              <div className="font-medium">Aantal bloemen</div>
              <div className="text-sm text-gray-600">{flowerPositions.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Plant Bed Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            Bloemen Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-green-200">
            <div
              ref={containerRef}
              className="relative bg-gradient-to-b from-green-50 to-green-100"
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
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #10b98120 1px, transparent 1px),
                    linear-gradient(to bottom, #10b98120 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
              />

              {/* Flowers */}
              {flowerPositions.map((flower) => {
                const flowerType = FLOWER_TYPES.find(type => type.name === flower.type)
                return (
                  <div
                    key={flower.id}
                    className={`absolute cursor-move rounded-full border-4 ${getStatusColor(flower.status)} ${
                      draggedFlower === flower.id ? "shadow-2xl ring-4 ring-green-500 z-10 scale-110" : "shadow-lg hover:shadow-xl"
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
              {flowerPositions.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Flower className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Nog geen bloemen</h3>
                    <p className="text-gray-600 mb-4">Voeg bloemen toe om je plantvak in te richten.</p>
                    <Button onClick={() => setIsAddingFlower(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Bloem Toevoegen
                    </Button>
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
                <div>• Sleep bloemen om ze te verplaatsen in het plantvak</div>
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
                <div>
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