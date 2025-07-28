// Force deployment trigger - emergency rollback version
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
  Save,
  Calendar,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { getGarden, getPlantBeds, getPlantsWithPositions, createVisualPlant, updatePlantPosition, deletePlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"
import { 
  METERS_TO_PIXELS,
  FLOWER_SIZE_MEDIUM,
  parsePlantBedDimensions
} from "@/lib/scaling-constants"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import type { TaskWithPlantInfo, PlantTaskStats } from '@/lib/types/tasks'


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
  
  // Task state
  const [tasks, setTasks] = useState<TaskWithPlantInfo[]>([])
  const [taskStats, setTaskStats] = useState<PlantTaskStats | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  
  // Drag state
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Resize functionaliteit verwijderd - alleen drag & drop
  
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
        
        // Load plant bed tasks
        await loadPlantBedTasks(bedId)
        
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

  // Load plant bed tasks
  const loadPlantBedTasks = async (bedId: string) => {
    try {
      const [tasksResult, statsResult] = await Promise.all([
        TaskService.getTasksForPlantBed(bedId),
        TaskService.getPlantBedTaskStats(bedId)
      ])

      if (tasksResult.error) {
        console.error('Error loading tasks:', tasksResult.error)
      } else {
        setTasks(tasksResult.data)
      }

      if (statsResult.error) {
        console.error('Error loading task stats:', statsResult.error)
      } else {
        setTaskStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading plant bed tasks:', error)
    }
  }

  // Handle task completion toggle
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await TaskService.updateTask(taskId, { completed })
      if (error) {
        console.error('Error updating task:', error)
        return
      }

      // Refresh tasks
      if (plantBed) {
        await loadPlantBedTasks(plantBed.id)
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }
  
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
      const centerX = canvasSize.width / 2 - 60 / 2 // Center with 60px standard size
      const centerY = canvasSize.height / 2 - 60 / 2 // Center with 60px standard size
      
      // ROLLBACK: Gewoon absolute pixels opslaan
      const flowerData = {
        plant_bed_id: plantBed.id,
        name: newFlower.name.trim(),
        color: '#FF69B4', // Default color
        status: newFlower.status as "healthy" | "needs_attention" | "diseased" | "dead" | "harvested",
        position_x: centerX,
        position_y: centerY,
         visual_width: 60, // 60px standard size - names clearly readable
         visual_height: 60, // 60px standard size - names clearly readable
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
      
      // ROLLBACK: Terug naar absolute pixels (percentage systeem gefaald)
      await updatePlantPosition(flower.id, {
        position_x: flower.position_x, // Gewoon absolute pixels
        position_y: flower.position_y, // Gewoon absolute pixels
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

  // Resize functionaliteit volledig verwijderd

  // Handle drag start - AANGEPAST VOOR PERCENTAGE COORDINATEN
  const handleMouseDown = useCallback((e: React.MouseEvent, flowerId: string) => {
    e.preventDefault()
    const flower = flowers.find(f => f.id === flowerId)
    if (!flower) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // ROLLBACK: Gewoon absolute pixels gebruiken
    const offsetX = mouseX - (flower.position_x + flower.visual_width / 2)
    const offsetY = mouseY - (flower.position_y + flower.visual_height / 2)

    setDraggedFlower(flowerId)
    setDragOffset({ x: offsetX, y: offsetY })
    setSelectedFlower(flower)
  }, [flowers, getCanvasSize])

  // Handle drag move - ALLEEN DRAG, GEEN RESIZE
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

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

      // ROLLBACK: Gewoon absolute pixels opslaan
      setFlowers(prev => prev.map(f => 
        f.id === draggedFlower 
          ? { ...f, position_x: constrainedX, position_y: constrainedY }
          : f
      ))
      setHasChanges(true)
    }
  }, [draggedFlower, dragOffset, getCanvasSize, flowers])

  // Handle drag end - ALLEEN DRAG, GEEN RESIZE
  const handleMouseUp = useCallback(async () => {
    // Handle drag end
    if (draggedFlower) {
      const flower = flowers.find(f => f.id === draggedFlower)
      if (flower) {
        await handleSavePosition(flower)
      }
      setDraggedFlower(null)
      setDragOffset({ x: 0, y: 0 })
    }
  }, [draggedFlower, flowers, handleSavePosition])

  // Add global mouse event listeners - ALLEEN VOOR DRAG
  useEffect(() => {
    if (draggedFlower) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedFlower, handleMouseMove, handleMouseUp])
  
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
                       
                       // ROLLBACK: Gewoon absolute pixels gebruiken
                       const pixelX = flower.position_x
                       const pixelY = flower.position_y
                       
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

                           {/* Resize functionaliteit verwijderd - alleen drag & drop */}
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
            

          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Plant Bed Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Plantvak Taken
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddTask(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Taak
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Task Stats */}
                {taskStats && (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{taskStats.total_tasks}</div>
                      <div className="text-xs text-gray-600">Totaal</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{taskStats.completed_tasks}</div>
                      <div className="text-xs text-gray-600">Klaar</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{taskStats.today_tasks}</div>
                      <div className="text-xs text-gray-600">Vandaag</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">{taskStats.overdue_tasks}</div>
                      <div className="text-xs text-gray-600">Achterstallig</div>
                    </div>
                  </div>
                )}

                {/* Active Tasks */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Actieve Taken</h4>
                  {tasks.filter(t => !t.completed).slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                      <button
                        onClick={() => handleTaskToggle(task.id, true)}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className="h-4 w-4 text-gray-400 hover:text-green-600" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="text-xs text-gray-500">{new Date(task.due_date).toLocaleDateString('nl-NL')}</div>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => !t.completed).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">Geen actieve taken</p>
                  )}
                </div>
              </CardContent>
            </Card>

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
                    <div>• <strong>Slepen:</strong> Verplaats bloem door het hele plantvak</div>
                    <div>• <strong>Standaard grootte:</strong> 60px (namen direct leesbaar)</div>
                    <div>• <strong>Bloemnamen:</strong> Staan onder het vakje (beter leesbaar)</div>
                    <div>• <strong>Nieuwe aanpak:</strong> Percentage-based positionering voor perfecte sync met tuin</div>
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

      {/* Add Task Dialog */}
      <AddTaskForm
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={() => {
          setShowAddTask(false)
          if (plantBed) {
            loadPlantBedTasks(plantBed.id)
          }
        }}
        preselectedPlantBedId={plantBed?.id}
      />
    </div>
  )
}