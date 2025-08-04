"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf, Plus, AlertCircle, Calendar } from "lucide-react"
import { getGarden, getPlantBed, createPlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

interface NewPlant {
  name: string
  scientificName: string
  variety: string
  color: string
  height: string
  plantingDate: string
  expectedHarvestDate: string
  status: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  notes: string
  careInstructions: string
  wateringFrequency: string
  fertilizerSchedule: string
}

export default function NewPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [plantBed, setPlantBed] = React.useState<PlantBedWithPlants | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [newPlant, setNewPlant] = React.useState<NewPlant>({
    name: "",
    scientificName: "",
    variety: "",
    color: "",
    height: "",
    plantingDate: "",
    expectedHarvestDate: "",
    status: "gezond",
    notes: "",
    careInstructions: "",
    wateringFrequency: "",
    fertilizerSchedule: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [gardenData, plantBedData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBed(params.bedId as string),
        ])
        setGarden(gardenData)
        setPlantBed(plantBedData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Fout",
          description: "Kon gegevens niet laden.",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [params.id, params.bedId, toast])

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!newPlant.name.trim()) nextErrors.name = "Plantnaam is verplicht"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm() || !plantBed) {
      toast({
        title: "Formulier onvolledig",
        description: "Controleer de gemarkeerde velden en probeer opnieuw.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await createPlant({
        plant_bed_id: plantBed.id,
        name: newPlant.name,
        scientific_name: newPlant.scientificName || undefined,
        variety: newPlant.variety || undefined,
        color: newPlant.color || undefined,
        height: newPlant.height ? Number.parseInt(newPlant.height) : undefined,
        planting_date: newPlant.plantingDate || undefined,
        expected_harvest_date: newPlant.expectedHarvestDate || undefined,
        status: newPlant.status,
        notes: newPlant.notes || undefined,
        care_instructions: newPlant.careInstructions || undefined,
        watering_frequency: newPlant.wateringFrequency ? Number.parseInt(newPlant.wateringFrequency) : undefined,
        fertilizer_schedule: newPlant.fertilizerSchedule || undefined,
      })

      toast({
        title: "Plant toegevoegd!",
        description: `Plant "${newPlant.name}" is succesvol toegevoegd aan ${plantBed.name}.`,
      })
      router.push(`/gardens/${garden?.id}/plantvak-view/${plantBed.id}`)
    } catch (err) {
      console.error("Error creating plant:", err)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het toevoegen van de plant.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNewPlant({
      name: "",
      scientificName: "",
      variety: "",
      color: "",
      height: "",
      plantingDate: "",
      expectedHarvestDate: "",
      status: "gezond",
      notes: "",
      careInstructions: "",
      wateringFrequency: "",
      fertilizerSchedule: "",
    })
    setErrors({})
  }

  if (!garden || !plantBed) {
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
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/gardens/${garden.id}/plantvak-view/${plantBed.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {plantBed.name} - Plantvak
          </Button>

          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <Plus className="h-7 w-7 text-green-600" />
              Nieuwe Plant
            </h1>
            <p className="text-muted-foreground">Voeg een nieuwe plant toe aan {plantBed.name}</p>
          </div>
        </div>

        <Link href="/plant-beds/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Plantvak Toevoegen
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Plant informatie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plantnaam *</Label>
                    <Input
                      id="name"
                      placeholder="Bijv. Tomaat, Basilicum, Roos"
                      value={newPlant.name}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          name: e.target.value,
                        }))
                      }
                      className={errors.name ? "border-destructive" : ""}
                      required
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scientificName">Wetenschappelijke naam</Label>
                    <Input
                      id="scientificName"
                      placeholder="Bijv. Solanum lycopersicum"
                      value={newPlant.scientificName}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          scientificName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variety">Variëteit</Label>
                    <Input
                      id="variety"
                      placeholder="Bijv. Cherry tomaat, Genovese basilicum"
                      value={newPlant.variety}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          variety: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Kleur</Label>
                    <Input
                      id="color"
                      placeholder="Bijv. Rood, Geel, Wit"
                      value={newPlant.color}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          color: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Hoogte (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Bijv. 150"
                      value={newPlant.height}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          height: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newPlant.status}
                      onValueChange={(value: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst") =>
                        setNewPlant((p) => ({
                          ...p,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gezond">🌱 Gezond</SelectItem>
                        <SelectItem value="aandacht_nodig">⚠️ Aandacht nodig</SelectItem>
                        <SelectItem value="ziek">🦠 Ziek</SelectItem>
                        <SelectItem value="dood">💀 Dood</SelectItem>
                        <SelectItem value="geoogst">🌾 Geoogst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantingDate">Plantdatum</Label>
                    <Input
                      id="plantingDate"
                      type="date"
                      value={newPlant.plantingDate}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          plantingDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedHarvestDate">Verwachte oogstdatum</Label>
                    <Input
                      id="expectedHarvestDate"
                      type="date"
                      value={newPlant.expectedHarvestDate}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          expectedHarvestDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wateringFrequency">Bewatering (keer per week)</Label>
                    <Input
                      id="wateringFrequency"
                      type="number"
                      placeholder="Bijv. 3"
                      value={newPlant.wateringFrequency}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          wateringFrequency: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fertilizerSchedule">Bemestingsschema</Label>
                    <Input
                      id="fertilizerSchedule"
                      placeholder="Bijv. Elke 2 weken"
                      value={newPlant.fertilizerSchedule}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          fertilizerSchedule: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careInstructions">Verzorgingsinstructies</Label>
                  <textarea
                    id="careInstructions"
                    rows={3}
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Speciale verzorgingsinstructies..."
                    value={newPlant.careInstructions}
                    onChange={(e) =>
                      setNewPlant((p) => ({
                        ...p,
                        careInstructions: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notities</Label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Aanvullende notities, observaties, etc..."
                    value={newPlant.notes}
                    onChange={(e) =>
                      setNewPlant((p) => ({
                        ...p,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Opslaan…" : "Plant Toevoegen"}
                  </Button>
                  <Button type="reset" variant="outline" disabled={loading}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <p>
                • Geef een duidelijke plantnaam op. <br />• Vul plantdatum in voor groei tracking. <br />• Stel de
                juiste status in. <br />• Noteer speciale verzorgingsinstructies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Plantvak Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <div className="space-y-2">
                <div>
                  <strong>Plantvak:</strong> {plantBed.name}
                </div>
                <div>
                  <strong>ID:</strong> {plantBed.id}
                </div>
                <div>
                  <strong>Locatie:</strong> {plantBed.location}
                </div>
                {plantBed.sun_exposure && (
                  <div>
                    <strong>Zonligging:</strong> {plantBed.sun_exposure}
                  </div>
                )}
                <div>
                  <strong>Huidige planten:</strong> {plantBed.plants.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
