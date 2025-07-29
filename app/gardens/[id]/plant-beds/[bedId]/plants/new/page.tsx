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
import { ArrowLeft, Leaf, Plus, AlertCircle, Calendar, ChevronDown } from "lucide-react"
import { getGarden, getPlantBed, createPlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import type { TaskWithPlantInfo } from '@/lib/types/tasks'

// Standard flower types with emojis
const STANDARD_FLOWERS = [
  { name: 'Roos', emoji: '🌹', color: '#FF69B4' },
  { name: 'Tulp', emoji: '🌷', color: '#FF4500' },
  { name: 'Zonnebloem', emoji: '🌻', color: '#FFD700' },
  { name: 'Lavendel', emoji: '🪻', color: '#9370DB' },
  { name: 'Dahlia', emoji: '🌺', color: '#FF1493' },
  { name: 'Chrysant', emoji: '🌼', color: '#FFA500' },
  { name: 'Narcis', emoji: '🌻', color: '#FFFF00' },
  { name: 'Iris', emoji: '🌸', color: '#4B0082' },
  { name: 'Petunia', emoji: '🌺', color: '#FF6B6B' },
  { name: 'Begonia', emoji: '🌸', color: '#FF8C69' },
  { name: 'Lelie', emoji: '🌺', color: '#FF69B4' },
  { name: 'Anjer', emoji: '🌸', color: '#FF1493' },
]

const DEFAULT_FLOWER_EMOJI = '🌼'

interface NewPlant {
  name: string
  scientificName: string
  latinName: string
  variety: string
  color: string
  plantColor: string
  height: string
  plantHeight: string
  plantsPerSqm: string
  sunPreference: 'full-sun' | 'partial-sun' | 'shade'
  plantingDate: string
  expectedHarvestDate: string
  status: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  notes: string
  careInstructions: string
  wateringFrequency: string
  fertilizerSchedule: string
  emoji: string
  isStandardFlower: boolean
}

export default function NewPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [plantBed, setPlantBed] = React.useState<PlantBedWithPlants | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [showAddTask, setShowAddTask] = React.useState(false)
  const [createdPlantId, setCreatedPlantId] = React.useState<string | null>(null)

  // Clear any dialog states that might be stuck
  React.useEffect(() => {
    // Clear any session storage that might cause overlay issues
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'unset'
      // Remove any potential stuck modal states
      const dialogs = document.querySelectorAll('[role="dialog"]')
      dialogs.forEach(dialog => {
        if (dialog.getAttribute('data-state') === 'open') {
          dialog.setAttribute('data-state', 'closed')
        }
      })
    }
  }, [])

  const [newPlant, setNewPlant] = React.useState<NewPlant>({
    name: "",
    scientificName: "",
    latinName: "",
    variety: "",
    color: "",
    plantColor: "",
    height: "",
    plantHeight: "",
    plantsPerSqm: "4",
    sunPreference: 'partial-sun',
    plantingDate: "",
    expectedHarvestDate: "",
    status: "gezond",
    notes: "",
    careInstructions: "",
    wateringFrequency: "",
    fertilizerSchedule: "",
    emoji: DEFAULT_FLOWER_EMOJI,
    isStandardFlower: false,
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
      const createdPlant = await createPlant({
        plant_bed_id: plantBed.id,
        name: newPlant.name,
        scientific_name: newPlant.scientificName || undefined,
        latin_name: newPlant.latinName || undefined,
        variety: newPlant.variety || undefined,
        color: newPlant.color || undefined,
        plant_color: newPlant.plantColor || undefined,
        height: newPlant.height ? Number.parseInt(newPlant.height) : undefined,
        plant_height: newPlant.plantHeight ? Number.parseInt(newPlant.plantHeight) : undefined,
        plants_per_sqm: newPlant.plantsPerSqm ? Number.parseInt(newPlant.plantsPerSqm) : undefined,
        sun_preference: newPlant.sunPreference,
        planting_date: newPlant.plantingDate || undefined,
        expected_harvest_date: newPlant.expectedHarvestDate || undefined,
        status: newPlant.status,
        notes: newPlant.notes || undefined,
        care_instructions: newPlant.careInstructions || undefined,
        watering_frequency: newPlant.wateringFrequency ? Number.parseInt(newPlant.wateringFrequency) : undefined,
        fertilizer_schedule: newPlant.fertilizerSchedule || undefined,
        emoji: newPlant.emoji,
      })

      if (createdPlant) {
        setCreatedPlantId(createdPlant.id)
      }
      toast({
        title: "Plant toegevoegd!",
        description: `Plant "${newPlant.name}" is succesvol toegevoegd aan ${plantBed.name}.`,
      })
      router.push(`/gardens/${garden?.id}/plant-beds/${plantBed.id}/plants`)
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
      latinName: "",
      variety: "",
      color: "",
      plantColor: "",
      height: "",
      plantHeight: "",
      plantsPerSqm: "4",
      sunPreference: 'partial-sun',
      plantingDate: "",
      expectedHarvestDate: "",
      status: "gezond",
      notes: "",
      careInstructions: "",
      wateringFrequency: "",
      fertilizerSchedule: "",
      emoji: DEFAULT_FLOWER_EMOJI,
      isStandardFlower: false,
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
            onClick={() => router.push(`/gardens/${garden.id}/plant-beds/${plantBed.id}/plants`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {plantBed.name} - Planten
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
                    <Label htmlFor="name">Bloemnaam *</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        placeholder="Typ een nieuwe bloem of kies uit de lijst..."
                        value={newPlant.name}
                        onChange={(e) => {
                          const value = e.target.value
                          setNewPlant((p) => ({
                            ...p,
                            name: value,
                          }))
                          
                          // Check if it matches a standard flower
                          const selectedFlower = STANDARD_FLOWERS.find(f => 
                            f.name.toLowerCase() === value.toLowerCase()
                          )
                          if (selectedFlower) {
                            setNewPlant((p) => ({
                              ...p,
                              name: value,
                              emoji: selectedFlower.emoji,
                              color: selectedFlower.color,
                              isStandardFlower: true,
                            }))
                          } else {
                            setNewPlant((p) => ({
                              ...p,
                              name: value,
                              emoji: p.emoji === DEFAULT_FLOWER_EMOJI ? DEFAULT_FLOWER_EMOJI : p.emoji,
                              isStandardFlower: false,
                            }))
                          }
                        }}
                        className={`${errors.name ? "border-destructive" : ""} pr-8`}
                        required
                        autoComplete="off"
                      />
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      {/* Show suggestions only when typing and there's input */}
                      {newPlant.name && newPlant.name.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {STANDARD_FLOWERS
                            .filter(flower => 
                              flower.name.toLowerCase().includes(newPlant.name.toLowerCase())
                            )
                            .slice(0, 5)
                            .map((flower) => (
                              <div
                                key={flower.name}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => {
                                  setNewPlant((p) => ({
                                    ...p,
                                    name: flower.name,
                                    emoji: flower.emoji,
                                    color: flower.color,
                                    isStandardFlower: true,
                                  }))
                                }}
                              >
                                <span>{flower.emoji}</span>
                                <span>{flower.name}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Tip: Begin te typen om uit standaard bloemen te kiezen, of typ een eigen naam
                    </p>
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
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latinName">Latijnse naam</Label>
                    <Input
                      id="latinName"
                      placeholder="Bijv. Rosa gallica"
                      value={newPlant.latinName}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          latinName: e.target.value,
                        }))
                      }
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantColor">Plant kleur</Label>
                    <Input
                      id="plantColor"
                      placeholder="Bijv. Groen, Donkergroen"
                      value={newPlant.plantColor}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          plantColor: e.target.value,
                        }))
                      }
                      autoComplete="off"
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
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantHeight">Plant hoogte (cm)</Label>
                    <Input
                      id="plantHeight"
                      type="number"
                      placeholder="Bijv. 80"
                      value={newPlant.plantHeight}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          plantHeight: e.target.value,
                        }))
                      }
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantsPerSqm">Planten per m²</Label>
                    <Input
                      id="plantsPerSqm"
                      type="number"
                      placeholder="Bijv. 4"
                      value={newPlant.plantsPerSqm}
                      onChange={(e) =>
                        setNewPlant((p) => ({
                          ...p,
                          plantsPerSqm: e.target.value,
                        }))
                      }
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sunPreference">Zonvoorkeur</Label>
                    <Select
                      value={newPlant.sunPreference}
                      onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') =>
                        setNewPlant((p) => ({
                          ...p,
                          sunPreference: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer zonvoorkeur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-sun">☀️ Volle zon</SelectItem>
                        <SelectItem value="partial-sun">⛅ Gedeeltelijke zon</SelectItem>
                        <SelectItem value="shade">🌳 Schaduw</SelectItem>
                      </SelectContent>
                    </Select>
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emoji">Emoji</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <span className="text-2xl">{newPlant.emoji}</span>
                      <span className="text-sm text-gray-600">
                        {newPlant.isStandardFlower 
                          ? "Automatisch toegewezen voor standaard bloem" 
                          : "Standaard emoji voor aangepaste bloem"}
                      </span>
                    </div>
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
                    autoComplete="off"
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
                    autoComplete="off"
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
          {createdPlantId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Taken Toevoegen
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddTask(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Taak
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                <p>
                  Plant succesvol aangemaakt! Je kunt nu taken toevoegen voor deze plant.
                </p>
              </CardContent>
            </Card>
          )}

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

      {/* Add Task Dialog */}
      {createdPlantId && (
        <AddTaskForm
          isOpen={showAddTask}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={() => {
            setShowAddTask(false)
            toast({
              title: "Taak toegevoegd!",
              description: "De taak is succesvol toegevoegd aan de plant.",
            })
          }}
          preselectedPlantId={createdPlantId}
        />
      )}
    </div>
  )
}
