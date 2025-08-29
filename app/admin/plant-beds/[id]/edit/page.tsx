"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Edit, Leaf, RefreshCw, Trash2, AlertTriangle, Home, Calendar, User } from "lucide-react"
import { getMockPlantBeds, type PlantBed } from "@/lib/mock-data"

interface EditPlantBed {
  id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: string
  description: string
}

export default function EditPlantBedPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)

  const [editPlantBed, setEditPlantBed] = useState<EditPlantBed>({
    id: "",
    name: "",
    location: "",
    size: "",
    soilType: "",
    sunExposure: "",
    description: "",
  })

  useEffect(() => {
    const loadPlantBed = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const beds = getMockPlantBeds()
        const bed = beds.find((b) => b.id === params.id)

        if (bed) {
          setPlantBed(bed)
          setEditPlantBed({
            id: bed.id,
            name: bed.name,
            location: bed.location,
            size: bed.size,
            soilType: bed.soilType,
            sunExposure: bed.sunExposure,
            description: bed.description || "",
          })
        }
      } catch (error) {
        console.error("Error loading plant bed:", error)
      }
    }

    loadPlantBed()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!editPlantBed.id || !editPlantBed.name || !editPlantBed.location) {
        toast({
          title: "Ontbrekende informatie",
          description: "Vul alle verplichte velden in.",
          variant: "destructive",
        })
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Plantvak bijgewerkt!",
        description: `Plantvak ${editPlantBed.id} (${editPlantBed.name}) is succesvol bijgewerkt.`,
      })

      router.push(`/admin/plant-beds/${editPlantBed.id}`)
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Plantvak verwijderd",
        description: `Plantvak ${plantBed?.id} (${plantBed?.name}) is succesvol verwijderd.`,
      })

      router.push("/admin/plant-beds")
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const sizeOptions = ["Klein (< 5m²)", "Gemiddeld (5-15m²)", "Groot (15-30m²)", "Extra groot (> 30m²)"]

  const soilTypeOptions = ["Kleigrond", "Zandgrond", "Leemgrond", "Veengrond", "Kalkgrond", "Gemengd"]

  const sunExposureOptions = [
    { value: "full-sun", label: "Volle zon (6+ uur)" },
    { value: "partial-sun", label: "Gedeeltelijke zon (3-6 uur)" },
    { value: "shade", label: "Schaduw (< 3 uur)" },
  ]

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Tuinbeheerscherm
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/plant-beds")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Plantvakken Overzicht
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Edit className="h-8 w-8 text-blue-600" />
            Plantvak Bewerken
          </h1>
          <p className="text-gray-600">
            Bewerk de eigenschappen van plantvak {plantBed.id} ({plantBed.name})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Plantvak Informatie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="id">Plantvak ID *</Label>
                    <Input
                      id="id"
                      value={editPlantBed.id}
                      onChange={(e) => setEditPlantBed((prev) => ({ ...prev, id: e.target.value.toUpperCase() }))}
                      placeholder="Bijv. A, B, C1, D2"
                      required
                      className="uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Plantvak Naam *</Label>
                    <Input
                      id="name"
                      value={editPlantBed.name}
                      onChange={(e) => setEditPlantBed((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Bijv. Rozenbed, Kruidenhoek"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Locatie *</Label>
                    <Input
                      id="location"
                      value={editPlantBed.location}
                      onChange={(e) => setEditPlantBed((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Bijv. Noordzijde hoofdingang, Achtertuin links"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Grootte</Label>
                    <Select
                      value={editPlantBed.size}
                      onValueChange={(value) => setEditPlantBed((prev) => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer grootte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Grondsoort</Label>
                    <Select
                      value={editPlantBed.soilType}
                      onValueChange={(value) => setEditPlantBed((prev) => ({ ...prev, soilType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer grondsoort" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypeOptions.map((soil) => (
                          <SelectItem key={soil} value={soil}>
                            {soil}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="sunExposure">Zonlicht</Label>
                    <Select
                      value={editPlantBed.sunExposure}
                      onValueChange={(value) => setEditPlantBed((prev) => ({ ...prev, sunExposure: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer zonlicht" />
                      </SelectTrigger>
                      <SelectContent>
                        {sunExposureOptions.map((exposure) => (
                          <SelectItem key={exposure.value} value={exposure.value}>
                            {exposure.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={editPlantBed.description}
                    onChange={(e) => setEditPlantBed((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Extra informatie over dit plantvak..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Bijwerken...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Plantvak Bijwerken
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push(`/admin/plant-beds/${params.id}`)}>
                    Annuleren
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Plant Bed Info & Actions */}
        <div className="space-y-6">
          {/* Current Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Huidige Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div className="text-gray-600 mb-1">Plantvak ID:</div>
                <div className="font-medium">{plantBed.id}</div>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="text-gray-600 mb-1">Aantal planten:</div>
                <div className="font-medium">{plantBed.plants.length}</div>
              </div>

              <Separator />

              {plantBed.lastModifiedDate && (
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Laatst bewerkt:
                  </div>
                  <div className="font-medium">{new Date(plantBed.lastModifiedDate).toLocaleDateString("nl-NL")}</div>
                  {plantBed.lastModifiedBy && (
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <User className="h-4 w-4" />
                      Door: {plantBed.lastModifiedBy}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Gevaarlijke Acties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                Het verwijderen van dit plantvak verwijdert ook alle {plantBed.plants.length} planten erin. Deze actie
                kan niet ongedaan worden gemaakt!
              </div>

              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                onClick={() => setDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Plantvak Verwijderen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div>
                Weet je zeker dat je plantvak <strong>{plantBed.id}</strong> ({plantBed.name}) wilt verwijderen?
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Let op: Dit verwijdert ook alle planten!
                </div>
                <div className="text-red-700 text-sm">
                  Er zijn <strong>{plantBed.plants.length} planten</strong> in dit plantvak die ook permanent verwijderd
                  worden.
                </div>
              </div>
              <div className="text-sm text-gray-600">Deze actie kan niet ongedaan worden gemaakt.</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deleteLoading}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ja, Verwijderen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
