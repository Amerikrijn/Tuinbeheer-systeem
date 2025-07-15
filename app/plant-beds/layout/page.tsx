"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Edit,
  Info,
  Sun,
  CloudSun,
  Cloud,
  Move,
  ArrowLeft,
  Trees,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { getMockPlantBeds, getMockGarden, type PlantBed, type Garden, type Plant } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PlantBedPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

const GRID_SIZE = 20
const SCALE_MIN = 0.5
const SCALE_MAX = 2

export default function PlantBedsLayoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [plantBeds, setPlantBeds] = useState<PlantBed[]>([])
  const [garden, setGarden] = useState<Garden | null>(null)
  const [positions, setPositions] = useState<PlantBedPosition[]>([])
  const [scale, setScale] = useState(1)
  const [selectedBed, setSelectedBed] = useState<PlantBed | null>(null)
  const [editingBed, setEditingBed] = useState<PlantBed | null>(null)
  const [draggedBed, setDraggedBed] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null)
  const [newPlant, setNewPlant] = useState<Partial<Plant>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      await new Promise((r) => setTimeout(r, 500))
      const beds = getMockPlantBeds()
      setPlantBeds(beds)
      setGarden(getMockGarden())

      const initialPositions: PlantBedPosition[] = beds.map((bed, index) => {
        const sizeMap = {
          "Klein (< 5m²)": { width: 80, height: 60 },
          "Gemiddeld (5-15m²)": { width: 120, height: 100 },
          "Groot (15-30m²)": { width: 160, height: 140 },
          "Extra groot (> 30m²)": { width: 200, height: 180 },
        } as const
        const size = sizeMap[bed.size as keyof typeof sizeMap] ?? {
          width: 100,
          height: 80,
        }
        return {
          id: bed.id,
          x: 100 + (index % 4) * 220,
          y: 100 + Math.floor(index / 4) * 200,
          width: size.width,
          height: size.height,
          rotation: 0,
        }
      })
      setPositions(initialPositions)
      setLoading(false)
    }
    loadData()
  }, [])

  const getSizeLabel = (bed: PlantBed) => {
    const map = {
      "Klein (< 5m²)": "Klein",
      "Gemiddeld (5-15m²)": "Gemiddeld",
      "Groot (15-30m²)": "Groot",
      "Extra groot (> 30m²)": "Extra groot",
    } as const
    return map[bed.size as keyof typeof map] ?? "Onbekend"
  }

  const sunIcon = (exp: string) => {
    switch (exp) {
      case "full-sun":
        return <Sun className="h-3 w-3 text-yellow-500" />
      case "partial-sun":
        return <CloudSun className="h-3 w-3 text-orange-500" />
      case "shade":
        return <Cloud className="h-3 w-3 text-gray-500" />
      default:
        return <Sun className="h-3 w-3 text-yellow-500" />
    }
  }

  const sunColor = (exp: string) => {
    switch (exp) {
      case "full-sun":
        return "bg-yellow-100 border-yellow-300"
      case "partial-sun":
        return "bg-orange-100 border-orange-300"
      case "shade":
        return "bg-gray-100 border-gray-300"
      default:
        return "bg-green-100 border-green-300"
    }
  }

  const getSunExposureText = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return "Volle zon"
      case "partial-sun":
        return "Gedeeltelijke zon"
      case "shade":
        return "Schaduw"
      default:
        return "Onbekend"
    }
  }

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const pos = positions.find((p) => p.id === id)
    if (!pos || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDraggedBed(id)
    setDragOffset({
      x: (e.clientX - rect.left) / scale - pos.x,
      y: (e.clientY - rect.top) / scale - pos.y,
    })
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggedBed || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newX = (e.clientX - rect.left) / scale - dragOffset.x
    const newY = (e.clientY - rect.top) / scale - dragOffset.y
    const snapX = Math.round(newX / GRID_SIZE) * GRID_SIZE
    const snapY = Math.round(newY / GRID_SIZE) * GRID_SIZE
    setPositions((prev) =>
      prev.map((p) => (p.id === draggedBed ? { ...p, x: Math.max(0, snapX), y: Math.max(0, snapY) } : p)),
    )
    setHasChanges(true)
  }

  const onMouseUp = () => {
    setDraggedBed(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, SCALE_MAX))
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, SCALE_MIN))
  const resetView = () => {
    setScale(1)
  }

  const saveLayout = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    toast({
      title: "Layout opgeslagen",
      description: "De nieuwe tuinindeling is succesvol opgeslagen.",
      duration: 3000,
    })
    setHasChanges(false)
  }

  const saveBedChanges = async () => {
    if (!editingBed) return
    
    await new Promise((r) => setTimeout(r, 500))
    
    setPlantBeds((prev) =>
      prev.map((bed) => (bed.id === editingBed.id ? editingBed : bed))
    )
    
    toast({
      title: "Plantvak bijgewerkt",
      description: `Details van plantvak ${editingBed.id} zijn opgeslagen.`,
      duration: 3000,
    })
    
    setEditingBed(null)
    setHasChanges(true)
  }

  const addPlant = () => {
    if (!selectedBed || !newPlant.name || !newPlant.color) return
    
    const plant: Plant = {
      id: Date.now().toString(),
      name: newPlant.name,
      color: newPlant.color,
      height: newPlant.height || 30,
      plantingDate: new Date().toISOString().split('T')[0],
      status: newPlant.status || "Healthy",
      notes: newPlant.notes || "",
    }
    
    setPlantBeds((prev) =>
      prev.map((bed) =>
        bed.id === selectedBed.id ? { ...bed, plants: [...bed.plants, plant] } : bed
      )
    )
    
    setSelectedBed((prev) => prev ? { ...prev, plants: [...prev.plants, plant] } : null)
    setNewPlant({})
    setHasChanges(true)
    
    toast({
      title: "Plant toegevoegd",
      description: `${plant.name} is toegevoegd aan plantvak ${selectedBed.id}.`,
      duration: 3000,
    })
  }

  const deletePlant = (plantId: string) => {
    if (!selectedBed) return
    
    setPlantBeds((prev) =>
      prev.map((bed) =>
        bed.id === selectedBed.id 
          ? { ...bed, plants: bed.plants.filter((p) => p.id !== plantId) }
          : bed
      )
    )
    
    setSelectedBed((prev) => 
      prev ? { ...prev, plants: prev.plants.filter((p) => p.id !== plantId) } : null
    )
    
    setHasChanges(true)
    
    toast({
      title: "Plant verwijderd",
      description: "De plant is succesvol verwijderd uit het plantvak.",
      duration: 3000,
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  const minX = Math.min(...positions.map((p) => p.x))
  const minY = Math.min(...positions.map((p) => p.y))
  const maxX = Math.max(...positions.map((p) => p.x + p.width))
  const maxY = Math.max(...positions.map((p) => p.y + p.height))

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white"
    : "min-h-screen"

  return (
    <div className={containerClass}>
      <div className={`${isFullscreen ? 'h-screen' : 'container mx-auto min-h-screen'} ${isFullscreen ? 'p-4' : 'p-6'} space-y-4 flex flex-col`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/plant-beds")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Grid3X3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                Tuin Layout
              </h1>
              <p className="text-sm text-gray-600">Klik op plantvakken voor details • Versleep om te herindelen</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= SCALE_MIN}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= SCALE_MAX}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {hasChanges && (
              <Button onClick={saveLayout} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </Button>
            )}
          </div>
        </div>

        {/* Legend */}
        <Card className="flex-shrink-0">
          <CardContent className="p-4 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
              <Sun className="h-3 w-3 text-yellow-500" />
              <span>Volle zon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
              <CloudSun className="h-3 w-3 text-orange-500" />
              <span>Gedeeltelijke zon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
              <Cloud className="h-3 w-3 text-gray-500" />
              <span>Schaduw</span>
            </div>
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-gray-600" />
              <span>Versleep om te verplaatsen</span>
            </div>
            {garden && (
              <div className="flex items-center gap-2">
                <Trees className="h-4 w-4 text-emerald-700" />
                <span>Tuingrens</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Garden Canvas */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full">
            <div
              ref={containerRef}
              className="relative bg-green-50 h-full overflow-auto"
              style={{
                backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
                backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
                minHeight: isFullscreen ? "calc(100vh - 200px)" : "600px",
              }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Garden boundary */}
              {garden && (
                <div
                  className="absolute rounded-lg border-4 border-emerald-700 border-dashed pointer-events-none"
                  style={{
                    left: Math.max(0, minX * scale - 20),
                    top: Math.max(0, minY * scale - 20),
                    width: (maxX - minX) * scale + 40,
                    height: (maxY - minY) * scale + 40,
                  }}
                />
              )}

              {/* Plant beds */}
              {positions.map((pos) => {
                const bed = plantBeds.find((b) => b.id === pos.id)
                if (!bed) return null
                return (
                  <div
                    key={pos.id}
                    className={`absolute border-2 rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${sunColor(
                      bed.sunExposure,
                    )} ${draggedBed === pos.id ? "shadow-2xl ring-2 ring-green-500" : ""} ${
                      selectedBed?.id === pos.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{
                      left: pos.x * scale,
                      top: pos.y * scale,
                      width: pos.width * scale,
                      height: pos.height * scale,
                      transform: `rotate(${pos.rotation}deg)`,
                    }}
                    onMouseDown={(e) => onMouseDown(e, pos.id)}
                    onClick={() => !draggedBed && setSelectedBed(bed)}
                  >
                    <div className="p-2 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs font-bold">
                            {bed.id}
                          </Badge>
                          {sunIcon(bed.sunExposure)}
                        </div>
                        <div className="font-semibold text-xs leading-tight mb-1 truncate">{bed.name}</div>
                        <div className="text-xs text-gray-600 leading-tight truncate">{bed.location}</div>
                      </div>
                      <div className="text-xs flex items-center justify-between">
                        <span className="text-gray-600">{getSizeLabel(bed)}</span>
                        <span className="font-medium">{bed.plants.length} planten</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plant Bed Details Dialog */}
      <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                  {selectedBed?.id}
                </Badge>
                <span>{selectedBed?.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingBed(selectedBed)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedBed && (
              <>
                {/* Bed Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Locatie:</span>
                    <div className="font-medium">{selectedBed.location}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Grootte:</span>
                    <div className="font-medium">{selectedBed.size}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Grondsoort:</span>
                    <div className="font-medium">{selectedBed.soilType}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Zonlicht:</span>
                    <div className="flex items-center gap-1">
                      {sunIcon(selectedBed.sunExposure)}
                      <span className="font-medium">{getSunExposureText(selectedBed.sunExposure)}</span>
                    </div>
                  </div>
                </div>

                {selectedBed.description && (
                  <div>
                    <span className="text-gray-600">Beschrijving:</span>
                    <div className="font-medium mt-1">{selectedBed.description}</div>
                  </div>
                )}

                {/* Plants Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold">Planten ({selectedBed.plants.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewPlant({ name: "", color: "", height: 30, status: "Healthy" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Plant toevoegen
                    </Button>
                  </div>

                  {/* Add new plant form */}
                  {newPlant.name !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="plant-name">Naam</Label>
                          <Input
                            id="plant-name"
                            value={newPlant.name || ""}
                            onChange={(e) => setNewPlant({...newPlant, name: e.target.value})}
                            placeholder="Naam van de plant"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plant-color">Kleur</Label>
                          <Input
                            id="plant-color"
                            value={newPlant.color || ""}
                            onChange={(e) => setNewPlant({...newPlant, color: e.target.value})}
                            placeholder="Kleur van de bloem"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plant-height">Hoogte (cm)</Label>
                          <Input
                            id="plant-height"
                            type="number"
                            value={newPlant.height || ""}
                            onChange={(e) => setNewPlant({...newPlant, height: parseInt(e.target.value) || 0})}
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plant-status">Status</Label>
                          <Select value={newPlant.status || "Healthy"} onValueChange={(value) => setNewPlant({...newPlant, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Healthy">Gezond</SelectItem>
                              <SelectItem value="Flowering">Bloeiend</SelectItem>
                              <SelectItem value="Wilting">Verwelkend</SelectItem>
                              <SelectItem value="Dormant">Rustend</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="plant-notes">Notities</Label>
                        <Textarea
                          id="plant-notes"
                          value={newPlant.notes || ""}
                          onChange={(e) => setNewPlant({...newPlant, notes: e.target.value})}
                          placeholder="Optionele notities..."
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setNewPlant({})}>
                          Annuleren
                        </Button>
                        <Button onClick={addPlant} disabled={!newPlant.name || !newPlant.color}>
                          Plant toevoegen
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Plants list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedBed.plants.map((plant) => (
                      <div key={plant.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{plant.name}</div>
                          <div className="text-sm text-gray-600">
                            {plant.color} • {plant.height}cm • Geplant: {plant.plantingDate}
                          </div>
                          {plant.notes && (
                            <div className="text-sm text-gray-500 mt-1">{plant.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {plant.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deletePlant(plant.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {selectedBed.plants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">Nog geen planten</div>
                        <div className="text-sm">Klik op "Plant toevoegen" om te beginnen</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/plant-beds/${selectedBed.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Info className="h-4 w-4 mr-2" />
                      Volledige Details
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingBed(selectedBed)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Plantvak Bewerken
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bed Dialog */}
      <Dialog open={!!editingBed} onOpenChange={() => setEditingBed(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Plantvak Bewerken</DialogTitle>
            <DialogDescription>
              Bewerk de details van plantvak {editingBed?.id}
            </DialogDescription>
          </DialogHeader>
          
          {editingBed && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bed-name">Naam</Label>
                <Input
                  id="bed-name"
                  value={editingBed.name}
                  onChange={(e) => setEditingBed({...editingBed, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="bed-location">Locatie</Label>
                <Input
                  id="bed-location"
                  value={editingBed.location}
                  onChange={(e) => setEditingBed({...editingBed, location: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="bed-size">Grootte</Label>
                <Select value={editingBed.size} onValueChange={(value) => setEditingBed({...editingBed, size: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Klein (< 5m²)">Klein (< 5m²)</SelectItem>
                    <SelectItem value="Gemiddeld (5-15m²)">Gemiddeld (5-15m²)</SelectItem>
                    <SelectItem value="Groot (15-30m²)">Groot (15-30m²)</SelectItem>
                    <SelectItem value="Extra groot (> 30m²)">Extra groot (> 30m²)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bed-soil">Grondsoort</Label>
                <Input
                  id="bed-soil"
                  value={editingBed.soilType}
                  onChange={(e) => setEditingBed({...editingBed, soilType: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="bed-sun">Zonlicht</Label>
                <Select value={editingBed.sunExposure} onValueChange={(value) => setEditingBed({...editingBed, sunExposure: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-sun">Volle zon</SelectItem>
                    <SelectItem value="partial-sun">Gedeeltelijke zon</SelectItem>
                    <SelectItem value="shade">Schaduw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bed-description">Beschrijving</Label>
                <Textarea
                  id="bed-description"
                  value={editingBed.description || ""}
                  onChange={(e) => setEditingBed({...editingBed, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingBed(null)}>
                  Annuleren
                </Button>
                <Button onClick={saveBedChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Opslaan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
