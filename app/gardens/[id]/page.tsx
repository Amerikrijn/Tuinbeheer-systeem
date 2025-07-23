"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
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
} from "lucide-react"
import { getGarden, getPlantBeds, createPlantBed, updatePlantBed, deletePlantBed } from "@/lib/database"
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
import { FlowerVisualization } from "@/components/flower-visualization"

interface PlantBedPosition {
  id: string
  position_x: number
  position_y: number
  visual_width: number
  visual_height: number
}

export default function GardenDetailPage() {
  const router = useRouter()
  const params = useParams()
  // toast removed - no more notifications
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [showVisualView, setShowVisualView] = useState(true)
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
    name: '',
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
      console.error('Failed to update garden:', error)
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
      'bg-green-100 border-green-300',
      'bg-blue-100 border-blue-300',
      'bg-purple-100 border-purple-300',
      'bg-yellow-100 border-yellow-300',
      'bg-pink-100 border-pink-300',
      'bg-indigo-100 border-indigo-300',
    ]
    return colors[index % colors.length]
  }

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
    
    router.push(`/gardens/${garden?.id}/plantvak-view/${bedId}`)
  }, [router, garden])

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

  // Create sample flowers for a new plant bed
  const createSampleFlowers = useCallback(async (plantBedId: string, length: number, width: number): Promise<Plant[]> => {
    try {
      // Determine number of sample flowers based on size
      const area = length * width
      let flowerCount = 1
      if (area > 4) flowerCount = 2
      if (area > 8) flowerCount = 3
      if (area > 15) flowerCount = 4
      
      const sampleFlowerTypes = [
        { name: 'Roos', color: '#FF69B4', emoji: '🌹' },
        { name: 'Tulp', color: '#FF4500', emoji: '🌷' },
        { name: 'Zonnebloem', color: '#FFD700', emoji: '🌻' },
        { name: 'Lavendel', color: '#9370DB', emoji: '🪻' },
      ]
      
      const createdFlowers: Plant[] = []
      
      for (let i = 0; i < flowerCount; i++) {
        const flowerType = sampleFlowerTypes[i % sampleFlowerTypes.length]
        
        // Create a sample flower (this would normally use createVisualPlant)
        // For now, we'll create a mock flower object
        const mockFlower: Plant = {
          id: `sample-${plantBedId}-${i}`,
          plant_bed_id: plantBedId,
          name: flowerType.name,
          color: flowerType.color,
          emoji: flowerType.emoji,
          status: 'healthy' as const,
          position_x: 0, // Will be positioned by FlowerVisualization
          position_y: 0,
          visual_width: 24,
          visual_height: 24,
          is_custom: false,
          category: flowerType.name,
          notes: 'Sample flower',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        createdFlowers.push(mockFlower)
      }
      
      return createdFlowers
    } catch (error) {
      console.error("Error creating sample flowers:", error)
      return []
    }
  }, [])

  // Check if plant bed needs more flowers and add them
  const checkAndAddMoreFlowers = useCallback(async (bed: PlantBedWithPlants) => {
    try {
      if (!bed.size) {
        console.log(`⚠️ Bed ${bed.name} has no size, skipping flower check`)
        return
      }
      
      const dimensions = parsePlantBedDimensions(bed.size)
      if (!dimensions) {
        console.log(`⚠️ Could not parse dimensions for bed ${bed.name}: ${bed.size}`)
        return
      }
      
      const area = dimensions.lengthMeters * dimensions.widthMeters
      const currentFlowerCount = bed.plants.length
      
      // Calculate desired flower count based on area (more generous)
      let desiredFlowerCount = Math.max(1, Math.floor(area / 2)) // 1 flower per 2m²
      if (area > 2) desiredFlowerCount = Math.max(2, Math.floor(area / 1.5))
      if (area > 6) desiredFlowerCount = Math.max(3, Math.floor(area / 1.2))
      if (area > 12) desiredFlowerCount = Math.max(4, Math.floor(area))
      
      console.log(`🌸 Bed ${bed.name}: ${area.toFixed(1)}m² → wants ${desiredFlowerCount} flowers, has ${currentFlowerCount}`)
      
      // Add more flowers if needed
      if (desiredFlowerCount > currentFlowerCount) {
        const flowersToAdd = desiredFlowerCount - currentFlowerCount
        const newFlowers = await createSampleFlowers(bed.id, dimensions.lengthMeters, dimensions.widthMeters)
        
        // Take only the additional flowers we need
        const additionalFlowers = newFlowers.slice(0, flowersToAdd).map((flower, index) => ({
          ...flower,
          id: `auto-${bed.id}-${currentFlowerCount + index}-${Date.now()}`,
          name: `${flower.name} ${currentFlowerCount + index + 1}` // Make names unique
        }))
        
        if (additionalFlowers.length > 0) {
          // Update the plant bed with new flowers
          setPlantBeds(prev => prev.map(plantBed => {
            if (plantBed.id === bed.id) {
              return {
                ...plantBed,
                plants: [...plantBed.plants, ...additionalFlowers]
              }
            }
            return plantBed
          }))
          
          console.log(`✅ Added ${additionalFlowers.length} flowers to ${bed.name}`)
          
        // Removed toast notification
        }
      }
    } catch (error) {
      console.error("Error adding more flowers:", error)
    }
  }, [toast, createSampleFlowers])

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
          console.error("Error auto-saving plant bed position:", error)
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
          console.log(`🌱 Auto-checking empty bed: ${bed.name}`)
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
      console.error("Error updating rotation:", error)
        // Removed toast notification
    }
  }

  // Add new plant bed
  const addPlantBed = async () => {
    console.log("🔍 Adding plant bed:", { garden: garden?.id, newPlantBed })
    
    if (!garden || !newPlantBed.name || !newPlantBed.length || !newPlantBed.width) {
      console.log("❌ Validation failed:", { 
        garden: !!garden, 
        gardenId: garden?.id,
        name: newPlantBed.name, 
        length: newPlantBed.length, 
        width: newPlantBed.width 
      })
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
      
      console.log("📝 Creating plant bed with data:", {
        garden_id: garden.id,
        name: newPlantBed.name,
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
        name: newPlantBed.name,
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
          // Create sample flowers for the new plant bed
          const sampleFlowers = await createSampleFlowers(plantBed.id, length, width)
          
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
            plants: sampleFlowers
          }
          setPlantBeds(prev => [...prev, bedWithPlants])
          setIsAddingPlantBed(false)
          setNewPlantBed({
            name: '',
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
      console.error("Error creating plant bed:", error)
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
      console.error("Error deleting plant bed:", error)
        // Removed toast notification
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
            onClick={() => router.push("/gardens")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TreePine className="h-8 w-8 text-green-600" />
              {garden.name}
            </h1>
            {(garden.total_area || (garden.length && garden.width)) && (
              <p className="text-gray-600">
                <span className="text-sm font-medium text-green-600">
                  • Afmetingen: {garden.length}m × {garden.width}m • Oppervlakte: {garden.total_area || 
                    (garden.length && garden.width && 
                      `${(parseFloat(garden.length) * parseFloat(garden.width)).toFixed(1)} m²`
                    )
                  }
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingGarden(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Tuin Bewerken
          </Button>
          
          <Button
            variant={showVisualView ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVisualView(!showVisualView)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            {showVisualView ? "Lijst Weergave" : "Visuele Weergave"}
          </Button>
          
          <Dialog open={isAddingPlantBed} onOpenChange={(open) => {
            if (open) {
              // Reset form when dialog opens
              setNewPlantBed({
                name: '',
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
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Plantvak Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nieuw Plantvak Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuw plantvak toe aan je tuin. Geef de afmetingen in meters op voor een schaalgetrouwe weergave.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Naam *
                  </label>
                  <Input
                    id="name"
                    value={newPlantBed.name}
                    onChange={(e) => setNewPlantBed(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijvoorbeeld: Voorste border"
                  />
                </div>
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

      {showVisualView ? (
        /* Visual Garden Layout */
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-blue-600" />
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile help text */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg md:hidden">
              <h4 className="font-medium text-blue-900 mb-1">📱 Plantvak beheren:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Sleep:</strong> Verplaats plantvak direct</li>
                <li>• <strong>Dubbel tikken:</strong> Plantvak openen</li>
                <li>• <strong>🟠 Rotatie handvat:</strong> Sleep om te roteren</li>
              </ul>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <p className="text-xs text-blue-700">
                  🏡 <strong>Tuin:</strong> {widthMeters.toFixed(1)}m × {heightMeters.toFixed(1)}m
                </p>
              </div>
            </div>
            
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
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
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
                  const isDragging = draggedBed === bed.id
                  const isRotating = rotatingBed === bed.id
                  
                  // Always recalculate dimensions from size to ensure correct scaling
                  let bedWidth = metersToPixels(2) // Default 2x2 meters
                  let bedHeight = metersToPixels(2)
                  
                  if (bed.size) {
                    const dims = getDimensionsFromSize(bed.size)
                    bedWidth = dims.width
                    bedHeight = dims.height
                    
                    console.log(`🎯 RENDERING ${bed.name}: ${bed.size} -> ${bedWidth}px x ${bedHeight}px (stored: ${bed.visual_width}x${bed.visual_height})`)
                  } else {
                    console.log("⚠️ Plantvak zonder size:", bed.name, "using default 2x2m")
                  }

                  return (
                    <div
                      key={bed.id}
                      className={`absolute border-2 rounded-lg transition-all duration-200 group ${
                        isDragging ? 'shadow-2xl scale-105 border-green-500 z-50 cursor-grabbing ring-2 ring-green-300' : 
                        isRotating ? 'shadow-2xl border-orange-500 z-50 ring-4 ring-orange-200' :
                        isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 cursor-grab' :
                        'cursor-grab hover:shadow-lg hover:scale-102 hover:border-green-400 hover:ring-1 hover:ring-green-200'
                      }`}
                      style={{
                        left: bed.position_x || 100,
                        top: bed.position_y || 100,
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
                      <div className={`w-full h-full rounded-lg ${getPlantBedColor(bed.id)} flex flex-col justify-between p-2 group-hover:bg-green-50 transition-colors relative ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}>
                        {/* Top corner elements */}
                        <div className="flex items-start justify-between">
                          {bed.sun_exposure && (
                            <div className="bg-white/90 p-1 rounded shadow-sm">
                              {getSunExposureIcon(bed.sun_exposure)}
                            </div>
                          )}
                          {isDragging && (
                            <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded shadow-sm animate-bounce">
                              🖱️ Verplaatsen
                            </div>
                          )}
                          {isRotating && (
                            <div className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded shadow-sm animate-pulse">
                              🔄 Roteren
                            </div>
                          )}
                        </div>

                        {/* Main area for plants/flowers - this space is left for the flowers */}
                        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                          {/* Flower Visualization System */}
                          <FlowerVisualization 
                            plantBed={bed}
                            plants={bed.plants}
                            containerWidth={bedWidth}
                            containerHeight={bedHeight}
                          />
                          {bed.plants.length === 0 && (
                            <div className="text-gray-400 text-xs">Geen planten</div>
                          )}
                        </div>

                        {/* Bottom info bar */}
                        <div className="bg-white/95 rounded-lg p-2 shadow-sm border space-y-1">
                          {/* Plant bed name */}
                          <div className="text-sm font-bold text-gray-800 truncate">
                            {bed.name}
                          </div>
                          
                          {/* Dimensions and plant count */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">
                              {bed.size || `${(bedWidth / METERS_TO_PIXELS).toFixed(1)}m × ${(bedHeight / METERS_TO_PIXELS).toFixed(1)}m`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1">
                              <span>{bed.plants.length}</span>
                              <span>🌸</span>
                            </span>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <>
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                              Geselecteerd
                            </div>
                            {/* Rotation handle - improved */}
                            <div
                              className="absolute -top-2 -left-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center cursor-grab text-sm font-bold shadow-xl border-2 border-white z-20"
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
                        <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
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
              <p>💡 <strong>Tip:</strong> Selecteer plantvak → oranje handvat slepen = roteren</p>
              <div className="flex items-center gap-4">
                <p className="text-xs">Zoom: {Math.round(scale * 100)}%</p>
                {selectedBed && (
                  <>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {plantBeds.find(b => b.id === selectedBed)?.name} geselecteerd
                      <span className="ml-2 text-xs">
                        {plantBeds.find(b => b.id === selectedBed)?.rotation || 0}°
                      </span>
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
                {hasChanges && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Niet opgeslagen wijzigingen
                  </Badge>
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

      {/* Edit Garden Dialog */}
      <Dialog open={isEditingGarden} onOpenChange={setIsEditingGarden}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🏡 Tuin Bewerken</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="garden-name" className="block text-sm font-medium text-gray-700 mb-1">
                Tuin Naam
              </label>
              <Input
                id="garden-name"
                value={gardenForm.name}
                onChange={(e) => setGardenForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Bijv. Mijn Achtertuin"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="garden-length" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="garden-width" className="block text-sm font-medium text-gray-700 mb-1">
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
                <div className="text-sm text-green-600 font-medium">
                  📐 Oppervlakte: {(parseFloat(gardenForm.length) * parseFloat(gardenForm.width)).toFixed(1)} m²
                </div>
                
                {(() => {
                  const validation = validatePlantBedsInGarden(gardenForm.length, gardenForm.width)
                  if (!validation.fits) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                          <span>⚠️</span>
                          <span>Plantvakken passen niet meer!</span>
                        </div>
                        <div className="text-sm text-red-700 space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <div key={index}>• {warning}</div>
                          ))}
                        </div>
                        <div className="text-xs text-red-600 mt-2">
                          💡 Tip: Verplaats de plantvakken eerst of maak de tuin groter
                        </div>
                      </div>
                    )
                  } else if (plantBeds.length > 0) {
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-800 font-medium">
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
              <label htmlFor="garden-description" className="block text-sm font-medium text-gray-700 mb-1">
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

          <div className="flex justify-end space-x-2 mt-6">
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
    </div>
  )
}
