"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Move,
  ArrowLeft,
  Trees,
} from "lucide-react"
import { getMockPlantBeds, getMockGarden, type PlantBed, type Garden } from "@/lib/mock-data"
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
  const [draggedBed, setDraggedBed] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ------------------------------------------------------------------ */
  /*  Load Mock-data (tuin + plantvakken)                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const loadData = async () => {
      await new Promise((r) => setTimeout(r, 500))
      const beds = getMockPlantBeds()
      setPlantBeds(beds)
      setGarden(getMockGarden())

      // Initiële posities afgeleid van grootte
      const initialPositions: PlantBedPosition[] = beds.map((bed, index) => {
        const sizeMap = {
          "Klein (< 5m²)": { width: 80, height: 60 },
          "Gemiddeld (5-15m²)": { width: 120, height: 100 },
          "Groot (15-30m²)": { width: 160, height: 140 },
        } as const
        const size = sizeMap[bed.size as keyof typeof sizeMap] ?? {
          width: 100,
          height: 80,
        }
        return {
          id: bed.id,
          x: 100 + (index % 3) * 200,
          y: 100 + Math.floor(index / 3) * 180,
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

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */
  const getSizeLabel = (bed: PlantBed) => {
    const map = {
      "Klein (< 5m²)": "Klein",
      "Gemiddeld (5-15m²)": "Gemiddeld",
      "Groot (15-30m²)": "Groot",
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

  /* ------------------------------------------------------------------ */
  /*  Drag + Zoom handlers                                              */
  /* ------------------------------------------------------------------ */
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
    setHasChanges(false)
  }

  const saveLayout = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    toast({
      title: "Layout opgeslagen",
      description: "De nieuwe indeling is succesvol opgeslagen.",
    })
    setHasChanges(false)
  }

  /* ------------------------------------------------------------------ */
  /*  Loading skeleton                                                  */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse h-12 bg-gray-200 rounded" />
        <div className="animate-pulse h-96 bg-gray-200 rounded" />
      </div>
    )
  }

  /* ------------------------------------------------------------------ */
  /*  Bereken bounds voor tuin-markering                                */
  /* ------------------------------------------------------------------ */
  const minX = Math.min(...positions.map((p) => p.x))
  const minY = Math.min(...positions.map((p) => p.y))
  const maxX = Math.max(...positions.map((p) => p.x + p.width))
  const maxY = Math.max(...positions.map((p) => p.y + p.height))

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header ----------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/plant-beds")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Overzicht
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Grid3X3 className="h-8 w-8 text-green-600" />
              Tuin Layout
            </h1>
            <p className="text-gray-600">Grafische weergave van alle plantvakken – versleep om te herindelen</p>
          </div>
        </div>

        {/* Controls ------------------------------------------------ */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= SCALE_MIN}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= SCALE_MAX}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          {hasChanges && (
            <Button onClick={saveLayout} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
          )}
        </div>
      </div>

      {/* Legend ---------------------------------------------------- */}
      <Card>
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
              <span>Tuin-grens</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas ---------------------------------------------------- */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative bg-green-50 min-h-[600px] overflow-auto"
            style={{
              backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
            }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Tuin-markering ----------------------------------- */}
            {garden && (
              <div
                className="absolute rounded-lg border-4 border-emerald-700 border-dashed pointer-events-none"
                style={{
                  left: minX * scale - 20,
                  top: minY * scale - 20,
                  width: (maxX - minX) * scale + 40,
                  height: (maxY - minY) * scale + 40,
                }}
              />
            )}

            {/* Plantvakken -------------------------------------- */}
            {positions.map((pos) => {
              const bed = plantBeds.find((b) => b.id === pos.id)
              if (!bed) return null
              return (
                <div
                  key={pos.id}
                  className={`absolute border-2 rounded-lg shadow-lg cursor-move transition-all duration-200 hover:shadow-xl ${sunColor(
                    bed.sunExposure,
                  )} ${draggedBed === pos.id ? "shadow-2xl ring-2 ring-green-500" : ""}`}
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
                      <div className="font-semibold text-xs leading-tight mb-1">{bed.name}</div>
                      <div className="text-xs text-gray-600 leading-tight">{bed.location}</div>
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

      {/* Detail-dialog ----------------------------------------- */}
      <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                {selectedBed?.id}
              </Badge>
              {selectedBed?.name}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              {selectedBed && (
                <>
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
                        <span className="font-medium">
                          {selectedBed.sunExposure === "full-sun" && "Volle zon"}
                          {selectedBed.sunExposure === "partial-sun" && "Gedeeltelijke zon"}
                          {selectedBed.sunExposure === "shade" && "Schaduw"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Planten ({selectedBed.plants.length}):</span>
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {selectedBed.plants.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-600">
                              {p.color} • {p.height}cm
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {p.status}
                          </Badge>
                        </div>
                      ))}
                      {selectedBed.plants.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">Nog geen planten toegevoegd</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/plant-beds/${selectedBed.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Info className="h-4 w-4 mr-2" />
                        Details Bekijken
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
