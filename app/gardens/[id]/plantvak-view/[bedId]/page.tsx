"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useNavigation } from "@/hooks/use-navigation"
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
  Move,
  Maximize2,
  ChevronDown,
  X,
  Minus,
  Upload,
  Image as ImageIcon,
  List,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
// useToast removed - no more toast notifications
import { getGarden, getPlantBeds, getPlantsWithPositions, createVisualPlant, updatePlantPosition, deletePlant, updatePlantBed, deletePlantBed } from "@/lib/database"
import { TaskService } from "@/lib/services/task.service"
import { AddTaskForm } from "@/components/tasks/add-task-form"
import { PlantForm, PlantFormData, PlantFormErrors, createInitialPlantFormData } from "@/components/ui/plant-form"
import type { Garden, PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"
import type { TaskWithPlantInfo, WeeklyTask } from "@/lib/types/tasks"
import { getTaskTypeConfig, getPriorityConfig, formatTaskDate } from "@/lib/types/tasks"
import { uploadImage, type UploadResult } from "@/lib/storage"
import { FlowerVisualization } from "@/components/flower-visualization"
import {
  METERS_TO_PIXELS,
  PLANTVAK_CANVAS_PADDING,
  FLOWER_SIZE_SMALL,
  FLOWER_SIZE_MEDIUM,
  FLOWER_SIZE_LARGE,
  FLOWER_NAME_HEIGHT,
  metersToPixels,
  calculatePlantBedCanvasSize,
  parsePlantBedDimensions
} from "@/lib/scaling-constants"
import { ViewPreferencesService, ViewMode } from '@/lib/services/view-preferences.service'

const GRID_SIZE = 10
const SCALE_MIN = 0.5
const SCALE_MAX = 3
const FLOWER_SIZE = FLOWER_SIZE_MEDIUM // Default to medium size (now 45px)

const STANDARD_FLOWERS = [
  // Eenjarige bloemen (Annual flowers only)
  { name: 'Zinnia', color: '#FF6347', emoji: '🌻' },
  { name: 'Marigold', color: '#FFA500', emoji: '🌼' },
  { name: 'Tagetes', color: '#FFA500', emoji: '🌼' },
  { name: 'Impatiens', color: '#FF69B4', emoji: '🌸' },
  { name: 'Ageratum', color: '#6495ED', emoji: '🌸' },
  { name: 'Salvia', color: '#DC143C', emoji: '🌺' },
  { name: 'Verbena', color: '#9370DB', emoji: '🌸' },
  { name: 'Lobelia', color: '#4169E1', emoji: '🌸' },
  { name: 'Alyssum', color: '#FFFFFF', emoji: '🤍' },
  { name: 'Cosmos', color: '#FFB6C1', emoji: '🌸' },
  { name: 'Petunia', color: '#FF6B6B', emoji: '🌺' },
  { name: 'Begonia', color: '#FF8C69', emoji: '🌸' },
  { name: 'Viooltje', color: '#9370DB', emoji: '🌸' },
  { name: 'Stiefmoedje', color: '#9370DB', emoji: '🌸' },
  { name: 'Snapdragon', color: '#FF69B4', emoji: '🌸' },
  { name: 'Leeuwenbek', color: '#FF69B4', emoji: '🌸' },
  { name: 'Zonnebloem', color: '#FFD700', emoji: '🌻' },
  { name: 'Calendula', color: '#FFA500', emoji: '🌼' },
  { name: 'Goudsbloem', color: '#FFA500', emoji: '🌼' },
  { name: 'Nicotiana', color: '#FFFFFF', emoji: '🤍' },
  { name: 'Siertabak', color: '#FFFFFF', emoji: '🤍' },
  { name: 'Cleome', color: '#FF69B4', emoji: '🌸' },
  { name: 'Spinnenbloem', color: '#FF69B4', emoji: '🌸' },
  { name: 'Celosia', color: '#FF6347', emoji: '🌺' },
  { name: 'Hanekam', color: '#FF6347', emoji: '🌺' },
]

const DEFAULT_FLOWER_EMOJI = '🌼'

const DEFAULT_FLOWER_COLORS = [
  '#FF69B4', '#FF4500', '#FFD700', '#9370DB', '#FF1493', 
  '#FFA500', '#FFFF00', '#4B0082', '#FF6B6B', '#FF8C69',
  '#32CD32', '#00CED1', '#FF6347', '#DDA0DD', '#98FB98'
]

const FLOWER_STATUS_OPTIONS = [
  { value: 'gezond', label: 'Gezond', color: 'border-green-500' },
  { value: 'aandacht_nodig', label: 'Aandacht nodig', color: 'border-yellow-500' },
  { value: 'bloeiend', label: 'Bloeiend', color: 'border-purple-500' },
  { value: 'ziek', label: 'Ziek', color: 'border-red-500' },
]

  // Helper function to get flower size in pixels
  const getFlowerSize = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return FLOWER_SIZE_SMALL
      case 'medium': return FLOWER_SIZE_MEDIUM  
      case 'large': return FLOWER_SIZE_LARGE
      default: return FLOWER_SIZE_MEDIUM
    }
  }

  // Helper function to get color name from hex value
  const getColorName = (hex: string): string => {
    const colorNames: { [key: string]: string } = {
      '#FF69B4': 'Roze',
      '#FF4500': 'Oranje-rood',
      '#FFD700': 'Goud',
      '#9370DB': 'Paars',
      '#FF1493': 'Diep roze',
      '#FFA500': 'Oranje',
      '#FFFF00': 'Geel',
      '#4B0082': 'Indigo',
      '#FF6B6B': 'Koraal',
      '#FF8C69': 'Zalm',
      '#32CD32': 'Lime groen',
      '#00CED1': 'Turquoise',
      '#FF6347': 'Tomaat',
      '#DDA0DD': 'Lila',
      '#98FB98': 'Licht groen'
    };
    return colorNames[hex] || hex;
  }

  // Helper function to get emoji based on plant name or category (optional)
  const getPlantEmoji = (name?: string, category?: string): string | undefined => {
  const plantName = (name || '').toLowerCase()
  const plantCategory = (category || '').toLowerCase()
  
  // Exacte matches voor eenjarige bloemen
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
  
  // Match by category
  if (plantCategory.includes('eenjarig') || plantCategory.includes('annual')) return '🌸'
  
  // Default: no emoji, show name instead
  return undefined
}

