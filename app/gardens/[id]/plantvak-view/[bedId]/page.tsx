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
  
  // Drag state
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Resize state
  const [resizingFlower, setResizingFlower] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null)
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  
  // Add flower dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newFlower, setNewFlower] = useState({
    name: '',
    category: 'flower',
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
      
      // Place new flower in center of plantvak - PERCENTAGE COORDINATEN
      const centerX = canvasSize.width / 2 - 50 / 2 // Center with 50px standard size
      const centerY = canvasSize.height / 2 - 50 / 2 // Center with 50px standard size
      
      // Converteer naar percentages voor opslag
      const percentageX = Math.round((centerX / canvasSize.width) * 1000)
      const percentageY = Math.round((centerY / canvasSize.height) * 1000)
      
      const flowerData = {
        plant_bed_id: plantBed.id,
        name: newFlower.name.trim(),
        color: '#FF69B4', // Default color
        status: newFlower.status as "healthy" | "needs_attention" | "diseased" | "dead" | "harvested",
        position_x: percentageX,
        position_y: percentageY,
         visual_width: 50, // 50px standard size - names clearly readable
         visual_height: 50, // 50px standard size - names clearly readable
         emoji: '🌸',
         is_custom: false,
                   category: newFlower.category,
         notes: ''
       }
       
               const newFlowerRecord = await createVisualPlant(flowerData)
        if (newFlowerRecord) {
          setFlowers(prev => [...prev, newFlowerRecord])
        }
      
              // Reset form
        setNewFlower({
          name: '',
          category: 'flower',
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
  
  // Save flower position - NIEUWE AANPAK: PERCENTAGE COORDINATEN
  const handleSavePosition = useCallback(async (flower: PlantWithPosition) => {
    try {
      const canvasSize = getCanvasSize()
      
      // RADICALE VERANDERING: Sla coordinaten op als percentages (0.0-1.0)
      const percentageX = flower.position_x / canvasSize.width
      const percentageY = flower.position_y / canvasSize.height
      
      // Sla percentages op in de database (vermenigvuldigd met 1000 voor precisie)
      await updatePlantPosition(flower.id, {
        position_x: Math.round(percentageX * 1000), // 0-1000 voor precisie
        position_y: Math.round(percentageY * 1000), // 0-1000 voor precisie
        visual_width: flower.visual_width,
        visual_height: flower.visual_height,
        notes: flower.notes
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving position:', error)
    }
  }, [getCanvasSize])



  // Get plant emoji (same logic as FlowerVisualization)
  const getPlantEmoji = useCallback((name?: string, storedEmoji?: string): string => {
    if (storedEmoji && storedEmoji.trim()) {
      return storedEmoji
    }
    
    const plantName = (name || '').toLowerCase()
    
    if (plantName.includes('zinnia')) return '🌻'
    if (plantName.includes('marigold') || plantName.includes('tagetes')) return '🌼'
    if (plantName.includes('impatiens')) return '🌸'
    if (plantName.includes('ageratum')) return '🌸'
    if (plantName.includes('salvia')) return '🌺'
    if (plantName.includes('verbena')) return '🌸'
    if (plantName.includes('lobelia')) return '🌸'
    if (plantName.includes('alyssum')) return '🤍'
    if (plantName.includes('cosmos')) return '🌸'
    if (plantName.includes('petunia')) return '🌺'
    if (plantName.includes('begonia')) return '🌸'
    if (plantName.includes('viooltje') || plantName.includes('viola')) return '🌸'
    if (plantName.includes('stiefmoedje') || plantName.includes('pansy')) return '🌸'
    if (plantName.includes('snapdragon') || plantName.includes('leeuwenbek')) return '🌸'
    if (plantName.includes('zonnebloem') || plantName.includes('sunflower')) return '🌻'
    if (plantName.includes('calendula') || plantName.includes('goudsbloem')) return '🌼'
    if (plantName.includes('nicotiana') || plantName.includes('siertabak')) return '🤍'
    if (plantName.includes('cleome') || plantName.includes('spinnenbloem')) return '🌸'
    if (plantName.includes('celosia') || plantName.includes('hanekam')) return '🌺'
    
    return '🌸'
  }, [])

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, flowerId: string, handle: 'se' | 'sw' | 'ne' | 'nw') => {
    e.preventDefault()
    e.stopPropagation()
    
    const flower = flowers.find(f => f.id === flowerId)
    if (!flower) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    // FIX: Don't divide by scale - getBoundingClientRect already accounts for CSS transform
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setResizingFlower(flowerId)
    setResizeHandle(handle)
    setResizeStartPos({ x: mouseX, y: mouseY })
    setResizeStartSize({ width: flower.visual_width, height: flower.visual_height })
    setSelectedFlower(flower)
  }, [flowers, scale])

  // Handle drag start - AANGEPAST VOOR PERCENTAGE COORDINATEN
  const handleMouseDown = useCallback((e: React.MouseEvent, flowerId: string) => {
    e.preventDefault()
    const flower = flowers.find(f => f.id === flowerId)
    if (!flower) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Converteer percentage naar pixels voor offset berekening
    const canvasSize = getCanvasSize()
    const pixelX = (flower.position_x / 1000) * canvasSize.width
    const pixelY = (flower.position_y / 1000) * canvasSize.height

    // Calculate offset from flower center
    const offsetX = mouseX - (pixelX + flower.visual_width / 2)
    const offsetY = mouseY - (pixelY + flower.visual_height / 2)

    setDraggedFlower(flowerId)
    setDragOffset({ x: offsetX, y: offsetY })
    setSelectedFlower(flower)
  }, [flowers, getCanvasSize])

  // Handle drag move and resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    // FIX: Don't divide by scale - getBoundingClientRect already accounts for CSS transform
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Handle resize
    if (resizingFlower && resizeHandle) {
      const deltaX = mouseX - resizeStartPos.x
      const deltaY = mouseY - resizeStartPos.y
      
      let newWidth = resizeStartSize.width
      let newHeight = resizeStartSize.height

      // Calculate new size - all handles now grow from top-left to prevent position changes
      switch (resizeHandle) {
        case 'se': // Southeast - bottom right
          newWidth = Math.max(20, resizeStartSize.width + deltaX)
          newHeight = Math.max(20, resizeStartSize.height + deltaY)
          break
        case 'sw': // Southwest - bottom left  
          newWidth = Math.max(20, resizeStartSize.width + Math.abs(deltaX))
          newHeight = Math.max(20, resizeStartSize.height + deltaY)
          break
        case 'ne': // Northeast - top right
          newWidth = Math.max(20, resizeStartSize.width + deltaX)
          newHeight = Math.max(20, resizeStartSize.height + Math.abs(deltaY))
          break
        case 'nw': // Northwest - top left
          newWidth = Math.max(20, resizeStartSize.width + Math.abs(deltaX))
          newHeight = Math.max(20, resizeStartSize.height + Math.abs(deltaY))
          break
      }
      
      // No position deltas - flower stays in same position

      // Keep aspect ratio (square flowers) and limit max size to plantvak size
      const canvasSize = getCanvasSize()
      const maxSize = Math.min(canvasSize.width, canvasSize.height) // Can be as big as plantvak
      const size = Math.min(Math.max(20, Math.min(newWidth, newHeight)), maxSize)
      
              // Update flower size only - position stays the same
        setFlowers(prev => prev.map(f => {
          if (f.id === resizingFlower) {
            const originalFlower = flowers.find(flower => flower.id === resizingFlower)
            if (!originalFlower) return f
            
            // Keep original position - no movement during resize
            const currentPosX = originalFlower.position_x
            const currentPosY = originalFlower.position_y
            
            // Ensure flower stays within canvas bounds (only if it would go outside)
            const constrainedPosX = Math.max(0, Math.min(currentPosX, canvasSize.width - size))
            const constrainedPosY = Math.max(0, Math.min(currentPosY, canvasSize.height - size))
            
            return {
              ...f,
              visual_width: size,
              visual_height: size,
              position_x: constrainedPosX,
              position_y: constrainedPosY
            }
          }
          return f
        }))
      setHasChanges(true)
      return
    }

    // Handle drag - AANGEPAST VOOR PERCENTAGE COORDINATEN
    if (draggedFlower) {
      const draggedFlowerData = flowers.find(f => f.id === draggedFlower)
      if (!draggedFlowerData) return
      
      const flowerSize = draggedFlowerData.visual_width
      
      // Calculate new position (dragOffset is already from center)
      const centerX = mouseX - dragOffset.x
      const centerY = mouseY - dragOffset.y

      const canvasSize = getCanvasSize()
      
      // Convert center position to top-left for storage
      const topLeftX = centerX - flowerSize/2
      const topLeftY = centerY - flowerSize/2
      
      // Constrain to canvas bounds
      const constrainedX = Math.max(0, Math.min(topLeftX, canvasSize.width - flowerSize))
      const constrainedY = Math.max(0, Math.min(topLeftY, canvasSize.height - flowerSize))

      // NIEUWE AANPAK: Converteer pixels naar percentages voor opslag
      const percentageX = Math.round((constrainedX / canvasSize.width) * 1000)
      const percentageY = Math.round((constrainedY / canvasSize.height) * 1000)

      setFlowers(prev => prev.map(f => 
        f.id === draggedFlower 
          ? { ...f, position_x: percentageX, position_y: percentageY }
          : f
      ))
      setHasChanges(true)
    }
  }, [draggedFlower, dragOffset, scale, getCanvasSize, resizingFlower, resizeHandle, resizeStartPos, resizeStartSize, flowers])

  // Handle drag end and resize end
  const handleMouseUp = useCallback(async () => {
    // Handle resize end
    if (resizingFlower) {
      const flower = flowers.find(f => f.id === resizingFlower)
      if (flower) {
        await handleSavePosition(flower)
      }
      setResizingFlower(null)
      setResizeHandle(null)
      setResizeStartPos({ x: 0, y: 0 })
      setResizeStartSize({ width: 0, height: 0 })
      return
    }

    // Handle drag end
    if (draggedFlower) {
      const flower = flowers.find(f => f.id === draggedFlower)
      if (flower) {
        await handleSavePosition(flower)
      }
      setDraggedFlower(null)
      setDragOffset({ x: 0, y: 0 })
    }
  }, [draggedFlower, resizingFlower, flowers, handleSavePosition])

  // Add global mouse event listeners
  useEffect(() => {
    if (draggedFlower || resizingFlower) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedFlower, resizingFlower, handleMouseMove, handleMouseUp])
  
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
                             value={newFlower.category}
                             onValueChange={(value) => setNewFlower(prev => ({ ...prev, category: value }))}
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
                    className="relative bg-gradient-to-br from-green-25 to-green-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                    style={{
                      width: `${canvasSize.width * scale}px`,
                      height: `${canvasSize.height * scale}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    {/* Plantvak visual indicator - match tuin view */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none"></div>
                    
                    {/* Corner decorations to emphasize the plant bed area - match tuin view */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-green-400 rounded-tl-lg pointer-events-none"></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-green-400 rounded-tr-lg pointer-events-none"></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-green-400 rounded-bl-lg pointer-events-none"></div>
                                         <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-green-400 rounded-br-lg pointer-events-none"></div>

                     {/* Empty state indicator - match tuin view */}
                     {flowers.length === 0 && (
                       <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-gray-500 text-sm font-medium bg-white/80 px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
                           🌱 Leeg plantvak
                         </div>
                       </div>
                     )}

                     {/* Draggable interactive flowers - styled like tuin overzicht */}
                     {flowers.map((flower) => {
                       const isDragging = draggedFlower === flower.id
                       const emoji = getPlantEmoji(flower.name, flower.emoji)
                       const flowerColor = flower.color || '#ec4899' // fallback to pink
                       
                       // NIEUWE AANPAK: Converteer percentages naar pixels
                       const canvasSize = getCanvasSize()
                       const pixelX = (flower.position_x / 1000) * canvasSize.width  // 0-1000 -> 0-canvasWidth
                       const pixelY = (flower.position_y / 1000) * canvasSize.height // 0-1000 -> 0-canvasHeight
                       
                       return (
                         <div
                           key={flower.id}
                           className={`absolute transition-all duration-500 ease-in-out ${
                             isDragging ? 'cursor-grabbing z-30 scale-110' : 'cursor-grab z-10'
                           } ${selectedFlower?.id === flower.id ? 'ring-4 ring-blue-500 z-20' : ''}`}
                           style={{
                             left: `${pixelX}px`,
                             top: `${pixelY}px`,
                             width: `${flower.visual_width}px`,
                             height: `${flower.visual_height}px`,
                             opacity: isDragging ? 0.9 : 1,
                             zIndex: selectedFlower?.id === flower.id ? 10 : 8,
                           }}
                           onMouseDown={(e) => handleMouseDown(e, flower.id)}
                           onClick={() => !isDragging && setSelectedFlower(flower)}
                         >
                           {/* Flower container with border and background - only emoji */}
                           <div
                             className="w-full h-full border-2 border-gray-400 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center"
                             style={{
                               borderColor: `${flowerColor}60`, // More visible border in flower color
                               backgroundColor: `${flowerColor}15`, // Slightly more visible background tint
                             }}
                           >
                             {/* Flower emoji - centered */}
                             <span 
                               className="select-none"
                               style={{
                                 fontSize: Math.max(16, flower.visual_width * 0.5), // Bigger emoji since no text inside
                                 filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                               }}
                             >
                               {emoji}
                             </span>
                           </div>

                           {/* Flower name - UNDER the flower box */}
                           <div 
                             className="absolute text-xs font-medium text-gray-800 text-center select-none bg-white/90 px-2 py-1 rounded shadow-sm border"
                             style={{
                               top: `${flower.visual_height + 2}px`, // Position below the flower
                               left: '50%',
                               transform: 'translateX(-50%)',
                               fontSize: Math.max(8, flower.visual_width * 0.16),
                               maxWidth: `${Math.max(flower.visual_width, 80)}px`, // At least as wide as flower
                               whiteSpace: 'nowrap',
                               overflow: 'hidden',
                               textOverflow: 'ellipsis',
                               zIndex: 5
                             }}
                           >
                             {flower.name}
                           </div>

                           {/* Glow effect for selected flowers */}
                           {selectedFlower?.id === flower.id && (
                             <div
                               className="absolute inset-0 rounded-lg opacity-20 blur-sm -z-10"
                               style={{
                                 backgroundColor: flowerColor,
                                 transform: 'scale(1.2)',
                               }}
                             />
                           )}

                           {/* Resize handles - only show for selected flower */}
                           {selectedFlower?.id === flower.id && (
                             <>
                               {/* Southeast handle */}
                               <div
                                 className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize hover:bg-blue-600 shadow-sm"
                                 style={{
                                   right: '-6px',
                                   bottom: '-6px',
                                 }}
                                 onMouseDown={(e) => handleResizeStart(e, flower.id, 'se')}
                               />
                               
                               {/* Southwest handle */}
                               <div
                                 className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize hover:bg-blue-600 shadow-sm"
                                 style={{
                                   left: '-6px',
                                   bottom: '-6px',
                                 }}
                                 onMouseDown={(e) => handleResizeStart(e, flower.id, 'sw')}
                               />
                               
                               {/* Northeast handle */}
                               <div
                                 className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize hover:bg-blue-600 shadow-sm"
                                 style={{
                                   right: '-6px',
                                   top: '-6px',
                                 }}
                                 onMouseDown={(e) => handleResizeStart(e, flower.id, 'ne')}
                               />
                               
                               {/* Northwest handle */}
                               <div
                                 className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize hover:bg-blue-600 shadow-sm"
                                 style={{
                                   left: '-6px',
                                   top: '-6px',
                                 }}
                                 onMouseDown={(e) => handleResizeStart(e, flower.id, 'nw')}
                               />
                             </>
                           )}
                         </div>
                       )
                     })}
                    
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
            
            {/* Plantvak Info onder de canvas */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{plantBed?.name}</h3>
                  <div className="flex justify-center items-center gap-6 text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Afmetingen:</span>
                      <span>{plantBed?.size}</span>
                    </div>
                    {plantBed?.sun_exposure && (
                      <div className="flex items-center gap-1">
                        {plantBed.sun_exposure === 'full-sun' && <Sun className="w-4 h-4" />}
                        {plantBed.sun_exposure === 'partial-sun' && <CloudSun className="w-4 h-4" />}
                        {plantBed.sun_exposure === 'shade' && <Cloud className="w-4 h-4" />}
                        <span className="capitalize">
                          {plantBed.sun_exposure === 'full-sun' ? 'Volle zon' :
                           plantBed.sun_exposure === 'partial-sun' ? 'Gedeeltelijke zon' : 'Schaduw'}
                        </span>
                      </div>
                    )}
                    {plantBed?.soil_type && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Grond:</span>
                        <span className="capitalize">{plantBed.soil_type}</span>
                      </div>
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
                                         <p className="text-sm text-gray-600 capitalize">{selectedFlower.category || 'flower'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Positie:</span> {Math.round(selectedFlower.position_x)}, {Math.round(selectedFlower.position_y)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Grootte:</span> {selectedFlower.visual_width}×{selectedFlower.visual_height}px
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <div className="font-medium mb-1">💡 Besturing:</div>
                    <div>• <strong>Slepen:</strong> Verplaats bloem</div>
                    <div>• <strong>Resize handles:</strong> Trek aan blauwe bolletjes om grootte aan te passen</div>
                    <div>• <strong>Resize gedrag:</strong> Bloem blijft VAST op dezelfde plek tijdens vergroten</div>
                    <div>• <strong>Standaard grootte:</strong> 50px (namen direct leesbaar)</div>
                    <div>• <strong>Bloemnamen:</strong> Staan nu onder het vakje (beter leesbaar)</div>
                    <div>• <strong>Max grootte:</strong> Zo groot als het hele plantvak!</div>
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
                                                         <p className="text-xs text-gray-500 capitalize">{flower.category || 'flower'}</p>
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