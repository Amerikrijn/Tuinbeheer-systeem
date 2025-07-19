"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Save, Flower, TreePine, Sparkles } from "lucide-react"
import { getMockPlantBeds, type PlantBed } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function NewPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { goBack } = useNavigationHistory()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    height: "",
    plantingDate: new Date().toISOString().split("T")[0],
    status: "healthy",
    notes: "",
  })

  useEffect(() => {
    const loadPlantBed = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const beds = getMockPlantBeds()
        const bed = beds.find((b) => b.id === params.id)
        setPlantBed(bed || null)
      } catch (error) {
        console.error("Error loading plant bed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlantBed()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plantBed) return

    setSubmitting(true)

    try {
      // Mock submission - in real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Plant toegevoegd",
        description: `${formData.name} is succesvol toegevoegd aan ${plantBed.name}.`,
      })

      router.push(`/plant-beds/${plantBed.id}/plants`)
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de plant.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse h-12 bg-gray-200 rounded" />
        <div className="animate-pulse h-96 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Plantvak niet gevonden</h1>
          <p className="text-gray-600 mt-2">Het opgegeven plantvak bestaat niet.</p>
          <Link href="/plant-beds">
            <Button className="mt-4">Terug naar Plantvakken</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-green-200 opacity-10">
          <Flower className="h-32 w-32 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-blue-200 opacity-10">
          <TreePine className="h-40 w-40 animate-bounce" />
        </div>
        <div className="absolute bottom-40 left-40 text-purple-200 opacity-10">
          <Sparkles className="h-24 w-24 animate-spin" />
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              <Plus className="h-10 w-10 text-green-600" />
              Nieuwe Plant Toevoegen
            </h1>
            <p className="text-gray-600 mt-2">Voeg een nieuwe plant toe aan {plantBed.name}</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Flower className="h-6 w-6" />
              Plant Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Naam *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Bijv. Zonnebloem"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Kleur *</Label>
                  <Input
                    id="color"
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder="Bijv. Geel"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Hoogte (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="Bijv. 150"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plantingDate">Plantdatum *</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => handleInputChange("plantingDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Gezond</SelectItem>
                      <SelectItem value="needs_attention">Aandacht nodig</SelectItem>
                      <SelectItem value="flowering">Bloeiend</SelectItem>
                      <SelectItem value="dormant">Rustend</SelectItem>
                      <SelectItem value="diseased">Ziek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Optionele notities over deze plant..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Toevoegen...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Plant Toevoegen
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  Annuleren
                </Button>
                <Link href="/plant-beds/new">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Plantvak Toevoegen
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Plant Bed Info */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TreePine className="h-6 w-6" />
              Plantvak Informatie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="font-medium">Naam</div>
                <div className="text-sm text-gray-600">{plantBed.name}</div>
              </div>
              <div>
                <div className="font-medium">Grootte</div>
                <div className="text-sm text-gray-600">{plantBed.size}</div>
              </div>
              <div>
                <div className="font-medium">Huidige planten</div>
                <div className="text-sm text-gray-600">{plantBed.plants.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}