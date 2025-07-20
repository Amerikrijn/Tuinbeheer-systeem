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
import { getGarden, getPlantBeds, getPlantsWithPositions, createVisualPlant, updatePlantPosition, deletePlant, updatePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"

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
  const [draggedFlower, setDraggedFlower] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeMode, setResizeMode] = useState<'uniform' | 'width' | 'height'>('uniform')
  const [duplicatePositions, setDuplicatePositions] = useState<{x: number, y: number}[]>([])
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

      const newPlant = await createVisualPlant({
        plant_bed_id: plantBed.id,
        name: newFlower.name,
        color: newFlower.color,
        status: dbStatus as "healthy" | "needs_attention" | "diseased" | "dead" | "harvested",
        position_x: Math.random() * (canvasWidth - FLOWER_SIZE),
        position_y: Math.random() * (canvasHeight - FLOWER_SIZE),
        visual_width: FLOWER_SIZE,
        visual_height: FLOWER_SIZE,
        emoji: isCustomFlower ? newFlower.customEmoji : selectedType?.emoji || '🌸',
        is_custom: isCustomFlower,
        category: isCustomFlower ? 'Aangepast' : newFlower.type,
        notes: newFlower.description
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
          status: 'healthy'
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
          status: 'healthy'
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
    if (!plantBed || !plantBedForm.name || !plantBedForm.length || !plantBedForm.width) {
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
      const visualWidth = length * 50 // 1m = 50px
      const visualHeight = width * 50

      const updatedBed = await updatePlantBed(plantBed.id, {
        name: plantBedForm.name,
        size: sizeString,
        description: plantBedForm.description,
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

  // Handle single click - select flower
  const handleFlowerClick = useCallback((e: React.MouseEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // If currently resizing, stop it
    if (isResizing) {
      setIsResizing(null)
      setResizeStartSize({ width: 0, height: 0 })
      setResizeStartPos({ x: 0, y: 0 })
      setResizeMode('uniform')
      setDuplicatePositions([])
      return
    }
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    // Select this flower
    setSelectedFlower(flower)
  }, [flowerPositions, isResizing])

  // Handle mouse down - start dragging immediately
  const handleFlowerMouseDown = useCallback((e: React.MouseEvent, flowerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Clear any existing selections first
    if (draggedFlower && draggedFlower !== flowerId) {
      return // Prevent multiple flowers from being dragged at once
    }
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Select the flower
    setSelectedFlower(flower)
    
    // Start dragging this specific flower
    setDraggedFlower(flowerId)
    setDragOffset({
      x: (e.clientX - rect.left) / scale - flower.position_x,
      y: (e.clientY - rect.top) / scale - flower.position_y
    })
  }, [flowerPositions, scale, draggedFlower])

  // Handle double click - open edit dialog
  const handleFlowerDoubleClick = useCallback((flower: PlantWithPosition) => {
    setSelectedFlower(flower)
    setIsEditCustomFlower(flower.is_custom || false)
    setNewFlower({
      name: flower.name,
      type: flower.category || '',
      color: flower.color || '#FF69B4',
      customEmoji: flower.emoji || '',
      description: flower.notes || '',
      status: flower.status === 'needs_attention' ? 'needs_attention' : 
             flower.status === 'diseased' ? 'sick' : 
             flower.status === 'dead' ? 'sick' : 'healthy'
    })
    setIsEditingFlower(true)
  }, [])

  // Handle drag move
  const onMouseMove = useCallback((e: React.MouseEvent) => {
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
  const onMouseUp = useCallback(() => {
    if (draggedFlower) {
      console.log('Ending drag for:', draggedFlower)
    }
    setDraggedFlower(null)
    setDragOffset({ x: 0, y: 0 })
  }, [draggedFlower])

  // Handle click outside to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedFlower(null)
    }
  }, [])

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, flowerId: string, mode: 'uniform' | 'width' | 'height' = 'uniform') => {
    e.preventDefault()
    e.stopPropagation()
    
    const flower = flowerPositions.find(f => f.id === flowerId)
    if (!flower) return

    // Clear any existing resize state first
    setIsResizing(null)
    setDraggedFlower(null) // Ensure no drag conflicts
    
    // Set resize state
    setIsResizing(flowerId)
    setResizeMode(mode)
    setResizeStartSize({ 
      width: flower.visual_width, 
      height: flower.visual_height 
    })
    setResizeStartPos({ x: e.clientX, y: e.clientY })
    setDuplicatePositions([]) // Reset duplicate positions
  }, [flowerPositions])

  // Handle resize move - with real-time duplication and dynamic shapes
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    // Use a functional update to avoid dependency on flowerPositions
    setFlowerPositions(prev => {
      const flower = prev.find(f => f.id === isResizing)
      if (!flower) return prev

      const deltaX = e.clientX - resizeStartPos.x
      const deltaY = e.clientY - resizeStartPos.y
      
      let newWidth = resizeStartSize.width
      let newHeight = resizeStartSize.height

      // Calculate new dimensions based on resize mode with boundary constraints
      if (resizeMode === 'uniform') {
        // For uniform scaling, use the smaller delta to prevent going out of bounds
        const maxDeltaX = (canvasWidth - flower.position_x) - resizeStartSize.width
        const maxDeltaY = (canvasHeight - flower.position_y) - resizeStartSize.height
        const delta = Math.min(Math.max(deltaX, deltaY), Math.min(maxDeltaX, maxDeltaY))
        
        newWidth = Math.max(20, resizeStartSize.width + delta)
        newHeight = Math.max(20, resizeStartSize.height + delta)
      } else if (resizeMode === 'width') {
        const maxDelta = (canvasWidth - flower.position_x) - resizeStartSize.width
        newWidth = Math.max(20, Math.min(resizeStartSize.width + deltaX, resizeStartSize.width + maxDelta))
      } else if (resizeMode === 'height') {
        const maxDelta = (canvasHeight - flower.position_y) - resizeStartSize.height
        newHeight = Math.max(20, Math.min(resizeStartSize.height + deltaY, resizeStartSize.height + maxDelta))
      }

      // VERBETERDE DUPLICATIE - BLOEMEN BINNEN HET GROTE VLAK
      const newDuplicatePositions: {x: number, y: number}[] = []
      
      // Bereken hoeveel bloemen er moeten komen op basis van grootte
      const currentSize = Math.max(newWidth, newHeight)
      const originalSize = Math.max(resizeStartSize.width, resizeStartSize.height)
      
      // Al bij kleine vergroting bloemen toevoegen (nog lagere threshold)
      if (currentSize > originalSize + 20) { // Slechts 20px groei = al bloemen!
        
        // Veel meer bloemen - gebaseerd op oppervlakte
        const currentArea = newWidth * newHeight
        const originalArea = resizeStartSize.width * resizeStartSize.height
        const areaRatio = currentArea / originalArea
        
        // Veel meer bloemen mogelijk (max 15 in plaats van 6)
        let flowerCount = Math.floor(Math.sqrt(areaRatio * 4)) // Meer bloemen door *4
        flowerCount = Math.min(flowerCount, 15) // Max 15 bloemen totaal
        
        // Maak bloemen BINNEN het grote vlak
        for (let i = 1; i < flowerCount; i++) {
          let x, y
          
          // Verschillende patronen afhankelijk van vorm
          if (newWidth > newHeight * 1.5) {
            // Breed vlak - horizontale rijen
            const cols = Math.ceil(Math.sqrt(flowerCount))
            const rows = Math.ceil(flowerCount / cols)
            const col = i % cols
            const row = Math.floor(i / cols)
            
            x = flower.position_x + (col * (newWidth / cols)) + (newWidth / cols) * 0.1
            y = flower.position_y + (row * (newHeight / rows)) + (newHeight / rows) * 0.1
            
          } else if (newHeight > newWidth * 1.5) {
            // Hoog vlak - verticale kolommen
            const rows = Math.ceil(Math.sqrt(flowerCount))
            const cols = Math.ceil(flowerCount / rows)
            const row = i % rows
            const col = Math.floor(i / rows)
            
            x = flower.position_x + (col * (newWidth / cols)) + (newWidth / cols) * 0.1
            y = flower.position_y + (row * (newHeight / rows)) + (newHeight / rows) * 0.1
            
          } else {
            // Vierkant vlak - grid patroon
            const cols = Math.ceil(Math.sqrt(flowerCount))
            const rows = Math.ceil(flowerCount / cols)
            const col = i % cols
            const row = Math.floor(i / cols)
            
            x = flower.position_x + (col * (newWidth / cols)) + (newWidth / cols) * 0.1
            y = flower.position_y + (row * (newHeight / rows)) + (newHeight / rows) * 0.1
          }
          
          // Kleine random jitter voor natuurlijk effect
          x += (Math.random() - 0.5) * 20
          y += (Math.random() - 0.5) * 20
          
          // Zorg dat bloemen BINNEN het grote vlak blijven
          x = Math.max(flower.position_x + 5, Math.min(x, flower.position_x + newWidth - 35))
          y = Math.max(flower.position_y + 5, Math.min(y, flower.position_y + newHeight - 35))
          
          // En ook binnen canvas grenzen
          x = Math.max(10, Math.min(x, canvasWidth - 40))
          y = Math.max(10, Math.min(y, canvasHeight - 40))
          
          newDuplicatePositions.push({ x, y })
        }
      }

      setDuplicatePositions(newDuplicatePositions)

      // Update ONLY the flower being resized, keep all others exactly the same
      return prev.map(f => {
        if (f.id === isResizing) {
          return { ...f, visual_width: newWidth, visual_height: newHeight }
        }
        return f // Return the exact same object reference for other flowers
      })
    })
    
    setHasChanges(true)
  }, [isResizing, resizeStartSize, resizeStartPos, resizeMode, canvasWidth, canvasHeight])

  // Handle resize end - create actual duplicates
  const handleResizeEnd = useCallback(async () => {
    if (!isResizing || !plantBed) return

    // Immediately clear resize state to prevent sticky behavior
    const currentResizingId = isResizing
    setIsResizing(null)
    setResizeStartSize({ width: 0, height: 0 })
    setResizeStartPos({ x: 0, y: 0 })
    setResizeMode('uniform')

    try {
      // Get the current flower state from the latest flowerPositions
      const currentFlower = flowerPositions.find(f => f.id === currentResizingId)
      if (!currentFlower) return

      // Create duplicates at the calculated positions
      const duplicates: PlantWithPosition[] = []
      for (const pos of duplicatePositions) {
        const duplicate = await createVisualPlant({
          plant_bed_id: plantBed.id,
          name: currentFlower.name,
          color: currentFlower.color || '#FF69B4',
          status: currentFlower.status || 'healthy',
          position_x: pos.x,
          position_y: pos.y,
          visual_width: Math.min(currentFlower.visual_width * 0.6, 60), // Smaller duplicates
          visual_height: Math.min(currentFlower.visual_height * 0.6, 60),
          emoji: currentFlower.emoji || '🌸',
          is_custom: currentFlower.is_custom,
          category: currentFlower.category,
          notes: currentFlower.notes
        })
        if (duplicate) duplicates.push(duplicate)
      }

      // Add duplicates to state (only if there are any)
      if (duplicates.length > 0) {
        setFlowerPositions(prev => [...prev, ...duplicates])
        toast({
          title: "Bloemen gedupliceerd! 🌸",
          description: `${duplicates.length} extra bloemen toegevoegd door te vergroten!`,
        })
      }

      // Save the resized original flower
      await updatePlantPosition(currentFlower.id, {
        visual_width: currentFlower.visual_width,
        visual_height: currentFlower.visual_height
      })

    } catch (error) {
      console.error("Error creating duplicates:", error)
      toast({
        title: "Fout bij dupliceren",
        description: "Er is een fout opgetreden bij het dupliceren van bloemen.",
        variant: "destructive",
      })
    } finally {
      // Ensure cleanup even if there's an error
      setDuplicatePositions([])
    }
  }, [isResizing, plantBed, duplicatePositions, flowerPositions, toast])

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
              🌸 Klik bloem → Sleep blauwe hoek → Meer bloemen! 
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
        <DialogContent className="max-w-md">
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
                const isBeingResized = isResizing === flower.id

                // Determine shape based on width/height ratio
                const aspectRatio = flower.visual_width / flower.visual_height
                const isCircular = Math.abs(aspectRatio - 1) < 0.1 // Nearly square = circular
                const isWide = aspectRatio > 1.3 // Wide oval
                const isTall = aspectRatio < 0.7 // Tall oval

                let shapeClass = 'rounded-full' // Default circular
                if (isBeingResized || !isCircular) {
                  if (isWide) shapeClass = 'rounded-3xl' // Wide oval
                  else if (isTall) shapeClass = 'rounded-3xl' // Tall oval
                  else shapeClass = 'rounded-2xl' // Slightly rounded rectangle
                }

                return (
                  <div
                    key={flower.id}
                    className={`absolute cursor-pointer ${shapeClass} border-4 ${getStatusColor(flower.status || 'healthy')} ${
                      isDragging ? "shadow-2xl ring-4 ring-pink-500 z-10 scale-110" : 
                      isSelected ? "ring-4 ring-blue-500 shadow-xl" :
                      "shadow-lg hover:shadow-xl"
                    } transition-all duration-200 flex items-center justify-center text-2xl font-bold text-white relative`}
                    style={{
                      left: flower.position_x,
                      top: flower.position_y,
                      width: flower.visual_width,
                      height: flower.visual_height,
                      backgroundColor: flower.color,
                    }}
                    onClick={(e) => handleFlowerClick(e, flower.id)}
                    onDoubleClick={() => handleFlowerDoubleClick(flower)}
                    onMouseDown={(e) => handleFlowerMouseDown(e, flower.id)}
                  >
                    <div className="text-center w-full h-full flex flex-col items-center justify-center">
                      <div 
                        className="flex items-center justify-center"
                        style={{ 
                          fontSize: Math.max(12, Math.min(24, Math.min(flower.visual_width, flower.visual_height) * 0.3)) + 'px'
                        }}
                      >
                        {flower.emoji || '🌸'}
                      </div>
                      {/* Toon naam in de bloem als er genoeg ruimte is */}
                      {flower.visual_width > 60 && flower.visual_height > 60 && (
                        <div 
                          className="text-center text-white font-bold mt-1 px-1 leading-tight"
                          style={{ 
                            fontSize: Math.max(8, Math.min(12, Math.min(flower.visual_width, flower.visual_height) * 0.15)) + 'px',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          {flower.name}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <>
                        <div className="absolute -top-6 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                          Sleep hoek om groter te maken
                        </div>
                        {/* Grote, duidelijke resize handle */}
                        <div
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 border-3 border-white rounded-full cursor-nw-resize hover:bg-blue-600 hover:scale-110 flex items-center justify-center z-10 shadow-lg"
                          onMouseDown={(e) => handleResizeStart(e, flower.id, 'uniform')}
                          title="Sleep om bloem groter te maken en meer bloemen toe te voegen!"
                        >
                          <div className="text-white text-xs font-bold">⤢</div>
                        </div>
                        {/* Visual feedback tijdens resize */}
                        {isBeingResized && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10 animate-pulse">
                            +{duplicatePositions.length} bloemen
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}

              {/* Preview duplicates tijdens resize - MET NAMEN */}
              {isResizing && duplicatePositions.map((pos, index) => {
                const originalFlower = flowerPositions.find(f => f.id === isResizing)
                if (!originalFlower) return null
                
                // Maak preview bloemen groter en duidelijker
                const previewSize = Math.max(50, Math.min(80, originalFlower.visual_width * 0.7))
                
                return (
                  <div
                    key={`preview-${index}`}
                    className="absolute border-3 border-dashed border-green-500 bg-green-100 opacity-90 rounded-full flex flex-col items-center justify-center pointer-events-none animate-pulse shadow-lg"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: previewSize,
                      height: previewSize,
                      backgroundColor: originalFlower.color + '40', // Transparantie
                    }}
                  >
                    <div className="text-xl">{originalFlower.emoji || '🌸'}</div>
                    {/* Toon naam als er ruimte is */}
                    {previewSize > 60 && (
                      <div className="text-xs font-bold text-green-800 mt-1 text-center leading-tight">
                        {originalFlower.name}
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                      +{index + 1}
                    </div>
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
            <div>
              <p>💡 <strong>Super Eenvoudig:</strong></p>
              <p>🌸 <strong>Klik bloem</strong> → Zie blauwe hoek</p>
              <p>🔵 <strong>Sleep blauwe hoek</strong> → Bloem wordt groter + meer bloemen verschijnen!</p>
              <p>📏 <strong>Elke 40px groei</strong> = +1 extra bloem (max 15 extra)</p>
              <p>👆 <strong>Basis:</strong> Klik = selecteren, Sleep bloem = verplaatsen, Dubbelklik = bewerken</p>
            </div>
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
              <h4 className="font-medium mb-3">🌸 Nieuwe Functionaliteit!</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Klik</strong> op een bloem om deze te selecteren</p>
                <p>• <strong>Sleep blauwe hoek</strong> om bloem groter te maken</p>
                <p>• <strong>Groter maken</strong> = automatisch meer bloemen!</p>
                <p>• <strong>Dubbelklik</strong> op een bloem om te bewerken</p>
                <p>• <strong>Sleep bloem</strong> om te verplaatsen</p>
                <p>• Vergeet niet te <strong>opslaan</strong> na wijzigingen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}