export default function PlantBedViewPage() {
  const router = useRouter()
  const params = useParams()
  const { goBack } = useNavigation()
  // toast removed - no more notifications
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [flowerPositions, setFlowerPositions] = useState<PlantWithPosition[]>([])
  const [scale, setScale] = useState(1)
  const [selectedFlower, setSelectedFlower] = useState<PlantWithPosition | null>(null)
  const resizeModeRef = useRef<string | null>(null) // Track resize mode with ref
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeMode, setResizeMode] = useState<'uniform' | 'width' | 'height'>('uniform')
  const [duplicatePositions, setDuplicatePositions] = useState<{x: number, y: number}[]>([])
  const [isDragMode, setIsDragMode] = useState(false)
  const [isResizeMode, setIsResizeMode] = useState(false)
  const [showResizeInterface, setShowResizeInterface] = useState(false)
  const [resizeInterfacePosition, setResizeInterfacePosition] = useState({ x: 0, y: 0 })
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isAddingFlower, setIsAddingFlower] = useState(false)
  const [isEditingFlower, setIsEditingFlower] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isCustomFlower, setIsCustomFlower] = useState(false)
  const [isEditCustomFlower, setIsEditCustomFlower] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [newFlower, setNewFlower] = useState<PlantFormData>(createInitialPlantFormData())
  const [newFlowerErrors, setNewFlowerErrors] = useState<PlantFormErrors>({})
  const [isEditingPlantBed, setIsEditingPlantBed] = useState(false)
  const [showDeletePlantBedDialog, setShowDeletePlantBedDialog] = useState(false)
  const [plantBedForm, setPlantBedForm] = useState({
    name: '',
    length: '',
    width: '',
    description: '',
    sun_exposure: 'full-sun' as 'full-sun' | 'partial-sun' | 'shade',
    soil_type: 'loam' as 'clay' | 'sand' | 'loam' | 'peat'
  })
  // Use global view preferences with mobile detection
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [isViewInitialized, setIsViewInitialized] = useState(false)

  // Initialize view mode from global preferences
  useEffect(() => {
    const initialMode = ViewPreferencesService.getViewMode()
    setViewMode(initialMode)
    setIsViewInitialized(true)

    // Listen for view mode changes from other components
    const cleanup = ViewPreferencesService.onViewModeChange((newMode) => {
      setViewMode(newMode)
    })

    return cleanup
  }, [])

  // Update view mode and sync globally
  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    ViewPreferencesService.setViewMode(mode)
  }
  
  // Task-related state
  const [tasks, setTasks] = useState<TaskWithPlantInfo[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedTaskPlantId, setSelectedTaskPlantId] = useState<string | undefined>()
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Use consistent navigation hook for back navigation

  // Load tasks for this plant bed and its plants
  const loadTasks = async () => {
    if (!params.bedId) return
    
    setLoadingTasks(true)
    try {
      // Get tasks for the plant bed itself
      const { data: plantBedTasks, error: bedError } = await TaskService.getTasksWithPlantInfo({
        plant_bed_id: params.bedId as string
      })
      
      // Get tasks for all plants in this bed
      const plantIds = flowerPositions.map(flower => flower.id)
      const plantTaskPromises = plantIds.map(plantId => 
        TaskService.getTasksWithPlantInfo({ plant_id: plantId })
      )
      
      const plantTaskResults = await Promise.all(plantTaskPromises)
      const allPlantTasks = plantTaskResults.flatMap(result => result.data || [])
      
      // Combine and deduplicate all tasks: incomplete first (by due date), then completed at bottom
      const allTasks = [...(plantBedTasks || []), ...allPlantTasks]
      
      // Remove duplicates based on task ID
      const uniqueTasks = allTasks.filter((task, index, array) => 
        array.findIndex(t => t.id === task.id) === index
      )
      
      uniqueTasks.sort((a, b) => {
        // Completed tasks go to bottom
        if (a.completed && !b.completed) return 1
        if (!a.completed && b.completed) return -1
        
        // Within same completion status, sort by due date
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
      
      setTasks(uniqueTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  // Consistent task completion handler with automatic reordering
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    // Add task to updating set for visual feedback
    setUpdatingTasks(prev => new Set(prev).add(taskId))
    
    try {
      // Immediately update local state for responsive UI
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => 
          task.id === taskId ? { ...task, completed, completed_at: completed ? new Date().toISOString() : undefined } : task
        )
        
        // Re-sort: incomplete first (by due date), then completed at bottom
        return updatedTasks.sort((a, b) => {
          // Completed tasks go to bottom
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          
          // Within same completion status, sort by due date
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })
      })
      
      // Update task in database
      const { error } = await TaskService.updateTask(taskId, { completed })
      
      if (error) {
        console.error('Error updating task:', error)
        // Revert the optimistic update
        setTasks(prevTasks => {
          const revertedTasks = prevTasks.map(task => 
            task.id === taskId ? { ...task, completed: !completed, completed_at: !completed ? new Date().toISOString() : undefined } : task
          )
          return revertedTasks.sort((a, b) => {
            if (a.completed && !b.completed) return 1
            if (!a.completed && b.completed) return -1
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          })
        })
        return
      }
      
    } catch (error) {
      console.error('Error completing task:', error)
      // Revert optimistic update on error
      setTasks(prevTasks => {
        const revertedTasks = prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: !completed, completed_at: !completed ? new Date().toISOString() : undefined } : task
        )
        return revertedTasks.sort((a, b) => {
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })
      })
    } finally {
      // Remove task from updating set
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  // Handle adding task for plant bed or specific plant
  const handleAddTask = (plantId?: string) => {
    setSelectedTaskPlantId(plantId)
    setShowAddTask(true)
  }

  // Handle task added - reload tasks
  const handleTaskAdded = () => {
    loadTasks()
    setShowAddTask(false)
    setSelectedTaskPlantId(undefined)
  }

  // Calculate canvas size based on plant bed size using consistent scaling
  const getCanvasSize = () => {
    if (!plantBed?.size) return { width: 600, height: 450 }
    
    const dimensions = parsePlantBedDimensions(plantBed.size)
    if (dimensions) {
      // Ensure proper aspect ratio and enough space for movement
      const padding = PLANTVAK_CANVAS_PADDING
      const minWidth = 500
      const minHeight = 400
      
      // Calculate canvas size maintaining proper aspect ratio
      const canvasWidth = Math.max(minWidth, dimensions.lengthPixels + padding * 2)
      const canvasHeight = Math.max(minHeight, dimensions.widthPixels + padding * 2)
      
      return { width: canvasWidth, height: canvasHeight }
    }
    
    return calculatePlantBedCanvasSize(plantBed.size)
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
        
        // Load plants from database instead of localStorage
        if (params.bedId) {
          const plants = await getPlantsWithPositions(params.bedId as string)
                  console.log('Loading plants from database:', plants)
        
        // DEBUG: Show initial flower positions
        console.log('🌸 INITIAL POSITIONS:', plants.map(p => ({
          name: p.name,
          x: p.position_x,
          y: p.position_y,
          size: { w: p.visual_width, h: p.visual_height }
        })))
        
        setFlowerPositions(plants)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setGarden(null)
        setPlantBed(null)
        setFlowerPositions([])
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id && params.bedId) {
      loadData()
    }
  }, [params.id, params.bedId])

  // Load tasks when plant bed or flowers change
  useEffect(() => {
    if (plantBed && flowerPositions.length >= 0) {
      loadTasks()
    }
  }, [plantBed, flowerPositions])

  // Smart auto-fill for flower beds based on size
  const autoFillFlowerBed = useCallback(async () => {
    if (!plantBed || flowerPositions.length === 0) return // Only if there are existing flowers
    
    const currentFlowerCount = flowerPositions.length
    
    // Get the plantvak dimensions from the size string
    const dimensions = plantBed.size ? parsePlantBedDimensions(plantBed.size) : null
    if (!dimensions) return
    
    const plantvakWidthMeters = dimensions.lengthMeters
    const plantvakHeightMeters = dimensions.widthMeters
    const plantvakAreaMeters = plantvakWidthMeters * plantvakHeightMeters
    
    // Calculate target flower count based on plantvak area in square meters
    let targetFlowerCount = currentFlowerCount // Start with current count
    
    if (plantvakAreaMeters <= 4) {
      // Small beds (≤ 2x2m): 1-3 flowers
      targetFlowerCount = Math.min(3, Math.max(1, currentFlowerCount))
    } else if (plantvakAreaMeters <= 9) {
      // Medium beds (≤ 3x3m): 2-5 flowers  
      targetFlowerCount = Math.min(5, Math.max(2, currentFlowerCount + 1))
    } else if (plantvakAreaMeters <= 16) {
      // Large beds (≤ 4x4m): 3-7 flowers
      targetFlowerCount = Math.min(7, Math.max(3, currentFlowerCount + 2))
    } else {
      // Very large beds (> 4x4m): 4-10 flowers max
      targetFlowerCount = Math.min(10, Math.max(4, currentFlowerCount + 2))
    }
    
    // Only add flowers if we're below target and the bed is reasonably large
    if (currentFlowerCount < targetFlowerCount && plantvakAreaMeters > 2) {
      const flowersToAdd = Math.min(2, targetFlowerCount - currentFlowerCount) // Max 2 at a time
      
      // Use the same type as existing flowers (take the most common type)
      const flowerTypes = flowerPositions.reduce((acc, flower) => {
        acc[flower.name] = (acc[flower.name] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const mostCommonFlowerName = Object.keys(flowerTypes).reduce((a, b) => 
        flowerTypes[a] > flowerTypes[b] ? a : b
      )
      
      const templateFlower = flowerPositions.find(f => f.name === mostCommonFlowerName)
      if (!templateFlower) return
      
      const plantvakWidth = dimensions.lengthPixels
      const plantvakHeight = dimensions.widthPixels
      const plantvakStartX = (canvasWidth - plantvakWidth) / 2
      const plantvakStartY = (canvasHeight - plantvakHeight) / 2
      
      for (let i = 0; i < flowersToAdd; i++) {
        const margin = 25
        const flowerSize = templateFlower.visual_width || FLOWER_SIZE_MEDIUM
        
        // Ensure we have enough space for the flower
        const availableWidth = plantvakWidth - margin * 2 - flowerSize
        const availableHeight = plantvakHeight - margin * 2 - flowerSize
        
        if (availableWidth <= 0 || availableHeight <= 0) {
          console.log("Not enough space in plantvak for more flowers")
          break
        }
        
        const positionX = plantvakStartX + margin + Math.random() * availableWidth
        const positionY = plantvakStartY + margin + Math.random() * availableHeight
        
        try {
          const newFlower = await createVisualPlant({
            plant_bed_id: plantBed.id,
            name: templateFlower.name,
            color: templateFlower.color || '#FF69B4',
            status: templateFlower.status || 'gezond',
            position_x: positionX,
            position_y: positionY,
            visual_width: flowerSize,
            visual_height: flowerSize,
            emoji: templateFlower.emoji,
            is_custom: templateFlower.is_custom || false,
            category: templateFlower.category,
            notes: `Extra ${templateFlower.name} - ${plantvakAreaMeters.toFixed(1)}m²`
          })
          
          if (newFlower) {
            setFlowerPositions(prev => [...prev, newFlower])
          }
        } catch (error) {
          console.error("Error auto-adding flower:", error)
        }
      }
      
      // Removed toast notification
    }
  }, [plantBed, canvasWidth, canvasHeight, flowerPositions])

  // Clean up flowers that are outside the plantvak boundaries
  const cleanupFlowersOutsideBoundaries = useCallback(async () => {
    if (!plantBed || flowerPositions.length === 0) return
    
    const dimensions = plantBed.size ? parsePlantBedDimensions(plantBed.size) : null
    if (!dimensions) return
    
    const plantvakWidth = dimensions.lengthPixels
    const plantvakHeight = dimensions.widthPixels
    const plantvakStartX = (canvasWidth - plantvakWidth) / 2
    const plantvakStartY = (canvasHeight - plantvakHeight) / 2
    const plantvakEndX = plantvakStartX + plantvakWidth
    const plantvakEndY = plantvakStartY + plantvakHeight
    
    const flowersOutside = flowerPositions.filter(flower => {
      const flowerEndX = flower.position_x + (flower.visual_width || FLOWER_SIZE_MEDIUM)
      const flowerEndY = flower.position_y + (flower.visual_height || FLOWER_SIZE_MEDIUM)
      
      return (
        flower.position_x < plantvakStartX || 
        flower.position_y < plantvakStartY ||
        flowerEndX > plantvakEndX ||
        flowerEndY > plantvakEndY
      )
    })
    
    if (flowersOutside.length > 0) {
      console.log(`Found ${flowersOutside.length} flowers outside plantvak boundaries, moving them inside...`)
      
      // Move flowers inside the boundaries with better distribution
      for (let i = 0; i < flowersOutside.length; i++) {
        const flower = flowersOutside[i]
        const flowerSize = flower.visual_width || FLOWER_SIZE_MEDIUM
        const margin = 15
        
        const availableWidth = plantvakWidth - margin * 2 - flowerSize
        const availableHeight = plantvakHeight - margin * 2 - flowerSize
        
        let newX, newY
        
        if (availableWidth <= 0 || availableHeight <= 0) {
          // If not enough space, center the flower
          newX = plantvakStartX + (plantvakWidth - flowerSize) / 2
          newY = plantvakStartY + (plantvakHeight - flowerSize) / 2
        } else {
          // Distribute flowers nicely within the plantvak
          if (flowersOutside.length <= 4) {
            // Use grid for few flowers
            const cols = Math.ceil(Math.sqrt(flowersOutside.length))
            const rows = Math.ceil(flowersOutside.length / cols)
            const col = i % cols
            const row = Math.floor(i / cols)
            
            newX = plantvakStartX + margin + (col + 0.5) * (availableWidth / cols)
            newY = plantvakStartY + margin + (row + 0.5) * (availableHeight / rows)
          } else {
            // Use random positioning for many flowers
            newX = plantvakStartX + margin + Math.random() * availableWidth
            newY = plantvakStartY + margin + Math.random() * availableHeight
          }
        }
        
        try {
          await updatePlantPosition(flower.id, {
            position_x: newX,
            position_y: newY,
            visual_width: flower.visual_width,
            visual_height: flower.visual_height,
            notes: flower.notes
          })
          
          // Update local state
          setFlowerPositions(prev => prev.map(f => 
            f.id === flower.id 
              ? { ...f, position_x: newX, position_y: newY }
              : f
          ))
        } catch (error) {
          console.error("Error moving flower inside boundaries:", error)
        }
      }
      
      // Removed toast notification
    }
  }, [plantBed, flowerPositions, canvasWidth, canvasHeight])

  // DISABLED cleanup - it was forcing flowers into grid positions
  // useEffect(() => {
  //   if (!loading && plantBed && flowerPositions.length > 0) {
  //     const timer = setTimeout(async () => {
  //       console.log('🌸 RUNNING MANUAL CLEANUP for flowers outside plantvak')
  //       await cleanupFlowersOutsideBoundaries() // Fix flowers outside boundaries
  //     }, 1000) // Run once after load
  //     
  //     return () => clearTimeout(timer)
  //   }
  // }, [loading, plantBed, flowerPositions.length, cleanupFlowersOutsideBoundaries])

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, SCALE_MAX))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, SCALE_MIN))
  }

  const resetView = () => {
    setScale(1)
  }

  // TEMP: Reset all flowers to center to test movement
  const resetFlowerPositions = async () => {
    if (!plantBed) return
    
    const dimensions = plantBed.size ? parsePlantBedDimensions(plantBed.size) : null
    if (!dimensions) return
    
    const currentCanvasSize = getCanvasSize()
    const plantvakWidth = dimensions.lengthPixels
    const plantvakHeight = dimensions.widthPixels
    const plantvakStartX = (currentCanvasSize.width - plantvakWidth) / 2
    const plantvakStartY = (currentCanvasSize.height - plantvakHeight) / 2
    
    console.log('🌸 RESETTING FLOWERS TO CENTER')
    
    for (const flower of flowerPositions) {
      const centerX = plantvakStartX + plantvakWidth / 2 - (flower.visual_width || 45) / 2
      const centerY = plantvakStartY + plantvakHeight / 2 - (flower.visual_height || 45) / 2
      
      try {
        await updatePlantPosition(flower.id, {
          position_x: centerX,
          position_y: centerY,
          visual_width: flower.visual_width,
          visual_height: flower.visual_height,
          notes: flower.notes
        })
        
        // Update local state
        setFlowerPositions(prev => prev.map(f => 
          f.id === flower.id 
            ? { ...f, position_x: centerX, position_y: centerY }
            : f
        ))
      } catch (error) {
        console.error("Error resetting flower position:", error)
      }
    }
  }

  // Note: Manual save layout function removed - now using auto-save on drag end

  const addFlower = async () => {
    if (!plantBed || !newFlower.name) {
      return
    }

    // Validate form
    const newErrors: PlantFormErrors = {}
    if (!newFlower.name.trim()) newErrors.name = "Bloemnaam is verplicht"
    if (!newFlower.color.trim()) newErrors.color = "Kleur is verplicht"
    if (!newFlower.height.trim()) newErrors.height = "Hoogte is verplicht"
    
    if (Object.keys(newErrors).length > 0) {
      setNewFlowerErrors(newErrors)
      return
    }

    try {
      const flowerSize = FLOWER_SIZE_MEDIUM
      
      // Calculate proper initial position within plantvak boundaries
      const dimensions = plantBed.size ? parsePlantBedDimensions(plantBed.size) : null
      let initialX = 50
      let initialY = 50
      
      if (dimensions) {
        const currentCanvasSize = getCanvasSize()
        const plantvakWidth = dimensions.lengthPixels
        const plantvakHeight = dimensions.widthPixels
        const plantvakStartX = (currentCanvasSize.width - plantvakWidth) / 2
        const plantvakStartY = (currentCanvasSize.height - plantvakHeight) / 2
        
        const margin = 20
        const availableWidth = plantvakWidth - flowerSize - (margin * 2)
        const availableHeight = plantvakHeight - flowerSize - (margin * 2)
        
        if (availableWidth > 0 && availableHeight > 0) {
          initialX = plantvakStartX + margin + Math.random() * availableWidth
          initialY = plantvakStartY + margin + Math.random() * availableHeight
        } else {
          initialX = plantvakStartX + (plantvakWidth - flowerSize) / 2
          initialY = plantvakStartY + (plantvakHeight - flowerSize) / 2
        }
      }
      
      const newPlant = await createVisualPlant({
        plant_bed_id: plantBed.id,
        name: newFlower.name,
        color: newFlower.color,
        status: newFlower.status,
        position_x: initialX,
        position_y: initialY,
        visual_width: flowerSize,
        visual_height: flowerSize,
        emoji: newFlower.emoji,
        photo_url: null,
        is_custom: !newFlower.isStandardFlower,
        category: newFlower.isStandardFlower ? 'Standaard' : 'Aangepast',
        notes: newFlower.notes || ''
      })

      if (newPlant) {
        setFlowerPositions(prev => [...prev, newPlant])
        setIsAddingFlower(false)
        setIsCustomFlower(false)
        setNewFlower(createInitialPlantFormData())
        setNewFlowerErrors({})
        
        // Removed toast notification
      }
    } catch (error) {
      console.error("Error creating flower:", error)
        // Removed toast notification
    }
  }

  const updateFlower = async () => {
    if (!selectedFlower || !newFlower.name) {
      return
    }

    // Validate form
    const newErrors: PlantFormErrors = {}
    if (!newFlower.name.trim()) newErrors.name = "Bloemnaam is verplicht"
    if (!newFlower.color.trim()) newErrors.color = "Kleur is verplicht"
    if (!newFlower.height.trim()) newErrors.height = "Hoogte is verplicht"
    
    if (Object.keys(newErrors).length > 0) {
      setNewFlowerErrors(newErrors)
      return
    }

    try {
      const updatedPlant = await updatePlantPosition(selectedFlower.id, {
        name: newFlower.name,
        color: newFlower.color,
        status: newFlower.status,
        emoji: newFlower.emoji
      })

      if (updatedPlant) {
        setFlowerPositions(prev => prev.map(flower => 
          flower.id === selectedFlower.id ? updatedPlant : flower
        ))

        setIsEditingFlower(false)
        setSelectedFlower(null)
        setNewFlower(createInitialPlantFormData())
        
        // Removed toast notification
      }
    } catch (error) {
      console.error("Error updating flower:", error)
        // Removed toast notification
    }
  }

  const removeFlower = async (flowerId: string) => {
    try {
      await deletePlant(flowerId)
      setFlowerPositions(prev => prev.filter(f => f.id !== flowerId))
      setSelectedFlower(null)
      setIsEditingFlower(false)
        // Removed toast notification
    } catch (error) {
      console.error("Error deleting flower:", error)
        // Removed toast notification
    }
  }

  // Parse dimensions from size string
  const parseDimensions = (sizeString: string) => {
    const match = sizeString?.match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/)
    if (match) {
      return {
        length: match[1],
        width: match[2]
      }
    }
    return { length: '', width: '' }
  }

  // Initialize plant bed form when plant bed loads
  useEffect(() => {
    if (plantBed) {
      const dimensions = parseDimensions(plantBed.size || '')
      setPlantBedForm({
        name: plantBed.name,
        length: dimensions.length,
        width: dimensions.width,
        description: plantBed.description || '',
        sun_exposure: (plantBed.sun_exposure || 'full-sun') as 'full-sun' | 'partial-sun' | 'shade',
        soil_type: (plantBed.soil_type || 'loam') as 'clay' | 'sand' | 'loam' | 'peat'
      })
    }
  }, [plantBed])

  // Update plant bed
  const updatePlantBedInfo = async () => {
    if (!plantBed || !plantBedForm.name?.trim() || !plantBedForm.length || !plantBedForm.width) {
        // Removed toast notification
      return
    }

    // Prevent empty name
    if (plantBedForm.name.trim().length === 0) {
        // Removed toast notification
      return
    }

    try {
      const sizeString = `${plantBedForm.length}m x ${plantBedForm.width}m`
      const length = parseFloat(plantBedForm.length)
      const width = parseFloat(plantBedForm.width)
      
      if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
        // Removed toast notification
        return
      }
      
      const visualWidth = metersToPixels(length)
      const visualHeight = metersToPixels(width)

      const updatedBed = await updatePlantBed(plantBed.id, {
        name: plantBedForm.name.trim(),
        size: sizeString,
        description: plantBedForm.description?.trim() || undefined,
        sun_exposure: plantBedForm.sun_exposure,
        soil_type: plantBedForm.soil_type,
        visual_width: visualWidth,
        visual_height: visualHeight
      })

      if (updatedBed) {
        // Convert PlantBed to PlantBedWithPlants by adding plants array and ensuring required fields
        const bedWithPlants: PlantBedWithPlants = {
          ...updatedBed,
          position_x: updatedBed.position_x ?? plantBed?.position_x ?? 100,
          position_y: updatedBed.position_y ?? plantBed?.position_y ?? 100,
          visual_width: updatedBed.visual_width ?? visualWidth,
          visual_height: updatedBed.visual_height ?? visualHeight,
          rotation: updatedBed.rotation ?? plantBed?.rotation ?? 0,
          z_index: updatedBed.z_index ?? plantBed?.z_index ?? 0,
          color_code: updatedBed.color_code ?? plantBed?.color_code ?? '',
          visual_updated_at: updatedBed.visual_updated_at ?? new Date().toISOString(),
          plants: flowerPositions // Use current flower positions as plants
        }
        setPlantBed(bedWithPlants)
        setIsEditingPlantBed(false)
        // Removed toast notification
      } else {
        // Removed toast notification
      }
    } catch (error) {
      console.error("Error updating plant bed:", error)
        // Removed toast notification
    }
  }

  // Delete plant bed
  const handleDeletePlantBed = async () => {
    if (!plantBed) return

    try {
      await deletePlantBed(plantBed.id)
      
        // Removed toast notification
      
      // Navigate back to garden
      router.push(`/gardens/${params.id}`)
    } catch (error) {
      console.error("Error deleting plant bed:", error)
        // Removed toast notification
    } finally {
      setShowDeletePlantBedDialog(false)
    }
  }

  // Unified pointer event handling for both mouse and touch
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
    } else if ('clientX' in e) {
      return { clientX: e.clientX, clientY: e.clientY }
    }
    return { clientX: 0, clientY: 0 }
  }

  // Handle single click/tap - select flower and enable drag mode
  const handleFlowerClick = useCallback((e: React.MouseEvent | React.TouchEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    // FIXED: Always enable drag mode on single click for both touch and mouse
    if (selectedFlower?.id === flowerId && isDragMode) {
      // If already selected and in drag mode, do nothing (let drag work)
      return
    } else {
      // Select flower and enable drag mode
      setSelectedFlower(flower)
      setIsDragMode(true) // FIXED: Always enable drag mode
    }
    
    // Make sure resize interface is hidden
    setShowResizeInterface(false)
    setIsResizeMode(false)
  }, [flowerPositions, selectedFlower, isDragMode])

  // Handle double click - navigate to plant details page
  const handleFlowerDoubleClick = useCallback((flower: PlantWithPosition) => {
    console.log('Double click on flower:', flower.name, '- navigating to details')
    
    // Navigate to plant details page
    router.push(`/plants/${flower.id}`)
    }, [router])

  // Handle flower resize via interface - supports flower fields
  const handleFlowerResize = useCallback(async (flowerId: string, sizeChange: number) => {
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    const currentSize = Math.min(flower.visual_width, flower.visual_height)
    const maxSize = Math.min(canvasWidth * 0.9, canvasHeight * 0.9) // Can grow to almost fill the entire plantvak
    const newSize = Math.max(FLOWER_SIZE_SMALL, Math.min(maxSize, currentSize + sizeChange))
    
    const updatedFlower = {
      ...flower,
      visual_width: newSize,
      visual_height: newSize
    }

    try {
      await updatePlantPosition(flowerId, {
        position_x: flower.position_x,
        position_y: flower.position_y,
        visual_width: newSize,
        visual_height: newSize,
        notes: flower.notes
      })

      setFlowerPositions(prev => prev.map(f => 
        f.id === flowerId ? updatedFlower : f
      ))
      setSelectedFlower(updatedFlower)
      setHasChanges(true)

      // Special message for large flower fields
      const isLargeField = newSize > 100
        // Removed toast notification
    } catch (error) {
      console.error('Failed to resize flower:', error)
        // Removed toast notification
    }
  }, [flowerPositions, canvasWidth, canvasHeight])

  // Close resize interface
  const closeResizeInterface = useCallback(() => {
    setShowResizeInterface(false)
    setSelectedFlower(null)
  }, [])

  // Handle pointer down - start dragging immediately for mouse, conditionally for touch (like plant bed)
  const handleFlowerPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const { clientX, clientY } = getPointerPosition(e)
    
    // Record touch start time for long press detection
    if ('touches' in e) {
      setTouchStartTime(Date.now())
      // For touch, only start dragging if we're in drag mode
      if (!isDragMode || selectedFlower?.id !== flowerId) {
        return
      }
    }

    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // FIXED: Calculate drag offset from flower center (v2.0 - Force cache refresh)
    const mouseX = (clientX - rect.left) / scale
    const mouseY = (clientY - rect.top) / scale
    
    const flowerCenterX = flower.position_x + (flower.visual_width / 2)
    const flowerCenterY = flower.position_y + (flower.visual_height / 2)
    const offsetX = mouseX - flowerCenterX
    const offsetY = mouseY - flowerCenterY

    // Drag offset calculation (logging removed for cleaner console)

    setDraggedFlower(flowerId)
    setDragOffset({ x: offsetX, y: offsetY })
    setSelectedFlower(flower)
    setHasChanges(true)

    // Removed feedback toast - no more notifications when moving
  }, [flowerPositions, scale, isDragMode, selectedFlower])

  // Handle touch start for mobile - prepare for drag after click
  const handleFlowerTouchStart = useCallback((e: React.TouchEvent, flowerId: string) => {
    setTouchStartTime(Date.now())
    
    // Clear any existing long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
    
    // Set a timer for long press detection (backup method)
    const timer = setTimeout(() => {
      const flower = flowerPositions.find(f => f.id === flowerId)
      if (!flower) return
      
      // Long press as backup - but single tap is primary method now
      if (!isDragMode) {
        setSelectedFlower(flower)
        setIsDragMode(true)
        setIsResizeMode(false)
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        // Removed toast notification
      }
    }, 500) // 500ms for long press

    setLongPressTimer(timer)
  }, [flowerPositions, longPressTimer, isDragMode])

  const handleFlowerTouchEnd = useCallback((e: React.TouchEvent, flowerId: string) => {
    const touchDuration = Date.now() - touchStartTime
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    
    // If it was a quick tap (not long press), handle as click
    if (touchDuration < 500) {
      handleFlowerClick(e, flowerId)
    }
  }, [touchStartTime, longPressTimer, handleFlowerClick])

  // Enhanced touch move handler for mobile dragging
  const handleFlowerTouchMove = useCallback((e: React.TouchEvent, flowerId: string) => {
    // Only handle if this flower is selected and in drag mode
    if (selectedFlower?.id === flowerId && isDragMode && !draggedFlower) {
      const { clientX, clientY } = getPointerPosition(e)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      // FIXED: Correct drag offset calculation - offset should be mouse relative to flower center
      const mouseX = (clientX - rect.left) / scale
      const mouseY = (clientY - rect.top) / scale
      
      // FIXED: Calculate offset relative to flower center, not top-left corner
      const flowerCenterX = selectedFlower.position_x + (selectedFlower.visual_width / 2)
      const flowerCenterY = selectedFlower.position_y + (selectedFlower.visual_height / 2)
      const offsetX = mouseX - flowerCenterX
      const offsetY = mouseY - flowerCenterY

      // Touch drag offset calculation (logging removed for cleaner console)
      
      setDraggedFlower(flowerId)
      setDragOffset({ x: offsetX, y: offsetY })
    }
  }, [selectedFlower, isDragMode, draggedFlower, scale, containerRef])



  // Handle drag move - FIXED: Dynamic boundary calculation to prevent cached size issues
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!draggedFlower || !containerRef.current || !plantBed) return

    const rect = containerRef.current.getBoundingClientRect()
    
    // FIXED: Simplified position calculation
    const mouseX = (clientX - rect.left) / scale
    const mouseY = (clientY - rect.top) / scale
    
    // FIXED: Calculate new position accounting for center-based drag offset
    const newX = mouseX - dragOffset.x
    const newY = mouseY - dragOffset.y
    
    // Position calculation (logging removed for cleaner console)

    // Use functional update to avoid dependency issues
    setFlowerPositions(prev => {
      // Find the dragged flower to get its dimensions
      const draggedFlowerData = prev.find(f => f.id === draggedFlower)
      if (!draggedFlowerData) return prev

      // CRITICAL FIX: Calculate flowerIndex ONCE at the beginning to prevent array state inconsistencies
      const flowerIndex = prev.findIndex(f => f.id === draggedFlower)

      // FIXED: Calculate canvas size dynamically to avoid cached size issues
      const currentCanvasSize = getCanvasSize()
      const currentCanvasWidth = currentCanvasSize.width
      const currentCanvasHeight = currentCanvasSize.height
      


      // SIMPLE: Just keep flowers within canvas bounds (like garden view)
      const margin = 10
      const constrainedX = Math.max(margin, Math.min(newX, currentCanvasWidth - draggedFlowerData.visual_width - margin))
      const constrainedY = Math.max(margin, Math.min(newY, currentCanvasHeight - draggedFlowerData.visual_height - margin))
      // Force redeploy - all flowers should move freely now
      


      



      // Only update the specific dragged flower
      return prev.map(f => {
        if (f.id === draggedFlower) {
          return { ...f, position_x: constrainedX, position_y: constrainedY }
        }
        return f // Keep other flowers unchanged with same object reference
      })
    })
    
    setHasChanges(true)
  }, [draggedFlower, dragOffset, scale, plantBed])

  // Mouse move handler
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY)
  }, [handlePointerMove])

  // Legacy function for compatibility
  const onMouseMoveOld = useCallback((e: React.MouseEvent) => {
    if (!draggedFlower || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newX = (e.clientX - rect.left) / scale - dragOffset.x
    const newY = (e.clientY - rect.top) / scale - dragOffset.y

    // Use functional update to avoid dependency issues
    setFlowerPositions(prev => {
      // Find the dragged flower to get its dimensions
      const draggedFlowerData = prev.find(f => f.id === draggedFlower)
      if (!draggedFlowerData) return prev

      // Constrain to canvas bounds using the flower's actual size
      const constrainedX = Math.max(0, Math.min(newX, canvasWidth - draggedFlowerData.visual_width))
      const constrainedY = Math.max(0, Math.min(newY, canvasHeight - draggedFlowerData.visual_height))

      // Only update the specific dragged flower
      return prev.map(f => {
        if (f.id === draggedFlower) {
          return { ...f, position_x: constrainedX, position_y: constrainedY }
        }
        return f // Keep other flowers unchanged with same object reference
      })
    })
    
    setHasChanges(true)
  }, [draggedFlower, dragOffset, scale, canvasWidth, canvasHeight])

  // Handle mouse up (end drag) with auto-save (like plant bed behavior)
  const handlePointerUp = useCallback(async () => {
    if (!draggedFlower) return
    
    // Auto-save when dragging stops
    if (draggedFlower && hasChanges) {
      const flowerToUpdate = flowerPositions.find(f => f.id === draggedFlower)
      if (flowerToUpdate) {
        // Auto-save the position immediately
        try {
          await updatePlantPosition(draggedFlower, {
            position_x: flowerToUpdate.position_x,
            position_y: flowerToUpdate.position_y,
            visual_width: flowerToUpdate.visual_width,
            visual_height: flowerToUpdate.visual_height,
            notes: flowerToUpdate.notes
          })
          
          setHasChanges(false)
          
          // Removed feedback toast - no more notifications when moving
        } catch (error) {
          console.error("Error auto-saving flower position:", error)
        // Removed toast notification
        }
      }
    }
    
    setDraggedFlower(null)
    setDragOffset({ x: 0, y: 0 })
  }, [draggedFlower, hasChanges, flowerPositions])

  // Legacy mouse up handler
  const onMouseUp = useCallback(() => {
    handlePointerUp()
  }, [handlePointerUp])



  // Save all flower positions to database
  const handleSavePositions = useCallback(async () => {
    if (!hasChanges) {
        // Removed toast notification
      return
    }

    try {
      // Save all flower positions that have been moved
      const savePromises = flowerPositions.map(async (flower) => {
        return await updatePlantPosition(flower.id, {
          position_x: flower.position_x,
          position_y: flower.position_y,
          visual_width: flower.visual_width,
          visual_height: flower.visual_height,
          notes: flower.notes
        })
      })

      await Promise.all(savePromises)
      
      setHasChanges(false)
      setSelectedFlower(null)
      
        // Removed toast notification
    } catch (error) {
      console.error("Error saving flower positions:", error)
        // Removed toast notification
    }
  }, [hasChanges, flowerPositions])

  // Handle click outside to deselect - unified for mouse and touch
  const handleCanvasClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedFlower(null)
      setIsDragMode(false)
      setIsResizeMode(false)
      setIsResizing(null)
      resizeModeRef.current = null
      
      // Removed feedback toast - no more notifications when deselecting
    }
  }, [])

  // Add global event listeners for drag - support both mouse and touch
  useEffect(() => {
    if (draggedFlower) {
      const handleMouseMoveGlobal = (e: MouseEvent) => {
        handlePointerMove(e.clientX, e.clientY)
      }
      
      const handleTouchMoveGlobal = (e: TouchEvent) => {
        e.preventDefault() // Prevent scrolling while dragging
        if (e.touches.length > 0) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
        }
      }
      
      document.addEventListener('mousemove', handleMouseMoveGlobal)
      document.addEventListener('mouseup', handlePointerUp)
      document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false })
      document.addEventListener('touchend', handlePointerUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal)
        document.removeEventListener('mouseup', handlePointerUp)
        document.removeEventListener('touchmove', handleTouchMoveGlobal)
        document.removeEventListener('touchend', handlePointerUp)
      }
    }
  }, [draggedFlower, handlePointerMove, handlePointerUp])

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, flowerId: string, mode: 'uniform' | 'width' | 'height' = 'uniform') => {
    e.preventDefault()
    e.stopPropagation()
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    // Clear any existing resize state first
    setIsResizing(null)
    setDraggedFlower(null) // Ensure no drag conflicts
    
    // Get current area size or set default
    const currentAreaSize = flower.notes?.includes('area_size:') 
      ? parseInt(flower.notes.split('area_size:')[1]) || FLOWER_SIZE * 3
      : FLOWER_SIZE * 3

    // Set resize state
    setIsResizing(flowerId)
    setResizeMode(mode)
    setResizeStartSize({ 
      width: currentAreaSize,  // Use area size, not flower size
      height: currentAreaSize 
    })
    setResizeStartPos({ x: e.clientX, y: e.clientY })
    setDuplicatePositions([]) // Reset duplicate positions
    
        // Removed toast notification
  }, [flowerPositions])

  // Handle resize move - Update flower size directly (no new flowers)
  const handleResizeMove = useCallback(async (e: MouseEvent) => {
    if (!isResizing || !plantBed) return

    const flower = flowerPositions.find(f => f.id === isResizing)
    if (!flower) return

    const deltaX = e.clientX - resizeStartPos.x
    const deltaY = e.clientY - resizeStartPos.y
    
    // Calculate new flower size based on drag distance
    const delta = Math.max(deltaX, deltaY)
    let newSize = Math.max(FLOWER_SIZE_SMALL, resizeStartSize.width + delta)
    
    // Constrain to reasonable bounds
    const maxSize = Math.min(200, Math.min(canvasWidth - flower.position_x, canvasHeight - flower.position_y))
    newSize = Math.min(newSize, maxSize)

    // Update the flower size directly in the state
    setFlowerPositions(prev => prev.map(f => {
      if (f.id === isResizing) {
        return { 
          ...f, 
          visual_width: newSize,
          visual_height: newSize
        }
      }
      return f
    }))
  }, [isResizing, resizeStartSize, resizeStartPos, canvasWidth, canvasHeight, flowerPositions, plantBed])

  // Handle resize end - save the updated flower size to database
  const handleResizeEnd = useCallback(async () => {
    if (!isResizing) return

    const currentResizingId = isResizing
    setIsResizing(null)
    setResizeStartSize({ width: 0, height: 0 })
    setResizeStartPos({ x: 0, y: 0 })
    setResizeMode('uniform')

    try {
      // Save the resized flower to database
      const currentFlower = flowerPositions.find(f => f.id === currentResizingId)
      if (currentFlower) {
        await updatePlantPosition(currentFlower.id, {
          visual_width: currentFlower.visual_width,
          visual_height: currentFlower.visual_height
        })

        // Removed toast notification
      }
    } catch (error) {
      console.error("Error saving flower size:", error)
        // Removed toast notification
    }
  }, [isResizing, flowerPositions])

  useEffect(() => {
    const cleanup = () => {
      // Remove all event listeners to prevent sticky behavior
      document.removeEventListener('mousemove', handleResizeMove as any)
      document.removeEventListener('mouseup', handleResizeEnd as any)
    }

    if (draggedFlower) {
      const handleMouseMoveGlobal = (e: MouseEvent) => {
        const mockReactEvent = {
          clientX: e.clientX,
          clientY: e.clientY
        } as React.MouseEvent
        onMouseMove(mockReactEvent)
      }
      
      // Clean up any resize listeners first
      cleanup()
      
      document.addEventListener('mousemove', handleMouseMoveGlobal)
      document.addEventListener('mouseup', onMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal)
        document.removeEventListener('mouseup', onMouseUp)
      }
    }
    
    if (isResizing) {
      // Clean up any drag listeners first
      cleanup()
      
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
              return () => {
          document.removeEventListener('mousemove', handleResizeMove)
          document.removeEventListener('mouseup', handleResizeEnd)
        }
    }

    // Cleanup on unmount or when neither drag nor resize is active
    return cleanup
  }, [draggedFlower, isResizing, onMouseMove, onMouseUp, handleResizeMove, handleResizeEnd])

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
      case 'gezond':
        return 'border-green-500 shadow-green-200'
      case 'aandacht_nodig':
        return 'border-yellow-500 shadow-yellow-200'
      case 'bloeiend':
        return 'border-purple-500 shadow-purple-200'
      case 'ziek':
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
          <Button onClick={goBack} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
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
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flower className="h-8 w-8 text-pink-600" />
              {plantBed.name}
            </h1>

          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingFlower} onOpenChange={(open) => {
            setIsAddingFlower(open)
            if (!open) {
              // Reset form when dialog closes
              setNewFlower(createInitialPlantFormData())
              setIsCustomFlower(false)
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => {
                // Reset form when opening dialog
                setNewFlower(createInitialPlantFormData())
                setIsCustomFlower(false)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Bloem Toevoegen
              </Button>
                          </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
              <DialogHeader>
                <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuwe bloem toe aan dit plantvak. Je kunt het later verplaatsen door te slepen.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <PlantForm
                  data={newFlower}
                  errors={newFlowerErrors}
                  onChange={setNewFlower}
                  onSubmit={(e) => {
                    e.preventDefault()
                    addFlower()
                  }}
                  onReset={() => {
                    setNewFlower(createInitialPlantFormData())
                    setNewFlowerErrors({})
                  }}
                  submitLabel="Bloem toevoegen"
                  isSubmitting={false}
                  showAdvanced={true}
                />
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddingFlower(false)
                    setNewFlower(createInitialPlantFormData())
                    setNewFlowerErrors({})
                    setIsCustomFlower(false)
                  }}>
                    Annuleren
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Flower Dialog */}
          <Dialog open={isEditingFlower} onOpenChange={(open) => {
            setIsEditingFlower(open)
            if (!open) {
              setNewFlower(createInitialPlantFormData())
              setNewFlowerErrors({})
              setSelectedFlower(null)
            }
          }}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white z-50 border border-gray-200 shadow-xl">
              <DialogHeader>
                <DialogTitle>Bloem Bewerken</DialogTitle>
                <DialogDescription>
                  Wijzig de eigenschappen van deze bloem.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <PlantForm
                  data={newFlower}
                  errors={newFlowerErrors}
                  onChange={setNewFlower}
                  onSubmit={(e) => {
                    e.preventDefault()
                    updateFlower()
                  }}
                  onReset={() => {
                    setNewFlower(createInitialPlantFormData())
                    setNewFlowerErrors({})
                  }}
                  submitLabel="Bloem wijzigen"
                  isSubmitting={false}
                  showAdvanced={true}
                />
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => selectedFlower && removeFlower(selectedFlower.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Verwijderen
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditingFlower(false)
                    setNewFlower(createInitialPlantFormData())
                    setNewFlowerErrors({})
                    setSelectedFlower(null)
                  }}>
                    Annuleren
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Zoom controls - only show in visual mode */}
          {viewMode === 'visual' && (
            <>
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === 'visual' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => updateViewMode('visual')}
              className="rounded-r-none border-r-0"
            >
              <Eye className="h-4 w-4 mr-1" />
              Visueel
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => updateViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4 mr-1" />
              Lijst
            </Button>
          </div>

        </div>
      </div>

      {/* Plant Bed Information - Simplified */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Plantvak Informatie</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingPlantBed(true)}
              className="flex items-center gap-1 text-xs"
            >
              <Edit className="h-3 w-3" />
              Bewerken
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Naam:</span>
              <p className="font-medium">{plantBed?.name || 'Onbekend'}</p>
            </div>
            <div>
              <span className="text-gray-600">Afmetingen:</span>
              <p className="font-medium">
                {plantBed?.size || `${(canvasWidth / METERS_TO_PIXELS).toFixed(1)}m × ${(canvasHeight / METERS_TO_PIXELS).toFixed(1)}m`}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Bloemen:</span>
              <p className="font-medium">{flowerPositions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Plant Bed Dialog */}
      <Dialog open={isEditingPlantBed} onOpenChange={setIsEditingPlantBed}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plantvak Bewerken</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Naam *</label>
              <Input
                value={plantBedForm.name}
                onChange={(e) => {
                  const newValue = e.target.value
                  // Prevent clearing the name completely
                  if (newValue.trim().length === 0 && plantBedForm.name.trim().length > 0) {
        // Removed toast notification
                    return
                  }
                  setPlantBedForm(prev => ({ ...prev, name: newValue }))
                }}
                placeholder="Bijv. Rozen bed"
                onBlur={(e) => {
                  // Restore original name if field is empty on blur
                  if (e.target.value.trim().length === 0 && plantBed?.name) {
                    setPlantBedForm(prev => ({ ...prev, name: plantBed.name }))
        // Removed toast notification
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Lengte (m) *</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={plantBedForm.length}
                  onChange={(e) => setPlantBedForm(prev => ({ ...prev, length: e.target.value }))}
                  placeholder="2.0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Breedte (m) *</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={plantBedForm.width}
                  onChange={(e) => setPlantBedForm(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="1.5"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Zonligging</label>
              <Select value={plantBedForm.sun_exposure} onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') => 
                setPlantBedForm(prev => ({ ...prev, sun_exposure: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-sun">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>Volle zon</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="partial-sun">
                    <div className="flex items-center gap-2">
                      <CloudSun className="h-4 w-4 text-yellow-400" />
                      <span>Gedeeltelijke zon</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="shade">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-gray-500" />
                      <span>Schaduw</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Grondsoort</label>
              <Select value={plantBedForm.soil_type} onValueChange={(value: 'clay' | 'sand' | 'loam' | 'peat') => 
                setPlantBedForm(prev => ({ ...prev, soil_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Klei</SelectItem>
                  <SelectItem value="sand">Zand</SelectItem>
                  <SelectItem value="loam">Leem</SelectItem>
                  <SelectItem value="peat">Veen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Beschrijving</label>
              <Input
                value={plantBedForm.description}
                onChange={(e) => setPlantBedForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optionele beschrijving..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={updatePlantBedInfo} className="flex-1">
                Opslaan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeletePlantBedDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Verwijderen
              </Button>
              <Button variant="outline" onClick={() => setIsEditingPlantBed(false)}>
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Plant Bed Confirmation Dialog */}
      <Dialog open={showDeletePlantBedDialog} onOpenChange={setShowDeletePlantBedDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription>
              Weet je zeker dat je dit plantvak wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              Alle bloemen in dit plantvak worden ook verwijderd.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-800">Te verwijderen:</span>
              </div>
              <p className="text-sm text-red-700">
                <strong>{plantBed?.name}</strong> ({plantBed?.size || 'Onbekende grootte'})
              </p>
              <p className="text-sm text-red-700">
                {flowerPositions.length} bloemen worden ook verwijderd
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleDeletePlantBed}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Ja, Verwijderen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeletePlantBedDialog(false)}
                className="flex-1"
              >
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canvas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Plantvak {plantBed?.name || ''}
            </CardTitle>
            
            {/* Control buttons for selected flower */}
            {selectedFlower && (
              <div className="flex items-center gap-2">

                
                <Button
                  variant={isResizeMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsResizeMode(!isResizeMode)
                    setIsDragMode(false)
                    if (!isResizeMode) {
        // Removed toast notification
                    } else {
        // Removed toast notification
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <Maximize2 className="h-3 w-3" />
                  {isResizeMode ? "Stop" : "Resize"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedFlower) {
                      // Populate form with selected flower data
                      setNewFlower({
                        name: selectedFlower.name,
                        color: selectedFlower.color || '',
                        height: selectedFlower.height?.toString() || '',
                        emoji: selectedFlower.emoji || DEFAULT_FLOWER_EMOJI,
                        status: selectedFlower.status || 'gezond',
                        notes: selectedFlower.notes || '',
                        isStandardFlower: !selectedFlower.is_custom,
                        // Populate optional fields
                        scientificName: selectedFlower.latin_name || '',
                        variety: '',
                        plantsPerSqm: selectedFlower.plants_per_sqm?.toString() || '',
                        sunPreference: selectedFlower.sun_preference || 'full-sun',
                        plantingDate: '',
                        expectedHarvestDate: '',
                        careInstructions: '',
                        wateringFrequency: '',
                        fertilizerSchedule: ''
                      })
                      setIsEditingFlower(true)
        // Removed toast notification
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Bewerken
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFlower(null)
                    setIsDragMode(false)
                    setIsResizeMode(false)
        // Removed toast notification
                  }}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Deselecteer
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'visual' ? (
            <>
              {/* Mobile help text */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg md:hidden">
                <h4 className="font-medium text-blue-900 mb-1">📱 Mobiele bediening:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>1x tikken:</strong> Bloem selecteren</li>
                  <li>• <strong>2x tikken:</strong> Verplaatsen activeren</li>
                  <li>• <strong>3x tikken:</strong> Grootte aanpassen</li>
                  <li>• <strong>Lang indrukken:</strong> Direct verplaatsen</li>
                  <li>• <strong>Dubbel tikken:</strong> Grootte aanpassen (+ / -)</li>
                  <li>• <strong>Knoppen:</strong> Gebruik knoppen hierboven</li>
                </ul>
                <div className="mt-2 pt-2 border-t border-blue-300">
                  <p className="text-xs text-blue-700">
                    🌱 <strong>Plantvak:</strong> {plantBed?.size || 'Onbekend'}
                  </p>
                </div>
              </div>
              
              {/* Visual Canvas View */}
              <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-green-200">
            <div
              ref={containerRef}
              className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"
              style={{
                width: getCanvasSize().width,
                height: getCanvasSize().height,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                maxWidth: "100%",
              }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onClick={handleCanvasClick}
              onTouchMove={(e) => {
                if (e.touches.length > 0) {
                  handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
                }
              }}
              onTouchEnd={handlePointerUp}
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

              {/* Plantvak boundary visualization */}
              {(() => {
                const dimensions = plantBed?.size ? parsePlantBedDimensions(plantBed.size) : null
                if (!dimensions) return null
                
                // FIXED: Use dynamic canvas size to match movement boundaries
                const currentCanvasSize = getCanvasSize()
                const plantvakWidth = dimensions.lengthPixels
                const plantvakHeight = dimensions.widthPixels
                const plantvakStartX = (currentCanvasSize.width - plantvakWidth) / 2
                const plantvakStartY = (currentCanvasSize.height - plantvakHeight) / 2
                
                return (
                  <div
                    className="absolute border-2 border-dashed border-green-400 bg-green-50/20 rounded-lg pointer-events-none"
                    style={{
                      left: plantvakStartX,
                      top: plantvakStartY,
                      width: plantvakWidth,
                      height: plantvakHeight,
                    }}
                  >
                    {/* Plantvak name and info - always within the plantvak area */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border">
                      <div className="text-sm font-bold text-green-800">
                        {plantBed.name}
                      </div>
                      <div className="text-xs text-green-600">
                        {plantBed.size} • {flowerPositions.length} bloemen
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Interactive flowers with simple movement (like garden view) */}
              {flowerPositions.map((flower) => {
                const isSelected = selectedFlower?.id === flower.id
                const isDragging = draggedFlower === flower.id
                const isBeingResized = isResizing === flower.id

                return (
                  <div
                    key={flower.id}
                    className={`absolute rounded-lg border-4 ${getStatusColor(flower.status || 'gezond')} ${
                      isDragging ? "shadow-2xl ring-4 ring-pink-500 z-10 scale-105 cursor-grabbing" : 
                      isSelected && isDragMode ? "ring-4 ring-green-500 shadow-xl cursor-grab animate-pulse" :
                      isSelected && isResizeMode ? "ring-4 ring-blue-500 shadow-xl cursor-default" :
                      isSelected ? "ring-4 ring-blue-500 shadow-xl cursor-pointer" :
                      "shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                    } transition-all duration-200 flex items-center justify-center text-white relative overflow-hidden bg-opacity-0 border-opacity-50`}
                    style={{
                      left: flower.position_x,
                      top: flower.position_y,
                      width: flower.visual_width,
                      height: flower.visual_height,
                      backgroundColor: flower.color ? `${flower.color}20` : 'transparent',
                      borderColor: flower.color || '#999',
                    }}
                    onClick={(e) => handleFlowerClick(e, flower.id)}
                    onDoubleClick={() => handleFlowerDoubleClick(flower)}
                    onMouseDown={(e) => handleFlowerPointerDown(e, flower.id)}
                    onTouchStart={(e) => handleFlowerTouchStart(e, flower.id)}
                    onTouchMove={(e) => handleFlowerTouchMove(e, flower.id)}
                    onTouchEnd={(e) => handleFlowerTouchEnd(e, flower.id)}
                    title={
                      isDragging ? "Sleep naar gewenste positie en laat los om op te slaan" :
                      isSelected && isDragMode ? "Sleep me naar een nieuwe positie!" :
                      isSelected && isResizeMode ? "Sleep de blauwe hoeken om groter te maken" :
                      isSelected ? "Sleep om te verplaatsen, dubbel klik om te vergroten" :
                      "Klik om te selecteren, sleep om te verplaatsen, dubbel klik om te vergroten"
                    }
                  >
                    <div className="text-center w-full h-full flex flex-col items-center justify-center">
                      <div 
                        className="flex items-center justify-center"
                        style={{ 
                          fontSize: Math.max(12, Math.min(48, flower.visual_width * 0.4)) + 'px'
                        }}
                      >
                        {flower.photo_url ? (
                          <img 
                            src={flower.photo_url} 
                            alt={flower.name} 
                            className="w-full h-full object-cover rounded-full"
                            style={{ 
                              width: flower.visual_width + 'px',
                              height: flower.visual_height + 'px'
                            }}
                          />
                        ) : flower.emoji ? (
                          flower.emoji
                        ) : (
                          <div className="text-center text-white font-bold leading-tight" style={{ 
                            fontSize: Math.max(8, Math.min(16, flower.visual_width * 0.2)) + 'px',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}>
                            {flower.name}
                          </div>
                        )}
                      </div>
                      
                      {/* Toon naam als er genoeg ruimte is */}
                      {flower.visual_width > 60 && (
                        <div 
                          className="text-center text-white font-bold mt-1 px-1 leading-tight"
                          style={{ 
                            fontSize: Math.max(8, Math.min(16, flower.visual_width * 0.15)) + 'px',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          {flower.name}
                        </div>
                      )}
                      
                      {/* Kleine naam label voor kleine bloemen */}
                      {flower.visual_width <= 60 && (
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm whitespace-nowrap">
                          {flower.name}
                        </div>
                      )}
                    </div>

                    {/* Mode indicators */}
                    {isSelected && isDragMode && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-bounce font-bold z-20">
                        🖱️ Sleep me!
                      </div>
                    )}
                    
                    {isSelected && isResizeMode && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-bounce font-bold z-20">
                        📏 Resize actief!
                      </div>
                    )}

                    {/* RESIZE HANDLE - alleen als geselecteerd en in resize mode */}
                    {isSelected && isResizeMode && (
                      <>
                        {/* Invisible area visualization */}
                        {(() => {
                          const areaSize = flower.notes?.includes('area_size:') 
                            ? parseInt(flower.notes.split('area_size:')[1]) || FLOWER_SIZE * 3
                            : FLOWER_SIZE * 3
                          
                          return (
                            <div
                              className="absolute border-2 border-dashed border-blue-300 bg-blue-50 bg-opacity-20 rounded-lg pointer-events-none"
                              style={{
                                left: -areaSize/2 + FLOWER_SIZE/2,
                                top: -areaSize/2 + FLOWER_SIZE/2,
                                width: areaSize,
                                height: areaSize,
                                zIndex: -1
                              }}
                            />
                          )
                        })()}
                        
                        <div className="absolute -top-16 -right-2 bg-purple-500 text-white text-sm px-3 py-1 rounded z-10 animate-bounce font-bold">
                          🖱️💻📱 UNIVERSEEL SYSTEEM
                        </div>
                        <div className="absolute -top-10 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded z-10 font-bold">
                          Muis • Trackpad • Mobiel
                        </div>
                        
                                                                        {/* 🚨 POGING 2/2 - LAATSTE KANS PERFECTE DRAG! */}
                        {/* NAAM VAN DE BLOEM - ALTIJD ZICHTBAAR */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded shadow-lg border z-40">
                          {flower.name}
                        </div>
                        
                        {/* DRAG HANDLE VOOR MEER BLOEMEN */}
                        <div 
                          className="absolute -bottom-8 -right-8 w-20 h-20 bg-yellow-400 border-4 border-black rounded-full cursor-se-resize hover:bg-yellow-300 flex items-center justify-center z-50 shadow-2xl animate-bounce"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            
                            console.log("🎯 LAATSTE KANS DRAG START!")
                            alert("DRAG GESTART! Sleep nu!")
                            
                            const startX = e.clientX
                            const startY = e.clientY
                            const startSize = flower.visual_width || 40
                            
                                                         const handleMouseMove = async (moveEvent: MouseEvent) => {
                               const deltaX = moveEvent.clientX - startX
                               const deltaY = moveEvent.clientY - startY
                               const delta = Math.max(deltaX, deltaY)
                               const newAreaSize = Math.max(100, startSize + delta)
                               
                               console.log("🎯 DRAGGING AREA SIZE:", newAreaSize)
                               
                               // Update area size in notes
                               setFlowerPositions(prev => prev.map(f => {
                                 if (f.id === flower.id) {
                                   return { 
                                     ...f, 
                                     notes: `area_size:${newAreaSize}`
                                   }
                                 }
                                 return f
                               }))
                               
                               // Calculate how many flowers should be in this area
                               const areaRatio = (newAreaSize * newAreaSize) / (FLOWER_SIZE * FLOWER_SIZE)
                               const targetFlowers = Math.floor(areaRatio * 0.3) // 0.3 density
                               const maxFlowers = 20
                               const actualTargetFlowers = Math.min(targetFlowers, maxFlowers)
                               
                               // Count current extra flowers
                               const currentExtraFlowers = flowerPositions.filter(f => 
                                 f.id !== flower.id && 
                                 f.name === flower.name &&
                                 Math.abs(f.position_x - flower.position_x) < newAreaSize &&
                                 Math.abs(f.position_y - flower.position_y) < newAreaSize
                               ).length
                               
                               // Add flowers if needed
                               if (actualTargetFlowers > currentExtraFlowers) {
                                 const flowersToAdd = Math.min(2, actualTargetFlowers - currentExtraFlowers)
                                 
                                 for (let i = 0; i < flowersToAdd; i++) {
                                   const angle = Math.random() * 2 * Math.PI
                                   const radius = Math.random() * (newAreaSize / 3)
                                   const x = flower.position_x + Math.cos(angle) * radius
                                   const y = flower.position_y + Math.sin(angle) * radius
                                   
                                   try {
                                     const newFlower = await createVisualPlant({
                                       plant_bed_id: plantBed?.id || '',
                                       name: flower.name,
                                       color: flower.color || '#FF69B4',
                                       status: 'gezond',
                                       position_x: Math.max(10, Math.min(x, canvasWidth - 50)),
                                       position_y: Math.max(10, Math.min(y, canvasHeight - 50)),
                                       visual_width: FLOWER_SIZE,
                                       visual_height: FLOWER_SIZE,
                                       emoji: flower.emoji,
                                       is_custom: false,
                                       category: flower.category,
                                       notes: `sub_flower_of:${flower.id}`
                                     })
                                     
                                     if (newFlower) {
                                       setFlowerPositions(prev => [...prev, newFlower])
                                     }
                                   } catch (error) {
                                     console.error("Error adding flower:", error)
                                   }
                                 }
                               }
                             }
                            
                            const handleMouseUp = () => {
                              console.log("🎯 DRAG STOP!")
                              alert("DRAG GESTOPT!")
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            // GLOBAL listeners
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                          title="SLEEP DEZE GELE HOEK OM PRECIES TE SIZEN!"
                        >
                          <div className="text-black text-2xl font-black">⤡</div>
                        </div>
                          
                        
                        {/* Show live area info during resize */}
                        {isBeingResized && (
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-3 py-2 rounded-full z-10 animate-bounce shadow-lg">
                            🌸 Gebied: {(() => {
                              const areaSize = flower.notes?.includes('area_size:') 
                                ? parseInt(flower.notes.split('area_size:')[1]) || FLOWER_SIZE * 3
                                : FLOWER_SIZE * 3
                              const extraFlowers = flowerPositions.filter(f => 
                                f.id !== flower.id && 
                                f.name === flower.name &&
                                Math.abs(f.position_x - flower.position_x) < areaSize &&
                                Math.abs(f.position_y - flower.position_y) < areaSize
                              ).length
                              return `${Math.round(areaSize)}px (+${extraFlowers} bloemen)`
                            })()}
                          </div>
                        )}
                        
                        {/* Always show flower name when selected */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded shadow-lg border z-10">
                          {flower.name}
                        </div>
                      </>
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
              <div className="mt-4 text-sm text-gray-600 flex items-center justify-end">
                <div className="flex items-center gap-4">
                  <p className="text-xs">Zoom: {Math.round(scale * 100)}%</p>
                  {hasChanges && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Niet opgeslagen wijzigingen
                    </Badge>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* List View */
            <div className="space-y-4">
              {/* List Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Bloemen Lijst</span>
                  <Badge variant="secondary">{flowerPositions.length} bloemen</Badge>
                </div>
              </div>

              {/* Flowers List */}
              {flowerPositions.length === 0 ? (
                <div className="text-center py-12">
                  <Flower className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen bloemen</h3>
                  <p className="text-gray-600 mb-4">Voeg bloemen toe aan dit plantvak.</p>
                  <Button onClick={() => setIsAddingFlower(true)} className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste Bloem Toevoegen
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flowerPositions.map((flower) => (
                    <Card key={flower.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{flower.emoji || '🌸'}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{flower.name}</h3>
                              {flower.category && (
                                <p className="text-sm text-gray-500">{flower.category}</p>
                              )}
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full border-2 ${getStatusColor(flower.status || 'gezond')}`}></div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="capitalize">{flower.status || 'gezond'}</span>
                            </div>
                            {flower.plant_color && (
                              <div className="flex justify-between items-center">
                                <span>Kleur:</span>
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: flower.color || flower.plant_color }}
                                  />
                                  <span className="text-xs">{flower.plant_color}</span>
                                </div>
                              </div>
                            )}
                            {flower.plant_height && (
                              <div className="flex justify-between">
                                <span>Hoogte:</span>
                                <span>{flower.plant_height}</span>
                              </div>
                            )}
                            {flower.plants_per_sqm && (
                              <div className="flex justify-between">
                                <span>Per m²:</span>
                                <span>{flower.plants_per_sqm}</span>
                              </div>
                            )}
                            {flower.latin_name && (
                              <div className="flex justify-between col-span-2">
                                <span>Latijn:</span>
                                <span className="italic text-xs">{flower.latin_name}</span>
                              </div>
                            )}
                          </div>
                          {flower.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium">Notities:</span>
                              <p className="text-xs mt-1">{flower.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/plants/${flower.id}`)}
                            className="flex-1"
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFlower(flower)
                              // Populate form with selected flower data
                              setNewFlower({
                                name: flower.name,
                                color: flower.color || '',
                                height: flower.height?.toString() || '',
                                emoji: flower.emoji || DEFAULT_FLOWER_EMOJI,
                                status: flower.status || 'gezond',
                                notes: flower.notes || '',
                                isStandardFlower: !flower.is_custom,
                                // Populate optional fields
                                scientificName: flower.latin_name || '',
                                variety: '',
                                plantsPerSqm: flower.plants_per_sqm?.toString() || '',
                                sunPreference: flower.sun_preference || 'full-sun',
                                plantingDate: '',
                                expectedHarvestDate: '',
                                careInstructions: '',
                                wateringFrequency: '',
                                fertilizerSchedule: ''
                              })
                              setIsEditingFlower(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Tasks Section - Only in List View */}
              <div className="mt-8">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Taken voor dit Plantvak</span>
                    <Badge variant="secondary">{tasks.length} taken</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTask()}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Plantvak Taak
                    </Button>
                    {flowerPositions.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddTask(flowerPositions[0].id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Bloem Taak
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tasks List */}
                {loadingTasks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Taken laden...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen taken</h3>
                    <p className="text-gray-600 mb-4">Voeg taken toe voor dit plantvak of specifieke bloemen.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const taskTypeConfig = getTaskTypeConfig(task.task_type)
                      const priorityConfig = getPriorityConfig(task.priority)
                      const isOverdue = !task.completed && new Date(task.due_date) < new Date()
                      const isToday = task.due_date === new Date().toISOString().split('T')[0]
                      
                      return (
                        <Card key={task.id} className={`transition-all duration-200 ${task.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : isToday ? 'border-orange-200 bg-orange-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <div className="mt-1">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
                                  disabled={updatingTasks.has(task.id)}
                                  className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-opacity ${
                                    updatingTasks.has(task.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                />
                                {updatingTasks.has(task.id) && (
                                  <div className="absolute mt-1 ml-1">
                                    <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Task Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {task.description}
                                      </p>
                                    )}
                                    
                                    {/* Task Meta Info */}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        {taskTypeConfig && (
                                          <>
                                            <span>{taskTypeConfig.icon}</span>
                                            <span>{taskTypeConfig.label}</span>
                                          </>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span className={isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-orange-600 font-medium' : ''}>
                                          {formatTaskDate(task.due_date)}
                                        </span>
                                      </div>
                                      
                                      {task.plant_id ? (
                                        <div className="flex items-center gap-1">
                                          <span>🌸</span>
                                          <span>{task.plant_name}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <span>🌱</span>
                                          <span>Plantvak taak</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Priority Badge */}
                                  {priorityConfig && (
                                    <Badge className={`ml-2 ${priorityConfig.badge_color}`}>
                                      {priorityConfig.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <AddTaskForm
        isOpen={showAddTask}
        onClose={() => {
          setShowAddTask(false)
          setSelectedTaskPlantId(undefined)
        }}
        onTaskAdded={handleTaskAdded}
        preselectedPlantId={selectedTaskPlantId}
        preselectedPlantBedId={selectedTaskPlantId ? undefined : params.bedId as string}
      />



      {/* Resize Interface Overlay */}
      {showResizeInterface && selectedFlower && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-4"
          style={{
            left: resizeInterfacePosition.x - 100,
            top: resizeInterfacePosition.y - 60,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium text-gray-700">
              🌸 {selectedFlower.name}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeResizeInterface}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlowerResize(selectedFlower.id, -10)}
              className="h-8 w-8 p-0"
              disabled={selectedFlower.visual_width <= FLOWER_SIZE_SMALL}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.min(selectedFlower.visual_width, selectedFlower.visual_height)}px
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlowerResize(selectedFlower.id, 10)}
              className="h-8 w-8 p-0"
              disabled={selectedFlower.visual_width >= Math.min(canvasWidth * 0.9, canvasHeight * 0.9)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-1 text-center">
            {selectedFlower.visual_width > 100 
              ? "🌸 Bloemenveld - meer bloemen bij groter maken"
              : "Dubbelklik = grootte aanpassen"
            }
          </div>
        </div>
      )}

      
    </div>
  )
}