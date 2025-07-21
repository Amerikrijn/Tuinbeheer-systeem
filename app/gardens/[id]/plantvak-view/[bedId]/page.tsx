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
  Move,
  Maximize2,
  X,
  Minus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getGarden, getPlantBeds, getPlantsWithPositions, createVisualPlant, updatePlantPosition, deletePlant, updatePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"
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

const GRID_SIZE = 10
const SCALE_MIN = 0.5
const SCALE_MAX = 3
const FLOWER_SIZE = FLOWER_SIZE_MEDIUM // Default to medium size (now 45px)

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

  // Helper function to get flower size in pixels
  const getFlowerSize = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return FLOWER_SIZE_SMALL
      case 'medium': return FLOWER_SIZE_MEDIUM  
      case 'large': return FLOWER_SIZE_LARGE
      default: return FLOWER_SIZE_MEDIUM
    }
  }

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
  const [newFlower, setNewFlower] = useState({
    name: '',
    type: '',
    color: '#FF69B4',
    customEmoji: '',
    description: '',
    status: 'healthy' as 'healthy' | 'needs_attention' | 'blooming' | 'sick',
    size: 'medium' as 'small' | 'medium' | 'large'
  })
  const [isEditingPlantBed, setIsEditingPlantBed] = useState(false)
  const [plantBedForm, setPlantBedForm] = useState({
    name: '',
    length: '',
    width: '',
    description: '',
    sun_exposure: 'full-sun' as 'full-sun' | 'partial-sun' | 'shade',
    soil_type: 'loam' as 'clay' | 'sand' | 'loam' | 'peat'
  })
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate canvas size based on plant bed size using consistent scaling
  const getCanvasSize = () => {
    if (!plantBed?.size) return { width: 600, height: 450 }
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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, SCALE_MAX))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, SCALE_MIN))
  }

  const resetView = () => {
    setScale(1)
  }

  const saveLayout = async () => {
    if (!hasChanges) return

    try {
      // Update all plant positions in the database
      await Promise.all(
        flowerPositions.map(flower => 
          updatePlantPosition(flower.id, {
            position_x: flower.position_x,
            position_y: flower.position_y,
            visual_width: flower.visual_width,
            visual_height: flower.visual_height
          })
        )
      )

      setHasChanges(false)
      toast({
        title: "Layout opgeslagen",
        description: "De bloemen posities zijn succesvol opgeslagen in de database.",
      })
    } catch (error) {
      console.error("Error saving layout:", error)
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de layout.",
        variant: "destructive",
      })
    }
  }

  const addFlower = async () => {
    if (!plantBed || !newFlower.name || (!newFlower.type && !isCustomFlower)) {
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

    try {
      const selectedType = FLOWER_TYPES.find(type => type.name === newFlower.type)

      // Map status to database format
      const dbStatus = newFlower.status === 'sick' ? 'diseased' : 
                      newFlower.status === 'blooming' ? 'healthy' : 
                      newFlower.status

      const flowerSize = getFlowerSize(newFlower.size)
      
      const newPlant = await createVisualPlant({
        plant_bed_id: plantBed.id,
        name: newFlower.name,
        color: newFlower.color,
        status: dbStatus as "healthy" | "needs_attention" | "diseased" | "dead" | "harvested",
        position_x: Math.random() * (canvasWidth - flowerSize),
        position_y: Math.random() * (canvasHeight - flowerSize),
        visual_width: flowerSize,
        visual_height: flowerSize,
        emoji: isCustomFlower ? newFlower.customEmoji : selectedType?.emoji || '🌸',
        is_custom: isCustomFlower,
        category: isCustomFlower ? 'Aangepast' : newFlower.type,
        notes: `${newFlower.description}${newFlower.description ? ' | ' : ''}Size: ${newFlower.size}`
      })

      if (newPlant) {
        setFlowerPositions(prev => [...prev, newPlant])
        setIsAddingFlower(false)
        setIsCustomFlower(false)
        setNewFlower({
          name: '',
          type: '',
          color: '#FF69B4',
          customEmoji: '',
          description: '',
          status: 'healthy',
          size: 'medium'
        })
        
        toast({
          title: "Bloem toegevoegd",
          description: `${newFlower.name} is toegevoegd aan het plantvak.`,
        })
      }
    } catch (error) {
      console.error("Error creating flower:", error)
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het toevoegen van de bloem.",
        variant: "destructive",
      })
    }
  }

  const updateFlower = async () => {
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

    try {
      const selectedType = FLOWER_TYPES.find(type => type.name === newFlower.type)

      // Map status to database format
      const dbStatus = newFlower.status === 'sick' ? 'diseased' : 
                      newFlower.status === 'blooming' ? 'healthy' : 
                      newFlower.status

      const updatedPlant = await updatePlantPosition(selectedFlower.id, {
        name: newFlower.name,
        color: newFlower.color,
        status: dbStatus as "healthy" | "needs_attention" | "diseased" | "dead" | "harvested",
        emoji: isEditCustomFlower ? newFlower.customEmoji : selectedType?.emoji || '🌸',
        is_custom: isEditCustomFlower,
        category: isEditCustomFlower ? 'Aangepast' : newFlower.type,
        notes: newFlower.description
      })

      if (updatedPlant) {
        setFlowerPositions(prev => prev.map(flower => 
          flower.id === selectedFlower.id ? updatedPlant : flower
        ))

        setIsEditingFlower(false)
        setSelectedFlower(null)
        setIsEditCustomFlower(false)
        setNewFlower({
          name: '',
          type: '',
          color: '#FF69B4',
          customEmoji: '',
          description: '',
          status: 'healthy',
          size: 'medium'
        })
        
        toast({
          title: "Bloem gewijzigd",
          description: `${newFlower.name} is succesvol gewijzigd.`,
        })
      }
    } catch (error) {
      console.error("Error updating flower:", error)
      toast({
        title: "Fout bij wijzigen",
        description: "Er is een fout opgetreden bij het wijzigen van de bloem.",
        variant: "destructive",
      })
    }
  }

  const removeFlower = async (flowerId: string) => {
    try {
      await deletePlant(flowerId)
      setFlowerPositions(prev => prev.filter(f => f.id !== flowerId))
      setSelectedFlower(null)
      setIsEditingFlower(false)
      toast({
        title: "Bloem verwijderd",
        description: "De bloem is verwijderd uit het plantvak.",
      })
    } catch (error) {
      console.error("Error deleting flower:", error)
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de bloem.",
        variant: "destructive",
      })
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
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle velden in om het plantvak bij te werken.",
        variant: "destructive",
      })
      return
    }

    try {
      const sizeString = `${plantBedForm.length}m x ${plantBedForm.width}m`
      const length = parseFloat(plantBedForm.length)
      const width = parseFloat(plantBedForm.width)
      
      if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
        toast({
          title: "Ongeldige afmetingen",
          description: "Lengte en breedte moeten geldige getallen zijn groter dan 0.",
          variant: "destructive",
        })
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
        toast({
          title: "Plantvak bijgewerkt",
          description: "De plantvak informatie is succesvol bijgewerkt.",
        })
      } else {
        toast({
          title: "Waarschuwing",
          description: "Het plantvak is mogelijk niet bijgewerkt. Probeer het opnieuw.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating plant bed:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van het plantvak.",
        variant: "destructive",
      })
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

  // Handle single click/tap - select flower and prepare for operations
  const handleFlowerClick = useCallback((e: React.MouseEvent | React.TouchEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    // For touch devices, use the toggle behavior
    if ('touches' in e) {
      if (selectedFlower?.id === flowerId) {
        if (!isDragMode && !isResizeMode) {
          setIsDragMode(true)
          toast({
            title: "🖱️ Verplaatsen actief",
            description: "Sleep de bloem naar een nieuwe positie. Klik opnieuw voor grootte aanpassen.",
          })
        } else if (isDragMode) {
          setIsDragMode(false)
          setIsResizeMode(true)
          toast({
            title: "📏 Grootte aanpassen actief", 
            description: "Sleep de blauwe hoeken om groter te maken. Klik opnieuw om te stoppen.",
          })
        } else {
          setIsDragMode(false)
          setIsResizeMode(false)
          setSelectedFlower(null)
          toast({
            title: "✅ Selectie opgeheven",
            description: "Klik op een bloem om te selecteren.",
          })
        }
      } else {
        setSelectedFlower(flower)
        setIsDragMode(false)
        setIsResizeMode(false)
        resizeModeRef.current = flowerId
        toast({
          title: "🎯 Bloem geselecteerd",
          description: "Klik opnieuw om te verplaatsen of grootte aan te passen.",
        })
      }
    } else {
      // For mouse, just select the flower - dragging happens on mousedown
      setSelectedFlower(flower)
      setIsDragMode(false)
      setIsResizeMode(false)
      resizeModeRef.current = flowerId
    }
  }, [flowerPositions, selectedFlower, isDragMode, isResizeMode, toast])

  // Handle double click - show resize interface
  const handleFlowerDoubleClick = useCallback((flower: PlantWithPosition) => {
    console.log('Double click on flower:', flower.name)
    
    // Get flower position on screen
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const flowerScreenX = containerRect.left + (flower.position_x * scale) + (flower.visual_width * scale) / 2
    const flowerScreenY = containerRect.top + (flower.position_y * scale) + (flower.visual_height * scale) / 2

    setSelectedFlower(flower)
    setShowResizeInterface(true)
    setResizeInterfacePosition({ 
      x: flowerScreenX, 
      y: flowerScreenY 
    })
    setIsDragMode(false)
    setIsResizeMode(false)
    
    toast({
      title: "🔧 Grootte aanpassen",
      description: "Gebruik de + en - knoppen om de bloem groter of kleiner te maken.",
    })
  }, [scale, toast])

  // Handle flower resize via interface
  const handleFlowerResize = useCallback(async (flowerId: string, sizeChange: number) => {
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    const currentSize = Math.min(flower.visual_width, flower.visual_height)
    const newSize = Math.max(FLOWER_SIZE_SMALL, Math.min(FLOWER_SIZE_LARGE * 2, currentSize + sizeChange))
    
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

      toast({
        title: "✅ Grootte aangepast",
        description: `${flower.name} is nu ${newSize}px groot.`,
      })
    } catch (error) {
      console.error('Failed to resize flower:', error)
      toast({
        title: "❌ Fout",
        description: "Kon grootte niet aanpassen. Probeer opnieuw.",
        variant: "destructive",
      })
    }
  }, [flowerPositions, toast])

  // Close resize interface
  const closeResizeInterface = useCallback(() => {
    setShowResizeInterface(false)
    setSelectedFlower(null)
  }, [])

  // Handle pointer down - start dragging immediately for mouse, conditionally for touch
  const handleFlowerPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const { clientX, clientY } = getPointerPosition(e)
    
    // Record touch start time for long press detection
    if ('touches' in e) {
      setTouchStartTime(Date.now())
      // For touch, only start dragging if we're in drag mode and flower is selected
      if (!isDragMode || selectedFlower?.id !== flowerId) {
        return
      }
    }
    
    // Clear any existing selections first if dragging a different flower
    if (draggedFlower && draggedFlower !== flowerId) {
      return // Prevent multiple flowers from being dragged at once
    }
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // For mouse: start dragging immediately if flower is selected
    // For touch: start dragging if in drag mode
    if (selectedFlower?.id === flowerId || !('touches' in e)) {
      // Start dragging
      setDraggedFlower(flowerId)
      setDragOffset({
        x: (clientX - rect.left) / scale - flower.position_x,
        y: (clientY - rect.top) / scale - flower.position_y
      })
      
      // Select the flower if not already selected (for mouse)
      if (!selectedFlower || selectedFlower.id !== flowerId) {
        setSelectedFlower(flower)
        resizeModeRef.current = flowerId
      }
      
      // Show feedback for mouse users
      if (!('touches' in e)) {
        toast({
          title: "🚀 Verplaatsen gestart",
          description: "Sleep naar gewenste positie en laat los.",
        })
      }
    }
  }, [flowerPositions, scale, draggedFlower, selectedFlower, isDragMode, containerRef, toast])

  // Handle long press for mobile (alternative activation)
  const handleFlowerTouchStart = useCallback((e: React.TouchEvent, flowerId: string) => {
    setTouchStartTime(Date.now())
    
    // Set a timer for long press detection
    const timer = setTimeout(() => {
      const flower = flowerPositions.find(f => f.id === flowerId)
      if (!flower) return
      
      // Long press activates selection and drag mode
      setSelectedFlower(flower)
      setIsDragMode(true)
      setIsResizeMode(false)
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      toast({
        title: "🔥 Lang indrukken gedetecteerd",
        description: "Bloem geselecteerd voor verplaatsen. Sleep nu!",
      })
    }, 500) // 500ms for long press

    setLongPressTimer(timer)
  }, [flowerPositions, toast])

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



  // Handle drag move - unified for mouse and touch
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!draggedFlower || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newX = (clientX - rect.left) / scale - dragOffset.x
    const newY = (clientY - rect.top) / scale - dragOffset.y

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

  // Handle drag end
  const handlePointerUp = useCallback(() => {
    if (draggedFlower) {
      toast({
        title: "✅ Bloem verplaatst",
        description: "Vergeet niet op te slaan!",
      })
    }
    setDraggedFlower(null)
    setDragOffset({ x: 0, y: 0 })
  }, [draggedFlower, toast])

  // Legacy mouse up handler
  const onMouseUp = useCallback(() => {
    handlePointerUp()
  }, [handlePointerUp])

  // Handle click outside to deselect - unified for mouse and touch
  const handleCanvasClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedFlower(null)
      setIsDragMode(false)
      setIsResizeMode(false)
      setIsResizing(null)
      resizeModeRef.current = null
      
      toast({
        title: "✅ Selectie opgeheven",
        description: "Klik op een bloem om te selecteren",
      })
    }
  }, [toast])

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
    
    toast({
      title: "🎯 Resize actief!",
      description: "Sleep om het gebied groter te maken - veel meer bloemen komen erbij!",
    })
  }, [flowerPositions, toast])

  // Handle resize move - Create invisible area with more flowers inside!
  const handleResizeMove = useCallback(async (e: MouseEvent) => {
    if (!isResizing || !plantBed) return

    const flower = flowerPositions.find(f => f.id === isResizing)
    if (!flower) return

    const deltaX = e.clientX - resizeStartPos.x
    const deltaY = e.clientY - resizeStartPos.y
    
    // Calculate new AREA size (invisible boundary for flowers)
    const delta = Math.max(deltaX, deltaY)
    let newAreaSize = Math.max(FLOWER_SIZE * 3, resizeStartSize.width + delta) // Start groter voor meer bloemen
    
    // Constrain to canvas bounds
    const maxSize = Math.min(canvasWidth - flower.position_x, canvasHeight - flower.position_y)
    newAreaSize = Math.min(newAreaSize, maxSize)

    // IMPORTANT: Keep the main flower the same size (FLOWER_SIZE)
    // Only update a virtual area size for positioning sub-flowers
    setFlowerPositions(prev => prev.map(f => {
      if (f.id === isResizing) {
        return { ...f, 
          visual_width: FLOWER_SIZE,  // Main flower stays same size!
          visual_height: FLOWER_SIZE,
          // Store area size in a custom property (we'll use notes for this)
          notes: `area_size:${newAreaSize}` 
        }
      }
      return f
    }))

    // Calculate how many flowers should be in this area - VEEL MEER voor leuk effect!
    const areaRatio = (newAreaSize * newAreaSize) / (FLOWER_SIZE * FLOWER_SIZE) // Area ratio
    const targetExtraFlowers = Math.max(0, Math.floor(areaRatio * 0.8)) // Veel meer bloemen!
    const maxExtraFlowers = 50 // Verhoogd voor leuk effect
    const actualTargetFlowers = Math.min(targetExtraFlowers, maxExtraFlowers)

    // Get current extra flowers in this area
    const currentExtraFlowers = flowerPositions.filter(f => 
      f.id !== isResizing && 
      f.name === flower.name &&
      Math.abs(f.position_x - flower.position_x) < newAreaSize &&
      Math.abs(f.position_y - flower.position_y) < newAreaSize
    )

    const currentCount = currentExtraFlowers.length

    if (actualTargetFlowers > currentCount) {
      // ADD MORE FLOWERS within the invisible area - MEER voor leuk effect!
      const flowersToAdd = Math.min(8, actualTargetFlowers - currentCount) // Meer bloemen per keer!
      const newFlowers: PlantWithPosition[] = []

      for (let i = 0; i < flowersToAdd; i++) {
        // Position flowers randomly within the area
        const angle = Math.random() * 2 * Math.PI
        const radius = Math.random() * (newAreaSize / 2 - 30) // Keep some margin
        const centerX = flower.position_x + FLOWER_SIZE / 2
        const centerY = flower.position_y + FLOWER_SIZE / 2
        
        const x = centerX + Math.cos(angle) * radius - 20
        const y = centerY + Math.sin(angle) * radius - 20
        
        // Keep within the area and canvas bounds
        const constrainedX = Math.max(
          Math.max(10, flower.position_x - newAreaSize/2 + 30), 
          Math.min(x, Math.min(canvasWidth - 50, flower.position_x + newAreaSize/2 - 30))
        )
        const constrainedY = Math.max(
          Math.max(10, flower.position_y - newAreaSize/2 + 30), 
          Math.min(y, Math.min(canvasHeight - 50, flower.position_y + newAreaSize/2 - 30))
        )
        
        try {
          const newFlower = await createVisualPlant({
            plant_bed_id: plantBed.id,
            name: flower.name,
            color: flower.color || '#FF69B4',
            status: flower.status || 'healthy',
            position_x: constrainedX,
            position_y: constrainedY,
            visual_width: FLOWER_SIZE, // Same size as main flower!
            visual_height: FLOWER_SIZE,
            emoji: flower.emoji || '🌸',
            is_custom: flower.is_custom,
            category: flower.category,
            notes: `sub_flower_of:${flower.id}`
          })
          
          if (newFlower) newFlowers.push(newFlower)
        } catch (error) {
          console.error("Error creating sub-flower:", error)
        }
      }

      if (newFlowers.length > 0) {
        setFlowerPositions(prev => [...prev, ...newFlowers])
      }

    } else if (actualTargetFlowers < currentCount) {
      // REMOVE EXCESS FLOWERS
      const flowersToRemove = Math.min(5, currentCount - actualTargetFlowers) // Remove meer per keer
      const flowersToDelete = currentExtraFlowers.slice(0, flowersToRemove)

      for (const flowerToDelete of flowersToDelete) {
        try {
          await deletePlant(flowerToDelete.id)
        } catch (error) {
          console.error("Error deleting sub-flower:", error)
        }
      }

      setFlowerPositions(prev => prev.filter(f => 
        !flowersToDelete.some(fd => fd.id === f.id)
      ))
    }
    
    setHasChanges(true)
  }, [isResizing, resizeStartSize, resizeStartPos, canvasWidth, canvasHeight, flowerPositions, plantBed])

  // Handle resize end - just save the main flower size
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

        // Count extra flowers for feedback
        const extraFlowers = flowerPositions.filter(f => 
          f.id !== currentResizingId && 
          f.name === currentFlower.name &&
          Math.abs(f.position_x - currentFlower.position_x) < currentFlower.visual_width * 1.5 &&
          Math.abs(f.position_y - currentFlower.position_y) < currentFlower.visual_height * 1.5
        )

        if (extraFlowers.length > 0) {
          toast({
            title: "🌸 Bloem aangepast!",
            description: `Grootte gewijzigd! Nu ${extraFlowers.length} extra bloemen.`,
          })
        }
      }
    } catch (error) {
      console.error("Error saving flower size:", error)
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de grootte.",
        variant: "destructive",
      })
    }
  }, [isResizing, flowerPositions, toast])

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
      
      document.addEventListener('mousemove', handleResizeMove as any)
      document.addEventListener('mouseup', handleResizeEnd as any)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove as any)
        document.removeEventListener('mouseup', handleResizeEnd as any)
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
              🚨 <strong>LAATSTE KANS:</strong> 1) Klik bloem → 2) Sleep GELE hoek → MEER BLOEMEN komen erbij (niet 1 grote bloem!)
              <span className="ml-2 text-sm font-medium text-pink-600">
                • {plantBed.size || 'Op schaal'} • 🌸 MEER BLOEMEN + NAAM ZICHTBAAR
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
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nieuwe Bloem Toevoegen</DialogTitle>
                <DialogDescription>
                  Voeg een nieuwe bloem toe aan dit plantvak. Je kunt het later verplaatsen door te slepen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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
                  <label className="text-sm font-medium">Grootte</label>
                  <Select value={newFlower.size} onValueChange={(value: 'small' | 'medium' | 'large') => 
                    setNewFlower(prev => ({ ...prev, size: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span>Klein ({FLOWER_SIZE_SMALL}px)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span>Midden ({FLOWER_SIZE_MEDIUM}px)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="large">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                          <span>Groot ({FLOWER_SIZE_LARGE}px)</span>
                        </div>
                      </SelectItem>
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
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bloem Bewerken</DialogTitle>
                <DialogDescription>
                  Wijzig de eigenschappen van deze bloem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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

      {/* Plant Bed Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Plantvak Informatie
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingPlantBed(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Bewerken
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Naam</h4>
              <p className="text-lg font-semibold">{plantBed?.name || 'Onbekend'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Lengte</h4>
              <p className="text-lg font-semibold">
                {plantBed?.size ? parseDimensions(plantBed.size).length + 'm' : 'Niet opgegeven'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Breedte</h4>
              <p className="text-lg font-semibold">
                {plantBed?.size ? parseDimensions(plantBed.size).width + 'm' : 'Niet opgegeven'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Zonligging</h4>
              <div className="flex items-center gap-2">
                {getSunExposureIcon(plantBed?.sun_exposure || 'full-sun')}
                <span className="text-lg font-semibold">
                  {plantBed?.sun_exposure === 'full-sun' ? 'Volle zon' :
                   plantBed?.sun_exposure === 'partial-sun' ? 'Gedeeltelijke zon' :
                   plantBed?.sun_exposure === 'shade' ? 'Schaduw' : 'Volle zon'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Bloemen</h4>
              <p className="text-lg font-semibold">{flowerPositions.length}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Grondsoort</h4>
              <p className="text-lg font-semibold">
                {plantBed?.soil_type === 'clay' ? 'Klei' :
                 plantBed?.soil_type === 'sand' ? 'Zand' :
                 plantBed?.soil_type === 'loam' ? 'Leem' :
                 plantBed?.soil_type === 'peat' ? 'Veen' : 'Niet opgegeven'}
              </p>
            </div>
          </div>

          {plantBed?.description && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-1">Beschrijving</h4>
              <p className="text-gray-600">{plantBed.description}</p>
            </div>
          )}
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
                onChange={(e) => setPlantBedForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Bijv. Rozen bed"
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
              <Button variant="outline" onClick={() => setIsEditingPlantBed(false)} className="flex-1">
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
              Bloemen Layout - {plantBed?.size || 'Op schaal'} (Schaal: 1m = {METERS_TO_PIXELS}px)
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
                      toast({
                        title: "📏 Grootte aanpassen actief",
                        description: "Sleep de blauwe hoeken om groter te maken.",
                      })
                    } else {
                      toast({
                        title: "Grootte aanpassen gestopt",
                        description: "Bloem grootte staat nu vast.",
                      })
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
                    setSelectedFlower(null)
                    setIsDragMode(false)
                    setIsResizeMode(false)
                    toast({
                      title: "✅ Selectie opgeheven",
                      description: "Klik op een bloem om te selecteren.",
                    })
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
          
          {/* Desktop help text */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg hidden md:block">
            <h4 className="font-medium text-green-900 mb-1">💻 Laptop bediening:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>Vasthouden en slepen:</strong> Direct verplaatsen</li>
              <li>• <strong>Klik:</strong> Bloem selecteren</li>
              <li>• <strong>Dubbel klik:</strong> Grootte aanpassen (+ / - knoppen)</li>
              <li>• <strong>Knoppen:</strong> Voor verplaats/resize modus</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-green-300">
              <p className="text-xs text-green-700">
                🌱 <strong>Plantvak:</strong> {plantBed?.size || 'Onbekend'} • 
                <strong>Schaal:</strong> 1m = {METERS_TO_PIXELS} pixels
              </p>
            </div>
          </div>
          
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

              {/* Flowers */}
              {flowerPositions.map((flower) => {
                const isSelected = selectedFlower?.id === flower.id
                const isDragging = draggedFlower === flower.id
                const isBeingResized = isResizing === flower.id

                return (
                  <div
                    key={flower.id}
                    className={`absolute rounded-full border-4 ${getStatusColor(flower.status || 'healthy')} ${
                      isDragging ? "shadow-2xl ring-4 ring-pink-500 z-10 scale-105 cursor-grabbing" : 
                      isSelected && isDragMode ? "ring-4 ring-green-500 shadow-xl cursor-grab animate-pulse" :
                      isSelected && isResizeMode ? "ring-4 ring-blue-500 shadow-xl cursor-default" :
                      isSelected ? "ring-4 ring-blue-500 shadow-xl cursor-pointer" :
                      "shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                    } transition-all duration-200 flex items-center justify-center text-white relative overflow-hidden`}
                    style={{
                      left: flower.position_x,
                      top: flower.position_y,
                      width: flower.visual_width,
                      height: flower.visual_height,
                      backgroundColor: flower.color,
                    }}
                    onClick={(e) => handleFlowerClick(e, flower.id)}
                    onDoubleClick={() => handleFlowerDoubleClick(flower)}
                    onMouseDown={(e) => handleFlowerPointerDown(e, flower.id)}
                    onTouchStart={(e) => handleFlowerTouchStart(e, flower.id)}
                    onTouchEnd={(e) => handleFlowerTouchEnd(e, flower.id)}
                    title={
                      isDragging ? "Sleep naar gewenste positie" :
                      isSelected && isDragMode ? "Sleep me naar een nieuwe positie!" :
                      isSelected && isResizeMode ? "Sleep de blauwe hoeken om groter te maken" :
                      isSelected ? "Klik opnieuw om te verplaatsen of grootte aan te passen" :
                      "Klik om te selecteren"
                    }
                  >
                    <div className="text-center w-full h-full flex flex-col items-center justify-center">
                      <div 
                        className="flex items-center justify-center"
                        style={{ 
                          fontSize: Math.max(12, Math.min(48, flower.visual_width * 0.4)) + 'px'
                        }}
                      >
                        {flower.emoji || '🌸'}
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
                                       status: 'healthy',
                                       position_x: Math.max(10, Math.min(x, canvasWidth - 50)),
                                       position_y: Math.max(10, Math.min(y, canvasHeight - 50)),
                                       visual_width: FLOWER_SIZE,
                                       visual_height: FLOWER_SIZE,
                                       emoji: flower.emoji || '🌸',
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
        </CardContent>
      </Card>



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
              disabled={selectedFlower.visual_width >= FLOWER_SIZE_LARGE * 2}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-1 text-center">
            Dubbelklik = grootte aanpassen
          </div>
        </div>
      )}
    </div>
  )
}