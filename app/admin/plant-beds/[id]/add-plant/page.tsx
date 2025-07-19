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
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Leaf, RefreshCw, Home } from "lucide-react"
import { getMockPlantBeds, type PlantBed } from "@/lib/mock-data"

interface NewPlant {
  name: string
  color: string
  height: string
  plantingDate: string
  status: string
  notes: string
}

export default function AddPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const [newPlant, setNewPlant] = useState<NewPlant>({
    name: "",
    color: "",
    height: "",
    plantingDate: new Date().toISOString().split("T")[0],
    status: "Gezond",
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
        setPageLoading(false)
      }
    }

    loadPlantBed()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!newPlant.name || !newPlant.color || !newPlant.height) {
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
        title: "Plant toegevoegd!",
        description: `${newPlant.name} is succesvol toegevoegd aan plantvak ${plantBed?.id}.`,
      })

      router.push(`/admin/plant-beds/${params.id}`)
    } catch (error) {
      console.error("Error adding plant:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de plant.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <p className="text-gray-600 mb-4">Het plantvak dat je zoekt bestaat niet of is verwijderd.</p>
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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plus className="h-8 w-8 text-green-600" />
            Plant Toevoegen
          </h1>
          <p className="text-gray-600">
            Voeg een nieuwe plant toe aan plantvak{" "}
            <Badge variant="outline" className="font-bold">
              {plantBed.id}
            </Badge>{" "}
            ({plantBed.name})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
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
                      value={newPlant.name}
                      onChange={(e) => setNewPlant((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Bijv. Roos, Lavendel, Tulp"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Kleur *</Label>
                    <Select
                      value={newPlant.color}
                      onValueChange={(value) => setNewPlant((prev) => ({ ...prev, color: value }))}
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
                      value={newPlant.height}
                      onChange={(e) => setNewPlant((prev) => ({ ...prev, height: e.target.value }))}
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
                      value={newPlant.plantingDate}
                      onChange={(e) => setNewPlant((prev) => ({ ...prev, plantingDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newPlant.status}
                      onValueChange={(value) => setNewPlant((prev) => ({ ...prev, status: value }))}
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
                    value={newPlant.notes}
                    onChange={(e) => setNewPlant((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Extra informatie over deze plant..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Toevoegen...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Plant Toevoegen
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

        {/* Plant Bed Info */}
        <div className="space-y-6">
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
                <div className="text-sm text-gray-600">Huidige planten</div>
                <div className="font-medium">{plantBed.plants.length}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Zonlicht</div>
                <div className="font-medium">
                  {plantBed.sunExposure === "full-sun"
                    ? "Volle zon"
                    : plantBed.sunExposure === "partial-sun"
                      ? "Gedeeltelijke zon"
                      : "Schaduw"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Grondsoort</div>
                <div className="font-medium">{plantBed.soilType}</div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Tips voor het toevoegen van planten</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="space-y-2 text-sm">
                <li>• Gebruik de Nederlandse naam van de plant</li>
                <li>• Geef de huidige hoogte op, niet de maximale hoogte</li>
                <li>• Voeg opmerkingen toe voor speciale verzorging</li>
                <li>• Controleer of de plant geschikt is voor dit plantvak</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
