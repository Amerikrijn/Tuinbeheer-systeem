"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  Flower,
  Calendar,
  Palette,
  Ruler,
  AlertCircle,
  CheckCircle,
  Leaf,
} from "lucide-react"
import { getPlantBed, updatePlant, deletePlant } from "@/lib/database"
import type { PlantBedWithPlants, Plant } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function EditPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [color, setColor] = useState("")
  const [height, setHeight] = useState("")
  const [plantingDate, setPlantingDate] = useState("")
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")

  const statusOptions = [
    { value: "healthy", label: "Gezond" },
    { value: "needs_attention", label: "Heeft Aandacht Nodig" },
    { value: "diseased", label: "Ziek" },
    { value: "dead", label: "Dood" },
    { value: "harvested", label: "Geoogst" }
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        const bed = await getPlantBed(params.id as string)
        if (!bed) {
          router.push("/plant-beds")
          return
        }

        const foundPlant = bed.plants.find(p => p.id === params.plantId)
        if (!foundPlant) {
          router.push(`/plant-beds/${params.id}`)
          return
        }

        setPlantBed(bed)
        setPlant(foundPlant)
        
        // Set form values
        setName(foundPlant.name || "")
        setColor(foundPlant.color || "")
        setHeight(foundPlant.height?.toString() || "")
        setPlantingDate(foundPlant.planting_date ? foundPlant.planting_date.split('T')[0] : "")
        setStatus(foundPlant.status || "healthy")
        setNotes(foundPlant.notes || "")
        
      } catch (error) {
        console.error("Error loading plant:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het laden van de plant.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, params.plantId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: "Validatiefout",
        description: "Plant naam is verplicht.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      await updatePlant(params.plantId as string, {
        name: name.trim(),
        color: color.trim(),
        height: height ? parseInt(height) : undefined,
        planting_date: plantingDate || undefined,
        status: status as "healthy" | "needs_attention" | "diseased" | "dead" | "harvested",
        notes: notes.trim() || undefined,
      })

      toast({
        title: "Plant bijgewerkt!",
        description: `${name} is succesvol bijgewerkt.`,
      })

      router.push(`/plant-beds/${params.id}`)
    } catch (error) {
      console.error("Error updating plant:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de plant.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)

    try {
      await deletePlant(params.plantId as string)

      toast({
        title: "Plant verwijderd",
        description: `${plant?.name} is succesvol verwijderd uit het plantvak.`,
      })

      router.push(`/plant-beds/${params.id}`)
    } catch (error) {
      console.error("Error deleting plant:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de plant.",
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Plant laden...</p>
        </div>
      </div>
    )
  }

  if (!plantBed || !plant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Plant niet gevonden</h1>
          <p className="text-gray-600 mt-2">De plant die je zoekt bestaat niet.</p>
          <Link href="/plant-beds">
            <Button className="mt-4">Terug naar Plantvakken</Button>
          </Link>
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
            onClick={() => router.push(`/plant-beds/${plantBed.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Plantvak
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Edit className="h-8 w-8 text-blue-600" />
              Plant Bewerken
            </h1>
                         <p className="text-gray-600 mt-1">
               Bewerk {plant?.name} in plantvak {plantBed.id} ({plantBed.name})
             </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setDeleteDialog(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Verwijder Plant
        </Button>
      </div>

      {/* Plantvak Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Plantvak Informatie</h3>
              <p className="text-sm text-blue-700">
                {plantBed.name} • {plantBed.location} • {plantBed.size}
              </p>
            </div>
            <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
              {plantBed.sun_exposure === 'full-sun' ? 'Volle zon' : 
               plantBed.sun_exposure === 'partial-sun' ? 'Gedeeltelijke zon' : 'Schaduw'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flower className="h-5 w-5 text-pink-600" />
            Plant Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plant Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Plant Naam *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bijv. Zonnebloem"
                  required
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Kleur</Label>
                <Input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Bijv. Geel"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">Hoogte (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Bijv. 150"
                  min="1"
                  max="500"
                />
              </div>

              {/* Planting Date */}
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Plantdatum</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notities</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optionele notities over deze plant..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/plant-beds/${plantBed.id}`)}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Wijzigingen Opslaan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Plant Verwijderen
            </DialogTitle>
            <DialogDescription>
              Weet je zeker dat je <strong>{plant?.name}</strong> wilt verwijderen uit plantvak {plantBed.id}?
              Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleteLoading}
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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