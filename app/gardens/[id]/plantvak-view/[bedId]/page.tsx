"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
  emoji?: string
  isCustom?: boolean
  isEnlarged?: boolean
  subFlowers?: Array<{
    id: string
    x: number
    y: number
    emoji: string
  }>
}

const GRID_SIZE = 10
const SCALE_MIN = 0.5
const SCALE_MAX = 3
const FLOWER_SIZE = 40

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

const DEFAULT_FLOWER_COLORS = [
  '#FF69B4', '#FF4500', '#FFD700', '#9370DB', '#FF1493', 
  '#FFA500', '#FFFF00', '#4B0082', '#FF6B6B', '#FF8C69',
  '#32CD32', '#00CED1', '#FF6347', '#DDA0DD', '#98FB98'
]

// Helper function to get emoji based on plant name or category
const getPlantEmoji = (name?: string, category?: string): string => {
  const plantName = (name || '').toLowerCase()
  const plantCategory = (category || '').toLowerCase()
  
  // Match by name
  if (plantName.includes('roos') || plantName.includes('rose')) return '🌹'
  if (plantName.includes('tulp') || plantName.includes('tulip')) return '🌷'
  if (plantName.includes('zonnebloem') || plantName.includes('sunflower')) return '🌻'
  if (plantName.includes('lavendel') || plantName.includes('lavender')) return '🪻'
  if (plantName.includes('dahlia')) return '🌺'
  if (plantName.includes('chrysant')) return '🌼'
  if (plantName.includes('narcis') || plantName.includes('daffodil')) return '🌻'
  if (plantName.includes('iris')) return '🌸'
  if (plantName.includes('petunia')) return '🌺'
  if (plantName.includes('begonia')) return '🌸'
  
  // Match by category
  if (plantCategory.includes('bloem') || plantCategory.includes('flower')) return '🌸'
  if (plantCategory.includes('kruid') || plantCategory.includes('herb')) return '🌿'
  if (plantCategory.includes('groente') || plantCategory.includes('vegetable')) return '🥬'
  
  // Default
  return '🌸'
}

