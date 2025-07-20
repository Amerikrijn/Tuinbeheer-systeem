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
import { Badge } from "@/components/ui/badge"
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
import { ArrowLeft, Edit, Leaf, RefreshCw, Trash2, AlertTriangle, Home, Calendar, MapPin } from "lucide-react"
import { getMockPlantBeds, type PlantBed, type Plant } from "@/lib/mock-data"

interface EditPlant {
  name: string
  color: string
  height: string
  plantingDate: string
  status: string
  notes: string
}

export default function EditPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [editPlant, setEditPlant] = useState<EditPlant>({
    name: "",
    color: "",
    height: "",
    plantingDate: "",
    status: "",
    notes: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const beds = getMockPlantBeds()
        const bed = beds.find((b) => b.id === params.id)
        const foundPlant = bed?.plants.find((p) => p.id === params.plantId)

        if (bed && foundPlant) {
          setPlantBed(bed)
          setPlant(foundPlant)
          setEditPlant({
            name: foundPlant.name,
            color: foundPlant.color,
            height: foundPlant.height.toString(),
            plantingDate: foundPlant.plantingDate,
            status: foundPlant.status,
            notes: foundPlant.notes || "",
          })
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setPageLoading(false)
      }
    }

    loadData()
  }, [params.id, params.plantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!editPlant.name || !editPlant.color || !editPlant.height) {
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
        title: "Plant bijgewerkt!",
        description: `${editPlant.name} is succesvol bijgewerkt.`,
      })

      router.push(`/admin/plant-beds/${params.id}`)
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de plant.",
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
        title: "Plant verwijderd",
        description: `${plant?.name} is succesvol verwijderd uit plantvak ${plantBed?.id}.`,
      })

      router.push(`/admin/plant-beds/${params.id}`)
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de plant.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const colorOptions = ["Wit", "Geel", "Oranje", "Rood", "Roze", "Paars", "Blauw", "Groen", "Bruin", "Zwart", "Gemengd"]

  const statusOptions = ["Gezond", "Ziek", "Herstellend", "Nieuw geplant", "Te verplaatsen"]

  if (pageLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!plantBed || !plant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plant niet gevonden</h3>
          <p className="text-gray-600 mb-4">De plant die je zoekt bestaat niet of is verwijderd.</p>
          <Button onClick={() => router.push("/admin/plant-beds")} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Overzicht
          </Button>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/plant-beds/${params.id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Plantvak {plantBed.id}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/plant-beds/layout")}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Visuele Layout
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Edit className="h-8 w-8 text-blue-600" />
            Plant Bewerken
          </h1>
          <p className="text-gray-600">
            Bewerk {plant.name} in plantvak{" "}
            <Badge variant="outline" className="font-bold">
              {plantBed.id}
            </Badge>{" "}
            ({plantBed.name})
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
                Plant Informatie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plant Naam *</Label>
                    <Input
                      id="name"
                      value={editPlant.name}
                      onChange={(e) => setEditPlant((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Bijv. Roos, Lavendel, Tulp"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Kleur *</Label>
                    <Select
                      value={editPlant.color}
                      onValueChange={(value) => setEditPlant((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer kleur" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Hoogte (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      value={editPlant.height}
                      onChange={(e) => setEditPlant((prev) => ({ ...prev, height: e.target.value }))}
                      placeholder="Bijv. 30, 50, 120"
                      required
                      min="1"
                      max="500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantingDate">Plantdatum</Label>
                    <Input
                      id="plantingDate"
                      type="date"
                      value={editPlant.plantingDate}
                      onChange={(e) => setEditPlant((prev) => ({ ...prev, plantingDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editPlant.status}
                      onValueChange={(value) => setEditPlant((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Opmerkingen</Label>
                  <Textarea
                    id="notes"
                    value={editPlant.notes}
                    onChange={(e) => setEditPlant((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Extra informatie over deze plant..."
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
                        Plant Bijwerken
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

        {/* Plant Info & Actions */}
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
                <div className="text-gray-600 mb-1">Plant naam:</div>
                <div className="font-medium">{plant.name}</div>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="text-gray-600 mb-1">Kleur:</div>
                <div className="font-medium">{plant.color}</div>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="text-gray-600 mb-1">Hoogte:</div>
                <div className="font-medium">{plant.height}cm</div>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="text-gray-600 mb-1">Status:</div>
                <Badge variant="secondary">{plant.status}</Badge>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  Geplant op:
                </div>
                <div className="font-medium">{new Date(plant.plantingDate).toLocaleDateString("nl-NL")}</div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Bed Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                  {plantBed.id}
                </Badge>
                Plantvak Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Naam</div>
                <div className="font-medium">{plantBed.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Locatie</div>
                <div className="font-medium">{plantBed.location}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Totaal planten</div>
                <div className="font-medium">{plantBed.plants.length}</div>
              </div>
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
                Het verwijderen van deze plant kan niet ongedaan worden gemaakt.
              </div>

              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                onClick={() => setDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Plant Verwijderen
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
              Plant Verwijderen
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div>
                Weet je zeker dat je <strong>{plant.name}</strong> wilt verwijderen uit plantvak {plantBed.id}?
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
