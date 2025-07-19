"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
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
import { ArrowLeft, Edit, Leaf, RefreshCw, Trash2, AlertTriangle, Home, Calendar, User, TreePine } from "lucide-react"
import { getGarden, getPlantBed, updatePlantBed, deletePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

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
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [plantBed, setPlantBed] = React.useState<PlantBedWithPlants | null>(null)
  const [deleteDialog, setDeleteDialog] = React.useState(false)

  const [editPlantBed, setEditPlantBed] = React.useState<EditPlantBed>({
    id: "",
    name: "",
    location: "",
    size: "",
    soilType: "",
    sunExposure: "",
    description: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [gardenData, plantBedData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBed(params.bedId as string),
        ])
        
        setGarden(gardenData)
        setPlantBed(plantBedData)
        
        // Initialize form with plant bed data
        if (plantBedData) {
          setEditPlantBed({
            id: plantBedData.id,
            name: plantBedData.name || "",
            location: plantBedData.location || "",
            size: plantBedData.size || "",
            soilType: plantBedData.soil_type || "",
            sunExposure: plantBedData.sun_exposure || "",
            description: plantBedData.description || "",
          })
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het laden van de gegevens.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, params.bedId, toast])

  const handleSave = async () => {
    if (!editPlantBed.name.trim()) {
      toast({
        title: "Validatiefout",
        description: "Plantvak naam is verplicht.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await updatePlantBed(editPlantBed.id, {
        name: editPlantBed.name,
        location: editPlantBed.location,
        size: editPlantBed.size,
        soil_type: editPlantBed.soilType,
        sun_exposure: editPlantBed.sunExposure as 'full-sun' | 'partial-sun' | 'shade' | undefined,
        description: editPlantBed.description,
      })

      toast({
        title: "Plantvak bijgewerkt!",
        description: `Plantvak ${editPlantBed.id} (${editPlantBed.name}) is succesvol bijgewerkt.`,
      })

      router.push(`/gardens/${params.id}/plant-beds/${editPlantBed.id}`)
    } catch (error) {
      console.error("Error updating plant bed:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!plantBed) return
    
    setDeleteLoading(true)
    try {
      await deletePlantBed(plantBed.id)
      
      toast({
        title: "Plantvak verwijderd",
        description: `Plantvak ${plantBed.id} (${plantBed.name}) is succesvol verwijderd.`,
      })
      
      router.push(`/gardens/${params.id}/plant-beds`)
    } catch (error) {
      console.error("Error deleting plant bed:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!garden || !plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <p className="text-gray-600 mb-4">Het plantvak dat je zoekt bestaat niet of is verwijderd.</p>
          <Link href={`/gardens/${params.id}/plant-beds`}>
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Plantvakken
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Plantvak
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
              <Edit className="h-8 w-8" />
              Plantvak Bewerken
            </h1>
            <p className="text-gray-600 mt-1">
              Bewerk de details van plantvak in {garden.name}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link href="/gardens" className="hover:text-green-600">Tuinen</Link>
        <span className="mx-2">→</span>
        <Link href={`/gardens/${garden.id}`} className="hover:text-green-600">{garden.name}</Link>
        <span className="mx-2">→</span>
        <Link href={`/gardens/${garden.id}/plant-beds`} className="hover:text-green-600">Plantvakken</Link>
        <span className="mx-2">→</span>
        <Link href={`/gardens/${garden.id}/plant-beds/${plantBed.id}`} className="hover:text-green-600">{plantBed.name}</Link>
        <span className="mx-2">→</span>
        <span className="font-medium">Bewerken</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Plantvak Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plantvak Naam *</Label>
                  <Input
                    id="name"
                    value={editPlantBed.name}
                    onChange={(e) => setEditPlantBed(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Plantvak naam"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Locatie</Label>
                  <Input
                    id="location"
                    value={editPlantBed.location}
                    onChange={(e) => setEditPlantBed(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Bijv. Achtertuin links"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Grootte</Label>
                  <Input
                    id="size"
                    value={editPlantBed.size}
                    onChange={(e) => setEditPlantBed(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="Bijv. 2x3 meter"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="soilType">Grondsoort</Label>
                  <Select 
                    value={editPlantBed.soilType} 
                    onValueChange={(value) => setEditPlantBed(prev => ({ ...prev, soilType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer grondsoort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Klei</SelectItem>
                      <SelectItem value="sand">Zand</SelectItem>
                      <SelectItem value="loam">Leem</SelectItem>
                      <SelectItem value="mixed">Gemengd</SelectItem>
                      <SelectItem value="unknown">Onbekend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="sunExposure">Zonligging</Label>
                <Select 
                  value={editPlantBed.sunExposure} 
                  onValueChange={(value) => setEditPlantBed(prev => ({ ...prev, sunExposure: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer zonligging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-sun">Volle zon (6+ uur)</SelectItem>
                    <SelectItem value="partial-sun">Gedeeltelijke zon (3-6 uur)</SelectItem>
                    <SelectItem value="shade">Schaduw (&lt;3 uur)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={editPlantBed.description}
                  onChange={(e) => setEditPlantBed(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optionele beschrijving van het plantvak"
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Wijzigingen Opslaan
                  </>
                )}
              </Button>
              
              <Separator />
              
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialog(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Plantvak Verwijderen
              </Button>
            </CardContent>
          </Card>

          {/* Plant Bed Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plantvak Informatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Plantvak ID</div>
                <div className="font-mono text-sm">{plantBed.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Aantal Planten</div>
                <div className="font-medium">{plantBed.plants.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Aangemaakt</div>
                <div className="text-sm">{new Date(plantBed.created_at).toLocaleDateString('nl-NL')}</div>
              </div>
              {plantBed.updated_at && (
                <div>
                  <div className="text-sm text-gray-600">Laatst bijgewerkt</div>
                  <div className="text-sm">{new Date(plantBed.updated_at).toLocaleDateString('nl-NL')}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Weet je zeker dat je plantvak <strong>{plantBed.id}</strong> ({plantBed.name}) wilt verwijderen?
              </p>
              <p className="text-red-600 font-medium">
                Deze actie kan niet ongedaan worden gemaakt.
              </p>
              {plantBed.plants.length > 0 && (
                <p className="text-red-600">
                  Er zijn <strong>{plantBed.plants.length} planten</strong> in dit plantvak die ook permanent verwijderd
                  zullen worden.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Annuleren
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Definitief Verwijderen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}