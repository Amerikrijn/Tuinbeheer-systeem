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
  Edit,
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
  description?: string
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

const FLOWER_STATUS_OPTIONS = [
  { value: 'healthy', label: 'Gezond', color: 'border-green-500' },
  { value: 'needs_attention', label: 'Aandacht nodig', color: 'border-yellow-500' },
  { value: 'blooming', label: 'Bloeiend', color: 'border-purple-500' },
  { value: 'sick', label: 'Ziek', color: 'border-red-500' },
]

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
  const [isEditingFlower, setIsEditingFlower] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isCustomFlower, setIsCustomFlower] = useState(false)
  const [isEditCustomFlower, setIsEditCustomFlower] = useState(false)
  const [newFlower, setNewFlower] = useState({
    name: '',
    type: '',
    color: '#FF69B4',
    customEmoji: '',
    description: '',
    status: 'healthy' as 'healthy' | 'needs_attention' | 'blooming' | 'sick'
  })
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate canvas size based on plant bed size
  const getCanvasSize = () => {
    if (!plantBed) return { width: 600, height: 400 }
    
    // Convert plant bed size to pixels (rough scale: 1 meter = 100 pixels)
    const sizeMatch = plantBed.size?.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/)
    if (sizeMatch) {
      const width = Math.max(400, parseFloat(sizeMatch[1]) * 100)
      const height = Math.max(300, parseFloat(sizeMatch[2]) * 100)
      return { width, height }
    }
    
    return { width: 600, height: 400 }
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
        
        // Load saved flower positions from localStorage
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
  }, [params.id, params.bedId])

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
      status: newFlower.status,
      emoji: isCustomFlower ? newFlower.customEmoji : selectedType?.emoji,
      isCustom: isCustomFlower,
      description: newFlower.description
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
      description: '',
      status: 'healthy'
    })
    
    toast({
      title: "Bloem toegevoegd",
      description: `${newFlower.name} is toegevoegd aan het plantvak.`,
    })
  }

  const updateFlower = () => {
    if (!selectedFlower || !newFlower.name || (!newFlower.type && !isEditCustomFlower)) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle velden in om de bloem te wijzigen.",
        variant: "destructive",
      })
      return
    }

    if (isEditCustomFlower && !newFlower.customEmoji) {
      toast({
        title: "Emoji vereist",
        description: "Voeg een emoji toe voor je aangepaste bloem.",
        variant: "destructive",
      })
      return
    }

    const selectedType = FLOWER_TYPES.find(type => type.name === newFlower.type)

    setFlowerPositions(prev => prev.map(flower => 
      flower.id === selectedFlower.id 
        ? {
            ...flower,
            name: newFlower.name,
            color: newFlower.color,
            type: isEditCustomFlower ? 'Aangepast' : newFlower.type,
            status: newFlower.status,
            emoji: isEditCustomFlower ? newFlower.customEmoji : selectedType?.emoji,
            isCustom: isEditCustomFlower,
            description: newFlower.description
          }
        : flower
    ))

    setHasChanges(true)
    setIsEditingFlower(false)
    setSelectedFlower(null)
    setIsEditCustomFlower(false)
    setNewFlower({
      name: '',
      type: '',
      color: '#FF69B4',
      customEmoji: '',
      description: '',
      status: 'healthy'
    })
    
    toast({
      title: "Bloem gewijzigd",
      description: `${newFlower.name} is succesvol gewijzigd.`,
    })
  }

  const removeFlower = (flowerId: string) => {
    setFlowerPositions(prev => prev.filter(f => f.id !== flowerId))
    setHasChanges(true)
    setSelectedFlower(null)
    setIsEditingFlower(false)
    toast({
      title: "Bloem verwijderd",
      description: "De bloem is verwijderd uit het plantvak.",
    })
  }

  // Handle single click - select flower for dragging
  const handleFlowerClick = useCallback((e: React.MouseEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    if (selectedFlower?.id === flowerId) {
      // Already selected, start dragging
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setDraggedFlower(flowerId)
      setDragOffset({
        x: (e.clientX - rect.left) / scale - flower.x,
        y: (e.clientY - rect.top) / scale - flower.y
      })
    } else {
      // Select this flower
      setSelectedFlower(flower)
    }
  }, [selectedFlower, flowerPositions, scale])

  // Handle double click - open edit dialog
  const handleFlowerDoubleClick = useCallback((flower: FlowerPosition) => {
    setSelectedFlower(flower)
    setIsEditCustomFlower(flower.isCustom || false)
    setNewFlower({
      name: flower.name,
      type: flower.type,
      color: flower.color,
      customEmoji: flower.emoji || '',
      description: flower.description || '',
      status: flower.status
    })
    setIsEditingFlower(true)
  }, [])

  // Handle drag move
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedFlower || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newX = (e.clientX - rect.left) / scale - dragOffset.x
    const newY = (e.clientY - rect.top) / scale - dragOffset.y

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvasWidth - FLOWER_SIZE))
    const constrainedY = Math.max(0, Math.min(newY, canvasHeight - FLOWER_SIZE))

    setFlowerPositions(prev =>
      prev.map(f =>
        f.id === draggedFlower
          ? { ...f, x: constrainedX, y: constrainedY }
          : f
      )
    )
    setHasChanges(true)
  }, [draggedFlower, dragOffset, scale, canvasWidth, canvasHeight])

  // Handle drag end
  const onMouseUp = useCallback(() => {
    setDraggedFlower(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  // Handle click outside to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedFlower(null)
    }
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
          <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
              Klik om te selecteren, sleep om te verplaatsen, dubbelklik om te bewerken
              <span className="ml-2 text-sm font-medium text-pink-600">
                • {plantBed.size || 'Op schaal'}
              </span>
            </p>
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuwe bloem toe aan dit plantvak. Je kunt het later verplaatsen door te slepen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Naam *
                  </label>
                  <Input
                    id="name"
                    value={newFlower.name}
                    onChange={(e) => setNewFlower(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijvoorbeeld: Mijn mooie roos"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customFlower"
                    checked={isCustomFlower}
                    onChange={(e) => setIsCustomFlower(e.target.checked)}
                  />
                  <label htmlFor="customFlower" className="text-sm font-medium">
                    Aangepaste bloem maken
                  </label>
                </div>

                {!isCustomFlower ? (
                  <div>
                    <label className="text-sm font-medium">Type *</label>
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
                      <label className="text-sm font-medium">Emoji *</label>
                      <Input
                        value={newFlower.customEmoji}
                        onChange={(e) => setNewFlower(prev => ({ ...prev, customEmoji: e.target.value }))}
                        placeholder="🌺"
                        maxLength={2}
                        className="text-2xl text-center"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kies een emoji voor je bloem</p>
                    </div>
                  </div>
                )}

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
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newFlower.status} onValueChange={(value: 'healthy' | 'needs_attention' | 'blooming' | 'sick') => 
                    setNewFlower(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOWER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border-2 ${status.color}`}></div>
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Beschrijving (optioneel)</label>
                  <Textarea
                    value={newFlower.description}
                    onChange={(e) => setNewFlower(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschrijf je bloem..."
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addFlower} className="flex-1 bg-pink-600 hover:bg-pink-700">
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

          {/* Edit Flower Dialog */}
          <Dialog open={isEditingFlower} onOpenChange={setIsEditingFlower}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Bloem Bewerken</DialogTitle>
                <DialogDescription>
                  Wijzig de eigenschappen van deze bloem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">
                    Naam *
                  </label>
                  <Input
                    id="edit-name"
                    value={newFlower.name}
                    onChange={(e) => setNewFlower(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijvoorbeeld: Mijn mooie roos"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editCustomFlower"
                    checked={isEditCustomFlower}
                    onChange={(e) => setIsEditCustomFlower(e.target.checked)}
                  />
                  <label htmlFor="editCustomFlower" className="text-sm font-medium">
                    Aangepaste bloem maken
                  </label>
                </div>

                {!isEditCustomFlower ? (
                  <div>
                    <label className="text-sm font-medium">Type *</label>
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
                      <label className="text-sm font-medium">Emoji *</label>
                      <Input
                        value={newFlower.customEmoji}
                        onChange={(e) => setNewFlower(prev => ({ ...prev, customEmoji: e.target.value }))}
                        placeholder="🌺"
                        maxLength={2}
                        className="text-2xl text-center"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kies een emoji voor je bloem</p>
                    </div>
                  </div>
                )}

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
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newFlower.status} onValueChange={(value: 'healthy' | 'needs_attention' | 'blooming' | 'sick') => 
                    setNewFlower(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOWER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border-2 ${status.color}`}></div>
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Beschrijving (optioneel)</label>
                  <Textarea
                    value={newFlower.description}
                    onChange={(e) => setNewFlower(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschrijf je bloem..."
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={updateFlower} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Wijzigen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => selectedFlower && removeFlower(selectedFlower.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Verwijderen
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingFlower(false)}>
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
          {hasChanges && (
            <Button onClick={saveLayout} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
          )}
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
            <div>
              <div className="font-medium">Grootte</div>
              <div className="text-sm text-gray-600">{plantBed.size || 'Niet opgegeven'}</div>
            </div>
            <div className="flex items-center gap-2">
              {plantBed.sun_exposure && getSunExposureIcon(plantBed.sun_exposure)}
              <div>
                <div className="font-medium">Zonligging</div>
                <div className="text-sm text-gray-600">
                  {plantBed.sun_exposure === 'full-sun' ? 'Volle zon' :
                   plantBed.sun_exposure === 'partial-sun' ? 'Halfschaduw' :
                   plantBed.sun_exposure === 'shade' ? 'Schaduw' : 'Onbekend'}
                </div>
              </div>
            </div>
            <div>
              <div className="font-medium">Bloemen</div>
              <div className="text-sm text-gray-600">{flowerPositions.length}</div>
            </div>
            <div>
              <div className="font-medium">Grondsoort</div>
              <div className="text-sm text-gray-600">{plantBed.soil_type || 'Niet opgegeven'}</div>
            </div>
          </div>
          {plantBed.description && (
            <div className="mt-4">
              <div className="font-medium">Beschrijving</div>
              <p className="text-sm text-gray-600 mt-1">{plantBed.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Bloemen Layout - Op Schaal
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
              onClick={handleCanvasClick}
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
                const isSelected = selectedFlower?.id === flower.id
                const isDragging = draggedFlower === flower.id

                return (
                  <div
                    key={flower.id}
                    className={`absolute cursor-pointer rounded-full border-4 ${getStatusColor(flower.status)} ${
                      isDragging ? "shadow-2xl ring-4 ring-pink-500 z-10 scale-110" : 
                      isSelected ? "ring-4 ring-blue-500 shadow-xl" :
                      "shadow-lg hover:shadow-xl"
                    } transition-all duration-200 flex items-center justify-center text-2xl font-bold text-white`}
                    style={{
                      left: flower.x,
                      top: flower.y,
                      width: flower.width,
                      height: flower.height,
                      backgroundColor: flower.color,
                    }}
                    onClick={(e) => handleFlowerClick(e, flower.id)}
                    onDoubleClick={() => handleFlowerDoubleClick(flower)}
                  >
                    <div className="text-center">
                      <div className="text-xl">{flower.emoji || '🌸'}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Geselecteerd
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Empty State */}
              {flowerPositions.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Flower className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen bloemen</h3>
                    <p className="text-gray-600 mb-4">Voeg bloemen toe aan dit plantvak.</p>
                    <Button onClick={() => setIsAddingFlower(true)} className="bg-pink-600 hover:bg-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Bloem Toevoegen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
            <p>💡 <strong>Tip:</strong> Klik om te selecteren, sleep om te verplaatsen, dubbelklik om te bewerken</p>
            <div className="flex items-center gap-4">
              <p className="text-xs">Zoom: {Math.round(scale * 100)}%</p>
              {selectedFlower && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedFlower.name} geselecteerd
                </Badge>
              )}
              {hasChanges && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Niet opgeslagen wijzigingen
                </Badge>
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
              <h4 className="font-medium mb-3">Hoe te gebruiken</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Klik</strong> op een bloem om deze te selecteren</p>
                <p>• <strong>Sleep</strong> een geselecteerde bloem om te verplaatsen</p>
                <p>• <strong>Dubbelklik</strong> op een bloem om te bewerken</p>
                <p>• <strong>Klik buiten</strong> om selectie op te heffen</p>
                <p>• <strong>Zoom</strong> in/uit voor betere weergave</p>
                <p>• Vergeet niet te <strong>opslaan</strong> na wijzigingen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}