"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
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
import { ArrowLeft, Edit, Leaf, RefreshCw, Trash2, AlertTriangle, Home, Calendar, User, Plus } from "lucide-react"
import { getMockPlantBeds, type PlantBed } from "@/lib/mock-data"
import Link from "next/link"

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
  const { goBack } = useNavigationHistory()
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
    const fetchPlantBed = async () => {
      try {
        const plantBeds = await getMockPlantBeds()
        const bed = plantBeds.find((bed) => bed.id === params.id)
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
        console.error("Error fetching plant bed:", error)
        toast({
          title: "Error",
          description: "Failed to load plant bed details",
          variant: "destructive",
        })
      }
    }

    if (params.id) {
      fetchPlantBed()
    }
  }, [params.id, toast])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Plant bed updated successfully",
      })
      
      router.push(`/plant-beds/${editPlantBed.id}`)
    } catch (error) {
      console.error("Error saving plant bed:", error)
      toast({
        title: "Error",
        description: "Failed to save plant bed",
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
        title: "Success",
        description: "Plant bed deleted successfully",
      })
      
      router.push("/plant-beds")
    } catch (error) {
      console.error("Error deleting plant bed:", error)
      toast({
        title: "Error",
        description: "Failed to delete plant bed",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialog(false)
    }
  }

  if (!plantBed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={goBack}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug
            </Button>
            <Link href="/plant-beds/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Plantvak Toevoegen
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Edit className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Plantvak Bewerken
              </h1>
              <p className="text-gray-600">
                Bewerk de details van je plantvak
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Plantvak Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={editPlantBed.name}
                  onChange={(e) =>
                    setEditPlantBed({ ...editPlantBed, name: e.target.value })
                  }
                  placeholder="Plantvak naam"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Locatie</Label>
                <Input
                  id="location"
                  value={editPlantBed.location}
                  onChange={(e) =>
                    setEditPlantBed({ ...editPlantBed, location: e.target.value })
                  }
                  placeholder="Locatie in de tuin"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="size">Grootte</Label>
                <Input
                  id="size"
                  value={editPlantBed.size}
                  onChange={(e) =>
                    setEditPlantBed({ ...editPlantBed, size: e.target.value })
                  }
                  placeholder="Bijv. 2m x 3m"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="soilType">Grondsoort</Label>
                <Select
                  value={editPlantBed.soilType}
                  onValueChange={(value) =>
                    setEditPlantBed({ ...editPlantBed, soilType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer grondsoort" />
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
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sunExposure">Zonligging</Label>
                <Select
                  value={editPlantBed.sunExposure}
                  onValueChange={(value) =>
                    setEditPlantBed({ ...editPlantBed, sunExposure: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer zonligging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vol-zon">Vol zon (6+ uren)</SelectItem>
                    <SelectItem value="halfschaduw">Halfschaduw (3-6 uren)</SelectItem>
                    <SelectItem value="schaduw">Schaduw (&lt; 3 uren)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={editPlantBed.description}
                onChange={(e) =>
                  setEditPlantBed({ ...editPlantBed, description: e.target.value })
                }
                placeholder="Optionele beschrijving van het plantvak"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Verwijder Plantvak
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goBack}
            >
              Annuleren
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Opslaan...
                </>
              ) : (
                "Opslaan"
              )}
            </Button>
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
              <DialogDescription>
                Weet je zeker dat je dit plantvak wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                Alle planten in dit plantvak zullen ook worden verwijderd.
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
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verwijderen...
                  </>
                ) : (
                  "Verwijderen"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}