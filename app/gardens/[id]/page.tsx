"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

// useToast removed - no more toast notifications
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
  Trash2,
  Move,
  Calendar,
  Filter,
  Flower2,
} from "lucide-react"
import { getGarden, getPlantBeds, updatePlantBed, deletePlantBed } from "@/lib/database"
import { PlantvakService } from "@/lib/services/plantvak.service"
import type { Garden, PlantBedWithPlants, PlantWithPosition, Plant } from "@/lib/supabase"
import { 
  METERS_TO_PIXELS, 
  GARDEN_CANVAS_WIDTH as DEFAULT_CANVAS_WIDTH,
  GARDEN_CANVAS_HEIGHT as DEFAULT_CANVAS_HEIGHT,
  GARDEN_GRID_SIZE as GRID_SIZE,
  PLANTVAK_MIN_WIDTH,
  PLANTVAK_MIN_HEIGHT,
  metersToPixels,
  pixelsToMeters,
  parsePlantBedDimensions
} from "@/lib/scaling-constants"
import { PlantVisualization } from "@/components/plant-visualization"
import { PlantBedSummary } from "@/components/garden/plant-bed-summary"

interface PlantBedPosition {
  id: string
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
}

export default function GardenDetailPage() {
  const { goBack, navigateTo } = useNavigation()
  const { isVisualView, toggleView, isInitialized } = useViewPreference()
  const params = useParams()
  // toast removed - no more notifications
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [selectedBed, setSelectedBed] = useState<string | null>(null)
  
  // Enhanced drag state for better plant bed editing
  const [draggedBed, setDraggedBed] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [rotatingBed, setRotatingBed] = useState<string | null>(null)
  const [rotationStartAngle, setRotationStartAngle] = useState(0)
  const [isDragMode, setIsDragMode] = useState(false)
  const [isRotateMode, setIsRotateMode] = useState(false)
  const [touchStartTime, setTouchStartTime] = useState(0)
  
  const [hasChanges, setHasChanges] = useState(false)
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
  
  // Month filter states
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [filterMode, setFilterMode] = useState<'all' | 'sowing' | 'blooming'>('all')

  // Get default bloom period for common plants
  const getDefaultBloomPeriod = (plantName: string): string => {
    const name = plantName.toLowerCase()
    
    // Common flowers with their bloom periods
    if (name.includes('zinnia') || name.includes('zonnebloem')) return 'juli-oktober'
    if (name.includes('marigold') || name.includes('tagetes')) return 'mei-oktober'
    if (name.includes('petunia')) return 'mei-oktober'
    if (name.includes('begonia')) return 'mei-oktober'
    if (name.includes('impatiens')) return 'mei-oktober'
    if (name.includes('cosmos')) return 'juli-oktober'
    if (name.includes('calendula') || name.includes('goudsbloem')) return 'juni-oktober'
    if (name.includes('dahlia')) return 'juli-oktober'
    if (name.includes('aster')) return 'augustus-oktober'
    if (name.includes('chrysant')) return 'september-november'
    
    // Default fallback - most flowers bloom in summer/fall
    return 'juni-oktober'
  }

  // Parse month ranges from bloom_period (handles both dates and period text)
  const parseMonthRange = (period?: string): number[] => {
    if (!period) return []
    
    // Check if it's a date format (YYYY-MM-DD)
    if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(period)
      const month = date.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
      return [month]
    }
    
    const monthNames: { [key: string]: number } = {
      'januari': 1, 'februari': 2, 'maart': 3, 'april': 4,
      'mei': 5, 'juni': 6, 'juli': 7, 'augustus': 8,
      'september': 9, 'oktober': 10, 'november': 11, 'december': 12,
      'jan': 1, 'feb': 2, 'mrt': 3, 'apr': 4, 'mei': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'dec': 12
    }
    
    const parts = period.toLowerCase().split('-')
    if (parts.length !== 2) return []
    
    const startMonth = monthNames[parts[0].trim()]
    const endMonth = monthNames[parts[1].trim()]
    
    if (!startMonth || !endMonth) return []
    
    const months: number[] = []
    let current = startMonth
    while (current !== endMonth) {
      months.push(current)
      current = current === 12 ? 1 : current + 1
      if (months.length > 12) break
    }
    months.push(endMonth)
    return months
  }

  // Helper to check if a plant matches the filter
  const plantMatchesFilter = (plant: PlantWithPosition): boolean => {
    if (!selectedMonth || filterMode === 'all') return true

    if (filterMode === 'blooming') {
      // Check if plant blooms in selected month - handle both dates and period text
      if (plant.bloom_period) {
        // If it's a date format (YYYY-MM-DD), extract month directly
        if (plant.bloom_period.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const bloomDate = new Date(plant.bloom_period)
          const bloomMonth = bloomDate.getMonth() + 1
          return bloomMonth === selectedMonth
        } else {
          // If it's period text like "mei-oktober", use parseMonthRange
          const bloomMonths = parseMonthRange(plant.bloom_period)
          return bloomMonths.includes(selectedMonth)
        }
      }
      return false
    } else if (filterMode === 'sowing') {
      // Check if plant has planting_date in selected month
      if (plant.planting_date) {
        const plantingDate = new Date(plant.planting_date)
        const plantingMonth = plantingDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
        return plantingMonth === selectedMonth
      }
      
      // Fallback: if no planting_date, calculate sowing months from bloom_period
      const bloomMonths = parseMonthRange(plant.bloom_period)
      if (bloomMonths.length === 0) return false
      
      const firstBloomMonth = bloomMonths[0]
      for (let i = 2; i <= 3; i++) {
        let sowMonth = firstBloomMonth - i
        if (sowMonth <= 0) sowMonth += 12
        if (sowMonth === selectedMonth) return true
      }
    }
    return false
  }

  // Helper to check if a plant bed should be highlighted based on month filter
  const shouldHighlightBed = (bed: PlantBedWithPlants): boolean => {
    if (!selectedMonth || filterMode === 'all') return false
    
    // Check if any plant matches the filter
    return bed.plants.some(plant => plantMatchesFilter(plant))
  }

  // Get filtered plants for a bed
  const getFilteredPlants = (bed: PlantBedWithPlants): PlantWithPosition[] => {
    if (!selectedMonth || filterMode === 'all') return bed.plants
    return bed.plants.filter(plant => plantMatchesFilter(plant))
  }

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
    soil_type: 'gemengd' // Default bodemtype
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
        const processedBeds = await Promise.all(plantBedsData.map(async (bed: any) => {
          let visualWidth = bed.visual_width
          let visualHeight = bed.visual_height
          
          // Always recalculate from size to ensure correct scaling
          if (bed.size) {
            const dims = getDimensionsFromSize(bed.size)
            visualWidth = dims.width
            visualHeight = dims.height
            
            // Update the database with recalculated dimensions if they're different
            if (bed.visual_width !== visualWidth || bed.visual_height !== visualHeight) {

              try {
                await updatePlantBed(bed.id, {
                  visual_width: visualWidth,
                  visual_height: visualHeight
                })

              } catch (error) {

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

  // Check if plant beds fit in new garden dimensions
  const validatePlantBedsInGarden = (newLength: string, newWidth: string) => {
    if (!newLength || !newWidth || plantBeds.length === 0) return { fits: true, warnings: [] }
    
    const gardenLengthM = parseFloat(newLength)
    const gardenWidthM = parseFloat(newWidth)
    
    if (isNaN(gardenLengthM) || isNaN(gardenWidthM) || gardenLengthM <= 0 || gardenWidthM <= 0) {
      return { fits: true, warnings: [] }
    }
    
    // Convert garden dimensions to pixels
    const gardenLengthPx = metersToPixels(gardenLengthM)  // This is the WIDTH in pixels (horizontal)
    const gardenWidthPx = metersToPixels(gardenWidthM)    // This is the HEIGHT in pixels (vertical)
    
    const warnings: string[] = []
    let allFit = true
    
    plantBeds.forEach(bed => {
      const bedX = bed.position_x || 100
      const bedY = bed.position_y || 100
      const bedWidth = bed.visual_width || PLANTVAK_MIN_WIDTH
      const bedHeight = bed.visual_height || PLANTVAK_MIN_HEIGHT
      
      // Calculate the edges of the plant bed
      const bedRightEdge = bedX + bedWidth
      const bedBottomEdge = bedY + bedHeight
      
      // Check if plant bed extends beyond garden boundaries
      const fitsHorizontally = bedRightEdge <= gardenLengthPx
      const fitsVertically = bedBottomEdge <= gardenWidthPx
      
      if (!fitsHorizontally || !fitsVertically) {
        allFit = false
        
        // Calculate how much the bed extends beyond the garden
        const overflowX = Math.max(0, bedRightEdge - gardenLengthPx)
        const overflowY = Math.max(0, bedBottomEdge - gardenWidthPx)
        
        const overflowDescription: string[] = []
        if (overflowX > 0) {
          overflowDescription.push(`${(overflowX / METERS_TO_PIXELS).toFixed(1)}m te breed`)
        }
        if (overflowY > 0) {
          overflowDescription.push(`${(overflowY / METERS_TO_PIXELS).toFixed(1)}m te diep`)
        }
        
        warnings.push(`Plantvak "${bed.name}" (${bed.size || 'onbekende grootte'}) valt ${overflowDescription.join(' en ')} buiten de tuin`)
      }
    })
    
    return { fits: allFit, warnings }
  }

  // Handle garden update
  const handleGardenUpdate = async () => {
    if (!garden) return
    
    // Validate that plant beds still fit
    const validation = validatePlantBedsInGarden(gardenForm.length, gardenForm.width)
    
    if (!validation.fits) {
        // Removed toast notification
      
      // Show detailed warnings
      validation.warnings.forEach((warning, index) => {
        setTimeout(() => {
        // Removed toast notification
        }, (index + 1) * 1000)
      })
      return
    }
    
    try {
      // Update garden in database
      const updatedGarden = {
        ...garden,
        name: gardenForm.name,
        length: gardenForm.length,
        width: gardenForm.width,
        description: gardenForm.description,
        total_area: gardenForm.length && gardenForm.width ? 
          (parseFloat(gardenForm.length) * parseFloat(gardenForm.width)).toString() : garden.total_area
      }
      
      // You'll need to implement updateGarden function in database.ts
      // For now, we'll simulate the update
      setGarden(updatedGarden)
      setIsEditingGarden(false)
      
        // Removed toast notification
    } catch (error) {

        // Removed toast notification
    }
  }

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
      'bg-green-50 dark:bg-green-950/20 border-green-400 shadow-green-100',
      'bg-blue-50 dark:bg-blue-950/20 border-blue-400 shadow-blue-100',
      'bg-purple-50 dark:bg-purple-950/20 border-purple-400 shadow-purple-100',
      'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-400 shadow-yellow-100',
      'bg-pink-50 border-pink-400 shadow-pink-100',
      'bg-indigo-50 border-indigo-400 shadow-indigo-100',
    ]
    return colors[index % colors.length]
  }

  // Convert dimensions from string (e.g., "2m x 1.5m" or "2 x 1.5") to pixels
  const getDimensionsFromSize = (size: string) => {
    const dimensions = parsePlantBedDimensions(size)
    if (dimensions) {

      // Fix: In size strings like "4x3 meter", the first number (lengthMeters) is the visual width,
      // and the second number (widthMeters) is the visual height
      return {
        width: dimensions.lengthPixels,  // First number = visual width (horizontal)
        height: dimensions.widthPixels   // Second number = visual height (vertical)
      }
    }

    // Default to 2x2 meters instead of minimum size
    return {
      width: metersToPixels(2),
      height: metersToPixels(2)
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

  // Handle single click/tap - select bed (mobile) or prepare for drag (desktop)
  const handlePlantBedClick = useCallback((e: React.MouseEvent | React.TouchEvent, bedId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // For touch devices, use the old toggle behavior
    if ('touches' in e) {
      if (selectedBed === bedId && isDragMode) {
        setIsDragMode(false)
        setSelectedBed(null)
        // Removed feedback toast - no more notifications when moving
      } else {
        setSelectedBed(bedId)
        setIsDragMode(true)
        // Removed feedback toast - no more notifications when moving  
      }
    } else {
      // For mouse, just select the bed - dragging happens on mousedown
      setSelectedBed(bedId)
      setIsDragMode(false)
    }
  }, [selectedBed, isDragMode])

  // Handle pointer down - start dragging immediately for mouse, conditionally for touch
  const handlePlantBedPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent, bedId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const { clientX, clientY } = getPointerPosition(e)
    
    // Record touch start time for long press detection
    if ('touches' in e) {
      setTouchStartTime(Date.now())
      // For touch, only start dragging if we're in drag mode
      if (!isDragMode || selectedBed !== bedId) {
        return
      }
    }

    const bed = plantBeds.find(b => b.id === bedId)
    if (!bed) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    // Start dragging immediately
    const offsetX = clientX - rect.left - (bed.position_x || 100) * scale
    const offsetY = clientY - rect.top - (bed.position_y || 100) * scale

    setDraggedBed(bedId)
    setDragOffset({ x: offsetX / scale, y: offsetY / scale })
    setSelectedBed(bedId)
    setHasChanges(true)

    // Removed feedback toast - no more notifications when moving
  }, [plantBeds, scale, isDragMode, selectedBed])

  const handlePlantBedTouchEnd = useCallback((e: React.TouchEvent, bedId: string) => {
    const touchDuration = Date.now() - touchStartTime
    
    // Clear long press timer
    const target = e.target as HTMLElement & { longPressTimer?: NodeJS.Timeout }
    if (target.longPressTimer) {
      clearTimeout(target.longPressTimer)
    }
    
    // If it was a quick tap (not long press), handle as click
    if (touchDuration < 500) {
      handlePlantBedClick(e, bedId)
    }
  }, [touchStartTime, handlePlantBedClick])

  // Handle double click/tap - navigate to plant bed details
  const handlePlantBedDoubleClick = useCallback((bedId: string) => {
    // Exit drag mode first
    setIsDragMode(false)
    setSelectedBed(null)
    
    navigateTo(`/gardens/${garden?.id}/plantvak-view/${bedId}`)
  }, [navigateTo, garden])

  // Handle drag move - unified for mouse and touch with improved boundaries
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!draggedBed || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const bed = plantBeds.find(b => b.id === draggedBed)
    if (!bed) return

    const bedWidth = bed.visual_width || PLANTVAK_MIN_WIDTH
    const bedHeight = bed.visual_height || PLANTVAK_MIN_HEIGHT
    
    // Allow placement all the way to corners with small safety margin
    const SAFETY_MARGIN = 10  // Small margin to keep handles accessible
    const minX = -bedWidth + SAFETY_MARGIN  // Allow almost complete placement outside canvas
    const minY = -bedHeight + SAFETY_MARGIN  // Allow almost complete placement outside canvas
    const maxX = CANVAS_WIDTH - SAFETY_MARGIN  // Allow placement to right edge
    const maxY = CANVAS_HEIGHT - SAFETY_MARGIN  // Allow placement to bottom edge

    const x = Math.max(minX, Math.min((clientX - rect.left) / scale - dragOffset.x, maxX))
    const y = Math.max(minY, Math.min((clientY - rect.top) / scale - dragOffset.y, maxY))

    setPlantBeds(prev => prev.map(bed => 
      bed.id === draggedBed 
        ? { ...bed, position_x: x, position_y: y }
        : bed
    ))
    setHasChanges(true)
  }, [draggedBed, dragOffset, scale, plantBeds, CANVAS_WIDTH, CANVAS_HEIGHT])

  // Create sample flowers for a new plant bed - DISABLED
  const createSampleFlowers = useCallback(async (plantBedId: string, length: number, width: number): Promise<Plant[]> => {
    // Functionality disabled - no automatic flowers are added
    return []
  }, [])

  // Check if plant bed needs more flowers and add them - DISABLED
  const checkAndAddMoreFlowers = useCallback(async (bed: PlantBedWithPlants) => {
    // Functionality disabled - no automatic flowers are added
    return
  }, [])

  // Handle mouse up (end drag or resize) with auto-save
  const handleMouseUp = useCallback(async () => {
    if (!draggedBed && !rotatingBed) return
    
    // Auto-save when dragging or rotating stops
    if ((draggedBed || rotatingBed) && hasChanges) {
      const bedToUpdate = plantBeds.find(bed => bed.id === (draggedBed || rotatingBed))
      if (bedToUpdate) {
        // Auto-save the position and rotation immediately
        try {
          await updatePlantBed(bedToUpdate.id, {
            position_x: bedToUpdate.position_x,
            position_y: bedToUpdate.position_y,
            visual_width: bedToUpdate.visual_width,
            visual_height: bedToUpdate.visual_height,
            rotation: bedToUpdate.rotation // Also save rotation
          })
          
          setHasChanges(false)
          
          // Show save confirmation only once per session (removed feedback as requested)
          // if (!sessionStorage.getItem('gardenSaveShown')) {
        // Removed toast notification
          //   sessionStorage.setItem('gardenSaveShown', 'true')
          // }
        } catch (error) {

        // Removed toast notification
        }
        
        // Check if plant bed was resized and add more flowers if needed
        await checkAndAddMoreFlowers(bedToUpdate)
      }
    }
    
    setDraggedBed(null)
    setDragOffset({ x: 0, y: 0 })
    setRotatingBed(null)
    setIsRotateMode(false)
  }, [draggedBed, rotatingBed, hasChanges, plantBeds, checkAndAddMoreFlowers])

  // Calculate angle between two points (for rotation)
  const calculateAngle = useCallback((centerX: number, centerY: number, pointX: number, pointY: number) => {
    const deltaX = pointX - centerX
    const deltaY = pointY - centerY
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI)
  }, [])

  // Handle rotation interaction - improved
  const handleRotationMove = useCallback((clientX: number, clientY: number) => {
    if (!rotatingBed || !canvasRef.current || draggedBed) return // Don't rotate while dragging

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const mouseX = (clientX - rect.left) / scale
    const mouseY = (clientY - rect.top) / scale

    const bed = plantBeds.find(b => b.id === rotatingBed)
    if (!bed) return

    // Calculate bed center
    const bedWidth = bed.visual_width || metersToPixels(2)
    const bedHeight = bed.visual_height || metersToPixels(2)
    const centerX = (bed.position_x || 100) + bedWidth / 2
    const centerY = (bed.position_y || 100) + bedHeight / 2

    // Calculate current angle
    const currentAngle = calculateAngle(centerX, centerY, mouseX, mouseY)
    const deltaAngle = currentAngle - rotationStartAngle
    // Much slower rotation for better control (divide by 4 instead of 2)
    const adjustedDelta = deltaAngle / 4
    const newRotation = Math.round(((bed.rotation || 0) + adjustedDelta) % 360)

    // Update plant bed rotation
    setPlantBeds(prev => prev.map(b => 
      b.id === rotatingBed 
        ? { ...b, rotation: newRotation }
        : b
    ))
    setHasChanges(true)
  }, [rotatingBed, scale, plantBeds, rotationStartAngle, calculateAngle, draggedBed])

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rotatingBed) {
      handleRotationMove(e.clientX, e.clientY)
    } else {
      handlePointerMove(e.clientX, e.clientY)
    }
  }, [handlePointerMove, rotatingBed, handleRotationMove])

  // Touch move handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (rotatingBed) {
      handleRotationMove(touch.clientX, touch.clientY)
    } else {
      handlePointerMove(touch.clientX, touch.clientY)
    }
  }, [handlePointerMove, rotatingBed, handleRotationMove])

  // Handle click outside to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBed(null)
      setIsDragMode(false)
      setIsRotateMode(false)
      // No feedback needed when deselecting
    }
  }, [])

  // Add global mouse event listeners for drag and resize
  useEffect(() => {
    if (draggedBed || rotatingBed) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (rotatingBed) {
          handleRotationMove(e.clientX, e.clientY)
        } else {
          handlePointerMove(e.clientX, e.clientY)
        }
      }
      
      const handleGlobalTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        if (rotatingBed) {
          handleRotationMove(touch.clientX, touch.clientY)
        } else {
          handlePointerMove(touch.clientX, touch.clientY)
        }
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [draggedBed, rotatingBed, handlePointerMove, handleRotationMove, handleMouseUp])

  // Auto-check for missing flowers when plant beds change
  useEffect(() => {
    const checkAllBedsForFlowers = async () => {
      for (const bed of plantBeds) {
        if (bed.plants.length === 0 && bed.size) {

          await checkAndAddMoreFlowers(bed)
        }
      }
    }
    
    if (plantBeds.length > 0) {
      checkAllBedsForFlowers()
    }
  }, [plantBeds, checkAndAddMoreFlowers]) // Run when beds change

  // Note: Manual save layout function removed - now using auto-save on drag end

  // Update plant bed rotation
  const updatePlantBedRotation = async (bedId: string, newRotation: number) => {
    try {
      const updatedBed = await updatePlantBed(bedId, {
        rotation: newRotation
      })
      
      if (updatedBed) {
        setPlantBeds(prev => prev.map(bed => 
          bed.id === bedId 
            ? { ...bed, rotation: updatedBed.rotation ?? newRotation }
            : bed
        ))
        
        // Removed toast notification
      }
    } catch (error) {

        // Removed toast notification
    }
  }

  // Add new plant bed
  const addPlantBed = async () => {

    if (!garden || !newPlantBed.length || !newPlantBed.width) {

        // Removed toast notification
      return
    }

    try {
      // Calculate dimensions from length and width
      const length = parseFloat(newPlantBed.length)
      const width = parseFloat(newPlantBed.width)
      
      if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
        // Removed toast notification
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

      // Gebruik PlantvakService voor automatische letter toewijzing
      const plantBed = await PlantvakService.create({
        garden_id: garden.id,
        size: sizeString,
        description: newPlantBed.description?.trim() || undefined,
        sun_exposure: newPlantBed.sun_exposure,
        soil_type: newPlantBed.soil_type?.trim() || 'gemengd', // Default soil type
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
          // No default flowers - start with empty plant bed
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
            plants: []  // Start with no flowers
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
        // Removed toast notification
        }
      }
    } catch (error) {

        // Removed toast notification
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
      
        // Removed toast notification
    } catch (error) {

        // Removed toast notification
    } finally {
      setDeletingBedId(null)
      setShowDeleteDialog(false)
      setSelectedBed(null)
    }
  }

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case 'full-sun': return <Sun className=""h-4 w-4 text-yellow-500" />
      case 'partial-sun': return <CloudSun className=""h-4 w-4 text-orange-500" />
      case 'shade': return <Cloud className=""h-4 w-4 text-muted-foreground" />
      default: return <Sun className=""h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className=""container mx-auto p-6 space-y-6">
        <div className=""animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className=""h-24 bg-green-100 dark:bg-green-900/30 rounded" />
          ))}
        </div>
        <div className=""h-8 w-1/3 bg-green-100 dark:bg-green-900/30 rounded" />
        <div className=""h-32 w-full bg-green-100 dark:bg-green-900/30 rounded" />
        <div className=""grid gap-4">
          <div className=""h-24 w-full bg-green-100 dark:bg-green-900/30 rounded" />
          <div className=""h-24 w-full bg-green-100 dark:bg-green-900/30 rounded" />
        </div>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className=""container mx-auto p-6">
        <div className=""text-center py-12">
          <TreePine className=""h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className=""text-lg font-medium text-foreground mb-2">Tuin niet gevonden</h3>
          <p className=""text-muted-foreground mb-4">De tuin die je zoekt bestaat niet of is verwijderd.</p>
          <Button onClick={() => {

            window.location.href = '/gardens'
          }} className=""bg-green-600 dark:bg-green-700 hover:bg-green-700">
            <ArrowLeft className=""h-4 w-4 mr-2" />
            Terug naar Tuinen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className=""container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
      {/* Minimalist Header */}
      <div className=""mb-6">
        <div className=""flex items-center justify-between mb-4">
          <div className=""flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              className=""h-10 px-3 border-green-300 dark:border-green-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <ArrowLeft className=""w-4 h-4 mr-2" />
              Terug
            </Button>
            
            <div className=""flex items-center gap-3">
              <div className=""p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TreePine className=""w-5 h-5 text-green-700 dark:text-green-400" />
              </div>
              <h1 className=""text-xl font-bold text-green-800 dark:text-green-200">
                {garden.name}
              </h1>
            </div>
          </div>
          
          <div className=""flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingGarden(true)}
              className=""h-8 px-3 border-green-300 dark:border-green-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <Edit className=""w-4 h-4 mr-1" />
              Bewerken
            </Button>
            
            <Button
              variant={isVisualView ? "default" : "outline"}
              size="sm"
              onClick={toggleView}
              className={{`h-8 px-3 ${
                isVisualView 
                  ? "bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black" 
                  : "border-green-300 dark:border-green-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
              }`}
            >
              <Grid3X3 className=""w-4 h-4 mr-1" />
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
                <Button className=""h-8 px-3 bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black">
                  <Plus className=""w-4 h-4 mr-1" />
                  Plantvak Toevoegen
                </Button>
              </DialogTrigger>
              <DialogContent className=""w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nieuw Plantvak Toevoegen</DialogTitle>
                  <DialogDescription>
                    Voeg een nieuw plantvak toe aan je tuin. Geef de afmetingen in meters op voor een schaalgetrouwe weergave.
                  </DialogDescription>
                </DialogHeader>
                <div className=""grid gap-4 py-4">
                  <div className=""grid gap-2">
                    <label htmlFor="name" className=""text-sm font-medium">
                      Naam *
                    </label>
                    <Input
                      id="name"
                      value={newPlantBed.name}
                      onChange={(e) => setNewPlantBed(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Bijvoorbeeld: Voorste border"
                    />
                  </div>
                <div className=""grid grid-cols-2 gap-4">
                  <div className=""grid gap-2">
                    <label htmlFor="length" className=""text-sm font-medium">
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
                  <div className=""grid gap-2">
                    <label htmlFor="width" className=""text-sm font-medium">
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
                <div className=""grid gap-2">
                  <label htmlFor="sun_exposure" className=""text-sm font-medium">
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
                        <div className=""flex items-center gap-2">
                          <Sun className=""h-4 w-4 text-yellow-500" />
                          Volle zon
                        </div>
                      </SelectItem>
                      <SelectItem value="partial-sun">
                        <div className=""flex items-center gap-2">
                          <CloudSun className=""h-4 w-4 text-orange-500" />
                          Halfschaduw
                        </div>
                      </SelectItem>
                      <SelectItem value="shade">
                        <div className=""flex items-center gap-2">
                          <Cloud className=""h-4 w-4 text-muted-foreground" />
                          Schaduw
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=""grid gap-2">
                  <label htmlFor="soil_type" className=""text-sm font-medium">
                    Grondsoort
                  </label>
                  <Input
                    id="soil_type"
                    value={newPlantBed.soil_type}
                    onChange={(e) => setNewPlantBed(prev => ({ ...prev, soil_type: e.target.value }))}
                    placeholder="Bijvoorbeeld: Kleigrond, zandgrond"
                  />
                </div>

                <div className=""grid gap-2">
                  <label htmlFor="description" className=""text-sm font-medium">
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
              <div className=""flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPlantBed(false)}>
                  Annuleren
                </Button>
                <Button onClick={addPlantBed} className=""bg-green-600 dark:bg-green-700 hover:bg-green-700">
                  <Plus className=""h-4 w-4 mr-2" />
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
            <div className=""flex flex-col gap-3">
              <div className=""flex justify-between items-center">
                <CardTitle className=""flex items-center gap-2">
                  <Grid3X3 className=""h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Tuinoverzicht
                </CardTitle>
                <div className=""flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut className=""h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn className=""h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetView}>
                    <RotateCcw className=""h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Month Filter Controls */}
              <div className=""flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className=""flex items-center gap-2">
                  <Calendar className=""h-4 w-4 text-muted-foreground" />
                  <span className=""text-sm font-medium">Filter op maand:</span>
                </div>
                
                <Select 
                  value={selectedMonth?.toString() || "none"} 
                  onValueChange={(value) => {
                    setSelectedMonth(value === "none" ? undefined : parseInt(value))
                    if (value === "none") setFilterMode('all')
                    else if (filterMode === 'all') setFilterMode('blooming')
                  }}
                >
                  <SelectTrigger className=""w-32">
                    <SelectValue placeholder="Kies maand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geen filter</SelectItem>
                    <SelectItem value="1">Januari</SelectItem>
                    <SelectItem value="2">Februari</SelectItem>
                    <SelectItem value="3">Maart</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">Mei</SelectItem>
                    <SelectItem value="6">Juni</SelectItem>
                    <SelectItem value="7">Juli</SelectItem>
                    <SelectItem value="8">Augustus</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">Oktober</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedMonth && (
                  <div className=""flex gap-1">
                    <Button
                      size="sm"
                      variant={filterMode === 'sowing' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('sowing')}
                      className=""text-xs"
                    >
                      🌱 Zaaien
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMode === 'blooming' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('blooming')}
                      className=""text-xs"
                    >
                      🌸 Bloeit
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMode === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('all')}
                      className=""text-xs"
                    >
                      Alles
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile help text */}
            <div className=""mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg md:hidden">
              <h4 className=""font-medium text-blue-900 mb-1">📱 Plantvak beheren:</h4>
              <ul className=""text-sm text-blue-800 space-y-1">
                <li>• <strong>Sleep:</strong> Verplaats plantvak direct</li>
                <li>• <strong>Dubbel tikken:</strong> Plantvak openen</li>
                <li>• <strong>🟠 Rotatie handvat:</strong> Sleep om te roteren</li>
              </ul>
              <div className=""mt-2 pt-2 border-t border-blue-300 dark:border-blue-700">
                <p className=""text-xs text-blue-700 dark:text-blue-300">
                  🏡 <strong>Tuin:</strong> {widthMeters.toFixed(1)}m × {heightMeters.toFixed(1)}m
                </p>
              </div>
            </div>
            
            <div className=""relative overflow-auto rounded-lg border-2 border-dashed border-green-200" style={{ minHeight: "400px" }}>
              <div
                ref={canvasRef}
                className=""relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-green-950/30 cursor-crosshair"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                {/* Grid - 1m = 80px */}
                <div
                  className=""absolute inset-0 pointer-events-none opacity-20"
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
                  const isDragging = draggedBed === bed.id
                  const isRotating = rotatingBed === bed.id
                  const isHighlighted = shouldHighlightBed(bed)
                  
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
                      className=""absolute"
                      style={{
                        left: bed.position_x || 100,
                        top: bed.position_y || 100,
                      }}
                    >
                      {/* Plantvak container */}
                      <div
                        className={{`border-3 rounded-lg transition-all duration-200 group shadow-lg ${
                          isDragging ? 'shadow-2xl scale-105 border-green-600 z-50 cursor-grabbing ring-4 ring-green-300' : 
                          isRotating ? 'shadow-2xl border-orange-600 z-50 ring-4 ring-orange-200' :
                          isSelected ? 'border-blue-600 shadow-xl ring-3 ring-blue-300 cursor-grab' :
                          'cursor-grab hover:shadow-xl hover:scale-102 hover:border-green-500 hover:ring-2 hover:ring-green-300'
                        }`}
                        style={{
                          width: bedWidth,
                          height: bedHeight,
                          transform: `rotate(${bed.rotation || 0}deg)`,
                          transformOrigin: 'center center',
                        }}
                        onDoubleClick={() => handlePlantBedDoubleClick(bed.id)}
                        onMouseDown={(e) => handlePlantBedPointerDown(e, bed.id)}
                        onTouchStart={(e) => handlePlantBedPointerDown(e, bed.id)}
                        onTouchEnd={(e) => handlePlantBedTouchEnd(e, bed.id)}
                        onClick={(e) => handlePlantBedClick(e, bed.id)}
                      >
                        <div className={{`w-full h-full rounded-lg ${getPlantBedColor(bed.id)} group-hover:bg-green-100 transition-colors relative border border-gray-200 dark:border-gray-600 ${
                          isSelected ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : ''
                        }`}>
                          {/* Top corner elements */}
                          <div className=""flex items-start justify-between">
                            <div className=""flex items-center gap-1">
                              {bed.sun_exposure && (
                                <div className=""bg-background/90 p-1 rounded shadow-sm">
                                  {getSunExposureIcon(bed.sun_exposure)}
                                </div>
                              )}
                              {selectedMonth && filterMode !== 'all' && (
                                <Badge 
                                  variant={isHighlighted ? "default" : "outline"} 
                                  className={{`text-xs ${isHighlighted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                                >
                                  {filterMode === 'sowing' ? '🌱' : '🌸'}
                                  {!isHighlighted && ' -'}
                                </Badge>
                              )}
                            </div>
                            {isDragging && (
                              <div className=""text-xs font-bold text-green-600 bg-green-100 dark:bg-green-950 px-2 py-1 rounded shadow-sm animate-bounce">
                                🖱️ Verplaatsen
                              </div>
                            )}
                            {isRotating && (
                              <div className=""text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-950 px-2 py-1 rounded shadow-sm animate-pulse">
                                🔄 Roteren
                              </div>
                            )}
                          </div>

                          {/* Main area - adaptive content based on size */}
                          <div className=""w-full h-full p-2 overflow-y-auto relative">
                            {(() => {
                              // Get filtered plants based on month filter
                              const filteredPlants = getFilteredPlants(bed)
                              
                              if (filteredPlants.length === 0) {
                                // Show message when no plants match the filter
                                if (selectedMonth && filterMode !== 'all' && bed.plants.length > 0) {
                                  return (
                                    <div className=""flex items-center justify-center h-full text-muted-foreground text-xs">
                                      <div className=""text-center p-2">
                                        <div className=""text-gray-400 dark:text-gray-500 mb-1">
                                          {filterMode === 'sowing' ? '🌱' : '🌸'}
                                        </div>
                                        <div className=""font-medium">Niet actief</div>
                                        <div className=""text-[10px]">
                                          {filterMode === 'sowing' ? 'Geen zaaitijd' : 'Bloeit niet'}
                                        </div>
                                        <div className=""text-[10px] mt-1 text-gray-500 dark:text-gray-400">
                                          ({bed.plants.length} plant{bed.plants.length !== 1 ? 'en' : ''} totaal)
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                // Empty bed
                                return (
                                  <div className=""flex items-center justify-center h-full text-muted-foreground text-xs font-medium">
                                    Leeg plantvak
                                  </div>
                                )
                              }
                              
                              return (
                                <div className=""space-y-1">
                                  {/* Group plants by unique name */}
                                  {(() => {
                                    // Import Dutch flower data for bloom periods
                                    const dutchFlowers = {
                                      'Zinnia': { bloeiperiode: 'Juni-Oktober', zaaiperiode: 'April-Mei' },
                                      'Marigold': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'Maart-April' },
                                      'Tagetes': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'Maart-April' },
                                      'Petunia': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'Februari-Maart' },
                                      'Begonia': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'Januari-Februari' },
                                      'Impatiens': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'Februari-Maart' },
                                      'Cosmos': { bloeiperiode: 'Juli-Oktober', zaaiperiode: 'April-Mei' },
                                      'Calendula': { bloeiperiode: 'Juni-Oktober', zaaiperiode: 'Maart-April' },
                                      'Goudsbloem': { bloeiperiode: 'Juni-Oktober', zaaiperiode: 'Maart-April' },
                                      'Zonnebloem': { bloeiperiode: 'Juli-September', zaaiperiode: 'April-Mei' },
                                      'Sunflower': { bloeiperiode: 'Juli-September', zaaiperiode: 'April-Mei' },
                                      'Dahlia': { bloeiperiode: 'Juli-Oktober', zaaiperiode: 'Maart-April' },
                                      'Lavendel': { bloeiperiode: 'Juni-Augustus', zaaiperiode: 'Maart-April' },
                                      'Roos': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'November-Maart' },
                                      'Rose': { bloeiperiode: 'Mei-Oktober', zaaiperiode: 'November-Maart' },
                                    }
                                    
                                    const plantGroups = new Map()
                                    filteredPlants.forEach(plant => {
                                    // Use variety or latin_name if name is generic
                                    const displayName = plant.variety || plant.latin_name || plant.scientific_name || plant.name || 'Plant'
                                    const key = displayName
                                    
                                    // Try to find bloom data from Dutch flowers database
                                    let bloomData = null
                                    for (const [flowerName, data] of Object.entries(dutchFlowers)) {
                                      if (displayName.toLowerCase().includes(flowerName.toLowerCase()) || 
                                          (plant.name && plant.name.toLowerCase().includes(flowerName.toLowerCase()))) {
                                        bloomData = data
                                        break
                                      }
                                    }
                                    
                                    if (!plantGroups.has(key)) {
                                      plantGroups.set(key, {
                                        name: displayName,
                                        count: 0,
                                        color: plant.color || plant.plant_color,
                                        emoji: plant.emoji,
                                        bloom_period: plant.bloom_period || bloomData?.bloeiperiode || null,
                                        planting_date: plant.planting_date || bloomData?.zaaiperiode || null
                                      })
                                    }
                                    plantGroups.get(key).count++
                                  })
                                  
                                  const isSmall = bedWidth < 200 || bedHeight < 200
                                  const groups = Array.from(plantGroups.values())
                                  
                                  // For small plantvakken, show compact view
                                  if (isSmall) {
                                    return (
                                      <div className=""flex flex-col items-center justify-center h-full">
                                        <div className=""flex flex-wrap justify-center gap-1">
                                          {groups.slice(0, 4).map((group, idx) => (
                                            <span key={idx} className=""text-base" title={group.name}>
                                              {group.emoji || '🌸'}
                                            </span>
                                          ))}
                                        </div>
                                        <div className=""text-xs text-center mt-1 text-muted-foreground">
                                          {bed.plants.length} plant{bed.plants.length !== 1 ? 'en' : ''}
                                        </div>
                                      </div>
                                    )
                                  }
                                  
                                  // For larger plantvakken, show detailed view with HIGH CONTRAST text
                                  return (
                                    <div className=""space-y-1">
                                      {groups.map((group, idx) => (
                                        <div key={idx} className=""bg-white dark:bg-gray-900 rounded p-1.5 border border-gray-400 dark:border-gray-400 shadow-sm">
                                          <div className=""flex items-start gap-1">
                                            <span className=""text-lg">{group.emoji || '🌸'}</span>
                                            <div className=""flex-1">
                                              <div className=""flex items-center gap-1 flex-wrap">
                                                <span className=""font-bold text-xs text-black dark:text-white dark:text-black">
                                                  {group.count > 1 && `${group.count}x `}{group.name}
                                                </span>
                                                {group.color && (
                                                  <div 
                                                    className=""w-3 h-3 rounded-full border border-black dark:border-white"
                                                    style={{ backgroundColor: group.color }}
                                                    title={`Kleur: ${group.color}`}
                                                  />
                                                )}
                                              </div>
                                              {/* Show details with bloom data */}
                                              <div className=""text-[10px] text-black dark:text-white dark:text-black font-medium space-y-0">
                                                {group.planting_date && (
                                                  <div>🌱 Zaai: {group.planting_date}</div>
                                                )}
                                                {group.bloom_period && (
                                                  <div>🌸 Bloei: {group.bloom_period}</div>
                                                )}
                                                {!group.planting_date && !group.bloom_period && (
                                                  <div className=""text-gray-500 dark:text-gray-400 italic">Geen seizoensdata beschikbaar</div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    )
                                  })()}
                                </div>
                              )
                            })()}
                            
                            {/* Corner decorations */}
                            <div className=""absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-green-400 rounded-tl-lg pointer-events-none opacity-50"></div>
                            <div className=""absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-green-400 rounded-tr-lg pointer-events-none opacity-50"></div>
                            <div className=""absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-green-400 rounded-bl-lg pointer-events-none opacity-50"></div>
                            <div className=""absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-green-400 rounded-br-lg pointer-events-none opacity-50"></div>
                          </div>

                          {isSelected && (
                            <>
                              <div className=""absolute -top-1 -right-1 bg-blue-500 dark:bg-blue-600 text-white dark:text-black text-xs px-1 rounded">
                                Geselecteerd
                              </div>
                              {/* Rotation handle - improved */}
                              <div
                                className=""absolute -top-2 -left-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white dark:text-black rounded-full flex items-center justify-center cursor-grab text-sm font-bold shadow-xl border-2 border-white dark:border-gray-800 z-20"
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  if (!canvasRef.current) return
                                  
                                  const canvas = canvasRef.current
                                  const rect = canvas.getBoundingClientRect()
                                  const mouseX = (e.clientX - rect.left) / scale
                                  const mouseY = (e.clientY - rect.top) / scale
                                  
                                  const bedWidth = bed.visual_width || metersToPixels(2)
                                  const bedHeight = bed.visual_height || metersToPixels(2)
                                  const centerX = (bed.position_x || 100) + bedWidth / 2
                                  const centerY = (bed.position_y || 100) + bedHeight / 2
                                  
                                  const startAngle = calculateAngle(centerX, centerY, mouseX, mouseY)
                                  setRotationStartAngle(startAngle)
                                  setRotatingBed(bed.id)
                                  setIsRotateMode(true)
                                  
                                  // Stop any dragging when rotating
                                  setDraggedBed(null)
                                  setIsDragMode(false)
                                }}
                                onTouchStart={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  if (!canvasRef.current) return
                                  
                                  const touch = e.touches[0]
                                  const canvas = canvasRef.current
                                  const rect = canvas.getBoundingClientRect()
                                  const touchX = (touch.clientX - rect.left) / scale
                                  const touchY = (touch.clientY - rect.top) / scale
                                  
                                  const bedWidth = bed.visual_width || metersToPixels(2)
                                  const bedHeight = bed.visual_height || metersToPixels(2)
                                  const centerX = (bed.position_x || 100) + bedWidth / 2
                                  const centerY = (bed.position_y || 100) + bedHeight / 2
                                  
                                  const startAngle = calculateAngle(centerX, centerY, touchX, touchY)
                                  setRotationStartAngle(startAngle)
                                  setRotatingBed(bed.id)
                                  setIsRotateMode(true)
                                  
                                  // Stop any dragging when rotating
                                  setDraggedBed(null)
                                  setIsDragMode(false)
                                }}
                              >
                                🔄
                              </div>
                            </>
                          )}
                          <div className=""absolute inset-0 bg-green-500/10 dark:bg-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                        </div>
                        
                        {/* Plantvak info onder het vak */}
                        <div className=""mt-1 text-center">
                          <div className=""text-xs text-muted-foreground font-medium">{bed.name}</div>
                          <div className=""text-xs text-muted-foreground">
                            {bed.size || `${(bedWidth / METERS_TO_PIXELS).toFixed(1)}m × ${(bedHeight / METERS_TO_PIXELS).toFixed(1)}m`} • {getFilteredPlants(bed).length} 🌸
                            {selectedMonth && filterMode !== 'all' && getFilteredPlants(bed).length < bed.plants.length && (
                              <span className=""text-orange-600"> ({bed.plants.length} totaal)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Empty State */}
                {plantBeds.length === 0 && (
                  <div className=""absolute inset-0 flex items-center justify-center">
                    <div className=""text-center bg-background/80 p-8 rounded-lg border-2 border-dashed border-border">
                      <Leaf className=""h-20 w-20 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className=""text-xl font-medium text-foreground mb-2">Nog geen plantvakken</h3>
                      <p className=""text-muted-foreground mb-4">Voeg je eerste plantvak toe om te beginnen met tuinieren.</p>
                      <Button 
                        className=""bg-green-600 dark:bg-green-700 hover:bg-green-700"
                        onClick={() => setIsAddingPlantBed(true)}
                      >
                        <Plus className=""h-4 w-4 mr-2" />
                        Eerste Plantvak Maken
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className=""mt-4 text-sm text-muted-foreground flex items-center justify-between">
              <p>💡 <strong>Tip:</strong> Selecteer plantvak → oranje handvat slepen = roteren</p>
              <div className=""flex items-center gap-4">
                <p className=""text-xs">Zoom: {Math.round(scale * 100)}%</p>
                {selectedBed && (
                  <>
                    <Badge variant="secondary" className=""bg-blue-100 dark:bg-blue-900 text-blue-800">
                      {plantBeds.find(b => b.id === selectedBed)?.name} geselecteerd
                      <span className=""ml-2 text-xs">
                        {plantBeds.find(b => b.id === selectedBed)?.rotation || 0}°
                      </span>
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlantBed(selectedBed)}
                      className=""text-red-600 dark:text-red-400 border-red-200 hover:bg-red-50 dark:bg-red-950 hover:border-red-300 dark:border-red-700"
                    >
                      <Trash2 className=""h-3 w-3 mr-1" />
                      Verwijder
                    </Button>
                  </>
                )}
                {hasChanges && (
                  <Badge variant="secondary" className=""bg-orange-100 text-orange-800">
                    Niet opgeslagen wijzigingen
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View of Plant Beds */
        <div>
          {/* Month Filter for List View */}
          <Card className=""mb-4">
            <CardContent className=""pt-4">
              <div className=""flex flex-wrap items-center gap-2">
                <div className=""flex items-center gap-2">
                  <Calendar className=""h-4 w-4 text-muted-foreground" />
                  <span className=""text-sm font-medium">Filter op maand:</span>
                </div>
                
                <Select 
                  value={selectedMonth?.toString() || "none"} 
                  onValueChange={(value) => {
                    setSelectedMonth(value === "none" ? undefined : parseInt(value))
                    if (value === "none") setFilterMode('all')
                    else if (filterMode === 'all') setFilterMode('blooming')
                  }}
                >
                  <SelectTrigger className=""w-32">
                    <SelectValue placeholder="Kies maand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geen filter</SelectItem>
                    <SelectItem value="1">Januari</SelectItem>
                    <SelectItem value="2">Februari</SelectItem>
                    <SelectItem value="3">Maart</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">Mei</SelectItem>
                    <SelectItem value="6">Juni</SelectItem>
                    <SelectItem value="7">Juli</SelectItem>
                    <SelectItem value="8">Augustus</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">Oktober</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedMonth && (
                  <div className=""flex gap-1">
                    <Button
                      size="sm"
                      variant={filterMode === 'sowing' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('sowing')}
                      className=""text-xs"
                    >
                      🌱 Zaaien
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMode === 'blooming' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('blooming')}
                      className=""text-xs"
                    >
                      🌸 Bloeit
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMode === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterMode('all')}
                      className=""text-xs"
                    >
                      Alles
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {plantBeds.length === 0 ? (
            <Card className=""text-center py-8">
              <CardContent>
                <Leaf className=""h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className=""text-lg font-medium text-muted-foreground mb-2">
                  Nog geen plantvakken
                </h3>
                <p className=""text-sm text-muted-foreground mb-4">
                  Voeg je eerste plantvak toe om planten te kunnen planten.
                </p>
                <Button 
                  className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 h-8 px-3 text-sm"
                  onClick={() => setIsAddingPlantBed(true)}
                >
                  <Plus className=""h-4 w-4 mr-2" />
                  Eerste Plantvak
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className=""grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {plantBeds.map((bed) => (
                <Card key={bed.id} className=""border-green-200 dark:border-green-800 hover:border-green-300 dark:border-green-700 dark:hover:border-green-700 hover:shadow-md transition-colors duration-150">
                <CardHeader className=""pb-2 pt-3 px-3">
                  <div className=""flex items-start justify-between">
                    <div className=""flex-1">
                      <CardTitle className=""text-base text-green-800 dark:text-green-200 flex items-center gap-2">
                        {bed.name}
                        {bed.sun_exposure && getSunExposureIcon(bed.sun_exposure)}
                      </CardTitle>
                      <div className=""flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {bed.size && (
                          <div className=""flex items-center gap-1">
                            <Leaf className=""h-3 w-3 text-green-600 dark:text-green-400" />
                            {bed.size}
                          </div>
                        )}
                        <div className=""text-green-700 dark:text-green-300">
                          {bed.plants.length} planten
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className=""bg-green-100 text-green-800 border-green-300 dark:border-green-700 text-xs">
                      {bed.plants.length > 0 ? 'Beplant' : 'Leeg'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className=""pt-0 pb-3 px-3">
                  {bed.description && (
                    <p className=""text-muted-foreground mb-2 text-xs line-clamp-2">{bed.description}</p>
                  )}
                  <div className=""flex gap-2">
                    <Link href={`/gardens/${garden.id}/plantvak-view/${bed.id}`} className=""flex-1">
                      <Button className=""h-7 px-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black text-xs w-full">
                        Beheren
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlantBed(bed.id)}
                      className=""h-7 px-2 text-red-600 dark:text-red-400 border-red-200 hover:bg-red-50 dark:bg-red-950 hover:border-red-300 dark:border-red-700 text-xs"
                    >
                      <Trash2 className=""w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className=""w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className=""flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className=""h-5 w-5" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription>
              Weet je zeker dat je dit plantvak wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          {deletingBedId && (
            <div className=""py-4">
              <div className=""bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-4">
                <div className=""flex items-center gap-2 mb-2">
                  <Leaf className=""h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className=""font-medium text-red-800">
                    {plantBeds.find(bed => bed.id === deletingBedId)?.name}
                  </span>
                </div>
                <div className=""text-sm text-red-700 dark:text-red-300">
                  {plantBeds.find(bed => bed.id === deletingBedId)?.plants.length || 0} planten zullen ook worden verwijderd
                </div>
              </div>
            </div>
          )}
          <div className=""flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuleren
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePlantBed}
              className=""bg-red-600 dark:bg-red-700 hover:bg-red-700"
            >
              <Trash2 className=""h-4 w-4 mr-2" />
              Verwijderen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Garden Dialog */}
      <Dialog open={isEditingGarden} onOpenChange={setIsEditingGarden}>
        <DialogContent className=""w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🏡 Tuin Bewerken</DialogTitle>
          </DialogHeader>
          
          <div className=""space-y-4">
            <div>
              <label htmlFor="garden-name" className=""block text-sm font-medium text-foreground mb-1">
                Tuin Naam
              </label>
              <Input
                id="garden-name"
                value={gardenForm.name}
                onChange={(e) => setGardenForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Bijv. Mijn Achtertuin"
              />
            </div>

            <div className=""grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="garden-length" className=""block text-sm font-medium text-foreground mb-1">
                  Lengte (m)
                </label>
                <Input
                  id="garden-length"
                  type="number"
                  step="0.1"
                  min="1"
                  value={gardenForm.length}
                  onChange={(e) => setGardenForm(prev => ({ ...prev, length: e.target.value }))}
                  placeholder="9.0"
                />
              </div>
              <div>
                <label htmlFor="garden-width" className=""block text-sm font-medium text-foreground mb-1">
                  Breedte (m)
                </label>
                <Input
                  id="garden-width"
                  type="number"
                  step="0.1"
                  min="1"
                  value={gardenForm.width}
                  onChange={(e) => setGardenForm(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="16.0"
                />
              </div>
            </div>

            {gardenForm.length && gardenForm.width && (
              <>
                <div className=""text-sm text-green-600 font-medium">
                  📐 Oppervlakte: {(parseFloat(gardenForm.length) * parseFloat(gardenForm.width)).toFixed(1)} m²
                </div>
                
                {(() => {
                  const validation = validatePlantBedsInGarden(gardenForm.length, gardenForm.width)
                  if (!validation.fits) {
                    return (
                      <div className=""bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-3">
                        <div className=""flex items-center gap-2 text-red-800 font-medium mb-2">
                          <span>⚠️</span>
                          <span>Plantvakken passen niet meer!</span>
                        </div>
                        <div className=""text-sm text-red-700 dark:text-red-300 space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <div key={index}>• {warning}</div>
                          ))}
                        </div>
                        <div className=""text-xs text-red-600 dark:text-red-400 mt-2">
                          💡 Tip: Verplaats de plantvakken eerst of maak de tuin groter
                        </div>
                      </div>
                    )
                  } else if (plantBeds.length > 0) {
                    return (
                      <div className=""bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className=""flex items-center gap-2 text-green-800 font-medium">
                          <span>✅</span>
                          <span>Alle plantvakken passen nog in de tuin</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </>
            )}

            <div>
              <label htmlFor="garden-description" className=""block text-sm font-medium text-foreground mb-1">
                Beschrijving (optioneel)
              </label>
              <Textarea
                id="garden-description"
                value={gardenForm.description}
                onChange={(e) => setGardenForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschrijf je tuin..."
                rows={3}
              />
            </div>
          </div>

          <div className=""flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditingGarden(false)}
            >
              Annuleren
            </Button>
            <Button
              onClick={handleGardenUpdate}
              disabled={!gardenForm.name || !gardenForm.length || !gardenForm.width}
            >
              Opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Plant Bed Dialog */}
      <Dialog open={isAddingPlantBed} onOpenChange={setIsAddingPlantBed}>
        <DialogContent className=""w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🌱 Nieuw Plantvak Toevoegen</DialogTitle>
            <DialogDescription>
              Voeg een nieuw plantvak toe aan je tuin.
            </DialogDescription>
          </DialogHeader>
          
          <div className=""space-y-4">
            <div className=""p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg mb-4">
              <div className=""flex items-center gap-3">
                <div className=""w-12 h-12 bg-green-500 dark:bg-green-600 text-white dark:text-black text-xl font-bold rounded-full flex items-center justify-center">
                  ?
                </div>
                <div>
                  <p className=""text-green-800 font-semibold">
                    Automatische Naamgeving
                  </p>
                  <p className=""text-green-700 text-sm">
                    Dit plantvak krijgt automatisch een letter toegewezen (A, B, C, enz.)
                  </p>
                </div>
              </div>
            </div>

            <div className=""grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="plantvak-length" className=""block text-sm font-medium text-foreground mb-1">
                  Lengte (m) *
                </label>
                <Input
                  id="plantvak-length"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={newPlantBed.length}
                  onChange={(e) => setNewPlantBed(prev => ({ ...prev, length: e.target.value }))}
                  placeholder="2.0"
                />
              </div>
              <div>
                <label htmlFor="plantvak-width" className=""block text-sm font-medium text-foreground mb-1">
                  Breedte (m) *
                </label>
                <Input
                  id="plantvak-width"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={newPlantBed.width}
                  onChange={(e) => setNewPlantBed(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>

            {newPlantBed.length && newPlantBed.width && (
              <div className=""text-sm text-green-600 font-medium">
                📐 Oppervlakte: {(parseFloat(newPlantBed.length) * parseFloat(newPlantBed.width)).toFixed(1)} m²
              </div>
            )}

            <div className=""grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="plantvak-soil" className=""block text-sm font-medium text-foreground mb-1">
                  Bodemtype *
                </label>
                <Select value={newPlantBed.soil_type} onValueChange={(value) => 
                  setNewPlantBed(prev => ({ ...prev, soil_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies bodemtype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="klei">Klei</SelectItem>
                    <SelectItem value="zand">Zand</SelectItem>
                    <SelectItem value="leem">Leem</SelectItem>
                    <SelectItem value="veen">Veen</SelectItem>
                    <SelectItem value="gemengd">Gemengd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="plantvak-sun" className=""block text-sm font-medium text-foreground mb-1">
                  Zonligging *
                </label>
                <Select value={newPlantBed.sun_exposure} onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') => 
                  setNewPlantBed(prev => ({ ...prev, sun_exposure: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies zonligging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-sun">
                      <div className=""flex items-center gap-2">
                        <Sun className=""h-4 w-4 text-yellow-500" />
                        <span>Volle zon</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="partial-sun">
                      <div className=""flex items-center gap-2">
                        <CloudSun className=""h-4 w-4 text-yellow-400" />
                        <span>Halfschaduw</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="shade">
                      <div className=""flex items-center gap-2">
                        <Cloud className=""h-4 w-4 text-muted-foreground" />
                        <span>Schaduw</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="plantvak-description" className=""block text-sm font-medium text-foreground mb-1">
                Beschrijving (optioneel)
              </label>
              <Textarea
                id="plantvak-description"
                value={newPlantBed.description}
                onChange={(e) => setNewPlantBed(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschrijf dit plantvak..."
                rows={3}
              />
            </div>
          </div>

          <div className=""flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingPlantBed(false)
                setNewPlantBed({
                  length: '',
                  width: '',
                  description: '',
                  sun_exposure: 'full-sun',
                  soil_type: 'gemengd'
                })
              }}
            >
              Annuleren
            </Button>
            <Button
              onClick={addPlantBed}
              disabled={!newPlantBed.length || !newPlantBed.width || !newPlantBed.soil_type || !newPlantBed.sun_exposure}
              className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black disabled:bg-gray-400 dark:bg-gray-500 disabled:cursor-not-allowed"
            >
              <Plus className=""h-4 w-4 mr-2" />
              Plantvak Toevoegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  )
}