export default function PlantBedViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [flowerPositions, setFlowerPositions] = useState<FlowerPosition[]>([])
  const [scale, setScale] = useState(1)
  const [selectedFlower, setSelectedFlower] = useState<FlowerPosition | null>(null)
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasChanges, setHasChanges] = useState(false)
  const [isAddingFlower, setIsAddingFlower] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isCustomFlower, setIsCustomFlower] = useState(false)
  const [newFlower, setNewFlower] = useState({
    name: '',
    type: '',
    color: '#FF69B4',
    customEmoji: '',
    description: ''
  })
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate canvas size based on plant bed size
  const getCanvasSize = () => {
    if (!plantBed) return { width: 600, height: 450 }
    
    // Convert plant bed size to pixels (rough scale: 1 meter = 100 pixels)
    // Add extra height for flower names
    const sizeMatch = plantBed.size?.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/)
    if (sizeMatch) {
      const width = Math.max(400, parseFloat(sizeMatch[1]) * 100)
      const height = Math.max(350, parseFloat(sizeMatch[2]) * 100 + 50) // Extra height for names
      return { width, height }
    }
    
    return { width: 600, height: 450 }
  }

  const { width: canvasWidth, height: canvasHeight } = getCanvasSize()

  // Load garden and plant bed data
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
        
        // Convert existing plants to flower positions
        if (specificBed?.plants && specificBed.plants.length > 0) {
          console.log('Loading plants from database:', specificBed.plants)
          const existingFlowers: FlowerPosition[] = specificBed.plants.map((plant, index) => ({
            id: plant.id || `plant-${index}`,
            x: Math.random() * (canvasWidth - FLOWER_SIZE),
            y: Math.random() * (canvasHeight - FLOWER_SIZE),
            width: FLOWER_SIZE,
            height: FLOWER_SIZE,
            name: plant.name || 'Onbekende bloem',
            color: plant.color || '#FF69B4',
            type: plant.category || plant.scientific_name || 'Bloem',
            status: (plant.status as any) || 'healthy',
            emoji: getPlantEmoji(plant.name, plant.category),
            isCustom: false,
            isEnlarged: false
          }))
          console.log('Converted to flower positions:', existingFlowers)
          setFlowerPositions(existingFlowers)
        } else {
          console.log('No plants found in database for bed:', params.bedId)
        }
        
        // Load saved flower positions from localStorage (overwrites database positions if exists)
        const savedPositions = localStorage.getItem(`plantvak-${params.bedId}-flowers`)
        if (savedPositions) {
          setFlowerPositions(JSON.parse(savedPositions))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setGarden(null)
        setPlantBed(null)
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id && params.bedId) {
      loadData()
    }
  }, [params.id, params.bedId, canvasWidth, canvasHeight])

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
    localStorage.setItem(`plantvak-${params.bedId}-flowers`, JSON.stringify(flowerPositions))
    setHasChanges(false)
    toast({
      title: "Layout opgeslagen",
      description: "De bloemen posities zijn succesvol opgeslagen.",
    })
  }

  const addFlower = () => {
    if (!newFlower.name || (!newFlower.type && !isCustomFlower)) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle velden in om een bloem toe te voegen.",
        variant: "destructive",
      })
      return
    }

    if (isCustomFlower && !newFlower.customEmoji) {
      toast({
        title: "Emoji vereist",
        description: "Voeg een emoji toe voor je aangepaste bloem.",
        variant: "destructive",
      })
      return
    }

    const selectedType = FLOWER_TYPES.find(type => type.name === newFlower.type)

    const newFlowerPosition: FlowerPosition = {
      id: Date.now().toString(),
      x: Math.random() * (canvasWidth - FLOWER_SIZE),
      y: Math.random() * (canvasHeight - FLOWER_SIZE),
      width: FLOWER_SIZE,
      height: FLOWER_SIZE,
      name: newFlower.name,
      color: newFlower.color,
      type: isCustomFlower ? 'Aangepast' : newFlower.type,
      status: 'healthy',
      emoji: isCustomFlower ? newFlower.customEmoji : selectedType?.emoji,
      isCustom: isCustomFlower,
      isEnlarged: false
    }

    setFlowerPositions(prev => [...prev, newFlowerPosition])
    setHasChanges(true)
    setIsAddingFlower(false)
    setIsCustomFlower(false)
    setNewFlower({
      name: '',
      type: '',
      color: '#FF69B4',
      customEmoji: '',
      description: ''
    })
    
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

  const toggleFlowerSize = (flowerId: string) => {
    setFlowerPositions(prev => prev.map(flower => {
      if (flower.id === flowerId) {
        const isCurrentlyEnlarged = flower.isEnlarged
        
        if (!isCurrentlyEnlarged) {
          // Enlarge and add sub-flowers
          const enlargedSize = 160
          
          // Ensure the enlarged flower stays within canvas bounds
          const maxX = canvasWidth - enlargedSize
          const maxY = canvasHeight - enlargedSize
          const adjustedX = Math.min(flower.x, maxX)
          const adjustedY = Math.min(flower.y, maxY)
          
          const subFlowers = Array.from({ length: 15 }, (_, i) => ({
            id: `sub-${flowerId}-${i}`,
            x: 20 + Math.random() * 120, // Keep sub-flowers within the enlarged area
            y: 30 + Math.random() * 100,
            emoji: flower.emoji || '🌸'
          }))
          
          return {
            ...flower,
            x: adjustedX,
            y: adjustedY,
            width: enlargedSize,
            height: enlargedSize,
            isEnlarged: true,
            subFlowers
          }
        } else {
          // Return to normal size
          return {
            ...flower,
            width: FLOWER_SIZE,
            height: FLOWER_SIZE,
            isEnlarged: false,
            subFlowers: undefined
          }
        }
      }
      return flower
    }))
    setHasChanges(true)
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedFlower || !containerRef.current) return

    const draggedFlowerObj = flowerPositions.find(f => f.id === draggedFlower)
    if (!draggedFlowerObj || draggedFlowerObj.isEnlarged) return

    const rect = containerRef.current.getBoundingClientRect()
    const newX = (e.clientX - rect.left) / scale - dragOffset.x
    const newY = (e.clientY - rect.top) / scale - dragOffset.y

    // Constrain to canvas bounds
    const flowerSize = draggedFlowerObj.width || FLOWER_SIZE
    const constrainedX = Math.max(0, Math.min(newX, canvasWidth - flowerSize))
    const constrainedY = Math.max(0, Math.min(newY, canvasHeight - flowerSize))

    setFlowerPositions(prev =>
      prev.map(f =>
        f.id === draggedFlower
          ? { ...f, x: constrainedX, y: constrainedY }
          : f
      )
    )
    setHasChanges(true)
  }, [draggedFlower, dragOffset, scale, canvasWidth, canvasHeight, flowerPositions])

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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900">Plantvak wordt geladen...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!garden || !plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <p className="text-gray-600 mb-4">Het plantvak dat je zoekt bestaat niet of is verwijderd.</p>
          <Button onClick={() => router.push(`/gardens/${garden?.id || params.id}`)} className="bg-green-600 hover:bg-green-700">
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
            onClick={() => router.push(`/gardens/${garden.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Tuin
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              {plantBed.name}
            </h1>
            <p className="text-gray-600">Klik op bloemen om ze te vergroten met 15+ bloemen en naam, sleep kleine bloemen om ze te verplaatsen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingFlower} onOpenChange={(open) => {
            setIsAddingFlower(open)
            if (!open) {
              setIsCustomFlower(false)
              setNewFlower({
                name: '',
                type: '',
                color: '#FF69B4',
                customEmoji: '',
                description: ''
              })
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Bloem Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuwe bloem toe aan {plantBed.name}
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="customFlower"
                    checked={isCustomFlower}
                    onChange={(e) => {
                      setIsCustomFlower(e.target.checked)
                      if (e.target.checked) {
                        setNewFlower(prev => ({ ...prev, type: '' }))
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor="customFlower" className="text-sm font-medium">
                    Aangepaste bloem maken
                  </label>
                </div>

                {!isCustomFlower ? (
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
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Emoji</label>
                      <Input
                        value={newFlower.customEmoji}
                        onChange={(e) => setNewFlower(prev => ({ ...prev, customEmoji: e.target.value }))}
                        placeholder="🌺"
                        maxLength={2}
                        className="text-2xl text-center"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kies een emoji voor je bloem</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Kleur</label>
                      <div className="flex gap-2 flex-wrap mt-2">
                        {DEFAULT_FLOWER_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              newFlower.color === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewFlower(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                      <Input
                        type="color"
                        value={newFlower.color}
                        onChange={(e) => setNewFlower(prev => ({ ...prev, color: e.target.value }))}
                        className="mt-2 h-10"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Beschrijving (optioneel)</label>
                      <Textarea
                        value={newFlower.description}
                        onChange={(e) => setNewFlower(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Beschrijf je aangepaste bloem..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                
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
              {getSunExposureIcon(plantBed.sun_exposure || 'partial-sun')}
              <div>
                <div className="font-medium">Zonlicht</div>
                <div className="text-sm text-gray-600">{plantBed.sun_exposure || 'Onbekend'}</div>
              </div>
            </div>
            <div>
              <div className="font-medium">Grootte</div>
              <div className="text-sm text-gray-600">{plantBed.size || 'Onbekend'}</div>
            </div>
            <div>
              <div className="font-medium">Grondsoort</div>
              <div className="text-sm text-gray-600">{plantBed.soil_type || 'Onbekend'}</div>
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
            Plantvak Layout - Op Schaal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-green-200">
            <div
              ref={containerRef}
              className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"
              style={{
                width: canvasWidth,
                height: canvasHeight,
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
              {flowerPositions.map((flower) => (
                <div
                  key={flower.id}
                  className={`absolute cursor-pointer rounded-full border-4 ${getStatusColor(flower.status)} ${
                    draggedFlower === flower.id ? "shadow-2xl ring-4 ring-green-500 z-10 scale-110" : "shadow-lg hover:shadow-xl"
                  } transition-all duration-300 flex items-center justify-center text-white ${
                    flower.isEnlarged ? 'cursor-pointer' : 'cursor-move'
                  }`}
                  style={{
                    left: flower.x,
                    top: flower.y,
                    width: flower.width,
                    height: flower.height,
                    backgroundColor: flower.color,
                  }}
                  onMouseDown={(e) => {
                    if (!flower.isEnlarged) {
                      onMouseDown(e, flower.id)
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!draggedFlower) {
                      toggleFlowerSize(flower.id)
                    }
                  }}
                >
                  {flower.isEnlarged ? (
                    <div className="relative w-full h-full">
                      {/* Background gradient for enlarged flower */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 via-emerald-50 to-green-200 opacity-40 border-2 border-green-300 border-dashed"></div>
                      
                      {/* Main flower in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-5xl drop-shadow-lg animate-bounce" style={{animationDuration: '4s'}}>{flower.emoji || '🌸'}</div>
                      </div>
                      
                      {/* Sub-flowers scattered around - more visible */}
                      {flower.subFlowers?.map((subFlower, index) => (
                        <div
                          key={subFlower.id}
                          className="absolute text-xl drop-shadow-md animate-pulse"
                          style={{
                            left: subFlower.x,
                            top: subFlower.y,
                            animationDelay: `${index * 0.2}s`,
                            animationDuration: '2s',
                            transform: `rotate(${Math.random() * 20 - 10}deg)`
                          }}
                        >
                          {subFlower.emoji}
                        </div>
                      ))}
                      
                      {/* Flower name - more prominent */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-base font-bold text-green-800 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg border-2 border-green-300">
                        {flower.name}
                      </div>
                      
                      {/* Flower type at bottom */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-green-700 bg-green-100 bg-opacity-90 px-3 py-1 rounded-full shadow-md">
                        {flower.type}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center relative">
                      <div className="text-xl">{flower.emoji || '🌸'}</div>
                      {/* Small name label for normal size */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm whitespace-nowrap">
                        {flower.name}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty State */}
              {flowerPositions.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Flower className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen bloemen</h3>
                    <p className="text-gray-600 mb-4">Voeg bloemen toe aan dit plantvak.</p>
                    <Button onClick={() => setIsAddingFlower(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Bloem Toevoegen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>💡 <strong>Schaal:</strong> Dit plantvak is {plantBed.size || 'op schaal'} weergegeven</p>
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
                <div>• Maak aangepaste bloemen met eigen emoji en kleur</div>
                <div>• Sleep kleine bloemen om ze te verplaatsen</div>
                <div>• <strong>Klik op een bloem om deze te vergroten</strong> - toont 15+ bloemen</div>
                <div>• Vergrote bloemen tonen de naam en het type prominent</div>
                <div>• Klik nogmaals op een vergrote bloem om te verkleinen</div>
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
              <span className="text-2xl">{selectedFlower?.emoji || '🌸'}</span>
              {selectedFlower?.name}
              {selectedFlower?.isCustom && (
                <Badge variant="outline" className="ml-2">
                  <Palette className="h-3 w-3 mr-1" />
                  Aangepast
                </Badge>
              )}
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
                    <span>{selectedFlower.emoji}</span>
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