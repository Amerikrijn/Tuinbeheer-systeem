"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, TreePine, Plus, AlertCircle, Calendar } from "lucide-react"
import { createGarden } from "@/lib/database"

interface NewGarden {
  name: string
  description: string
  location: string
  totalArea: string // keep as string from <input type="number">
  length: string
  width: string
  gardenType: string
  maintenanceLevel: string
  soilCondition: string
  wateringSystem: string
  establishedDate: string
  notes: string
}

export default function NewGardenPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [newGarden, setNewGarden] = React.useState<NewGarden>({
    name: "",
    description: "",
    location: "",
    totalArea: "",
    length: "",
    width: "",
    gardenType: "Gemeenschapstuin",
    maintenanceLevel: "Gemiddeld onderhoud",
    soilCondition: "",
    wateringSystem: "Handmatig",
    establishedDate: "",
    notes: "",
  })

  const gardenTypeOptions = [
    "Gemeenschapstuin",
    "Schooltuin",
    "Bedrijfstuin",
    "Buurttuin",
    "Therapeutische tuin",
    "Educatieve tuin",
    "Privétuin",
    "Botanische tuin",
  ]

  const maintenanceLevelOptions = ["Laag onderhoud", "Gemiddeld onderhoud", "Intensief onderhoud"]

  const wateringSystemOptions = [
    "Handmatig",
    "Druppelirrigatie",
    "Sprinklerinstallatie",
    "Druppelirrigatie + handmatig",
    "Regenwater opvang",
    "Automatisch systeem",
  ]

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!newGarden.name.trim()) nextErrors.name = "Tuinnaam is verplicht"
    if (!newGarden.location.trim()) nextErrors.location = "Locatie is verplicht"
    if (newGarden.length && !Number.isFinite(Number(newGarden.length))) nextErrors.length = "Lengte moet een getal zijn"
    if (newGarden.width && !Number.isFinite(Number(newGarden.width))) nextErrors.width = "Breedte moet een getal zijn"
    if (newGarden.totalArea && !Number.isFinite(Number(newGarden.totalArea)))
      nextErrors.totalArea = "Totale oppervlakte moet een getal zijn"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Formulier onvolledig",
        description: "Controleer de gemarkeerde velden en probeer opnieuw.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const garden = await createGarden({
        name: newGarden.name,
        description: newGarden.description || undefined,
        location: newGarden.location,
        total_area: newGarden.totalArea || undefined, // keep as text
        length: newGarden.length || undefined,
        width: newGarden.width || undefined,
        garden_type: newGarden.gardenType || undefined,
        maintenance_level: newGarden.maintenanceLevel || undefined,
        soil_condition: newGarden.soilCondition || undefined,
        watering_system: newGarden.wateringSystem || undefined,
        established_date: newGarden.establishedDate || undefined,
        notes: newGarden.notes || undefined,
      })

      toast({
        title: "Tuin aangemaakt!",
        description: `Tuin "${newGarden.name}" is succesvol aangemaakt.`,
      })

      if (garden) {
        router.push(`/gardens/${garden.id}`)
      } else {
        router.push("/gardens")
      }
    } catch (err: any) {
      console.error("Supabase createGarden error:", JSON.stringify(err, null, 2))
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het aanmaken van de tuin.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNewGarden({
      name: "",
      description: "",
      location: "",
      totalArea: "",
      length: "",
      width: "",
      gardenType: "Gemeenschapstuin",
      maintenanceLevel: "Gemiddeld onderhoud",
      soilCondition: "",
      wateringSystem: "Handmatig",
      establishedDate: "",
      notes: "",
    })
    setErrors({})
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/gardens")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Terug naar Tuinen
        </Button>

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Plus className="h-7 w-7 text-green-600" />
            Nieuwe Tuin Toevoegen
          </h1>
          <p className="text-muted-foreground">Voeg een nieuwe tuin toe aan je overzicht</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                Tuin Informatie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Tuinnaam *</Label>
                    <Input
                      id="name"
                      placeholder="Bijv. Gemeenschapstuin De Bloementuin"
                      value={newGarden.name}
                      onChange={(e) =>
                        setNewGarden((p) => ({
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Locatie *</Label>
                    <Input
                      id="location"
                      placeholder="Bijv. Parkstraat 123, Amsterdam"
                      value={newGarden.location}
                      onChange={(e) =>
                        setNewGarden((p) => ({
                          ...p,
                          location: e.target.value,
                        }))
                      }
                      className={errors.location ? "border-destructive" : ""}
                      required
                    />
                    {errors.location && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.location}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Lengte (meter)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={newGarden.length}
                      onChange={(e) =>
                        setNewGarden((p) => ({
                          ...p,
                          length: e.target.value,
                        }))
                      }
                      className={errors.length ? "border-destructive" : ""}
                    />
                    {errors.length && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.length}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Breedte (meter)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={newGarden.width}
                      onChange={(e) =>
                        setNewGarden((p) => ({
                          ...p,
                          width: e.target.value,
                        }))
                      }
                      className={errors.width ? "border-destructive" : ""}
                    />
                    {errors.width && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.width}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalArea">Totale oppervlakte (m²)</Label>
                    <Input
                      id="totalArea"
                      type="number"
                      value={newGarden.totalArea}
                      onChange={(e) =>
                        setNewGarden((p) => ({
                          ...p,
                          totalArea: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gardenType">Tuintype</Label>
                    <Select
                      value={newGarden.gardenType}
                      onValueChange={(value) =>
                        setNewGarden((p) => ({
                          ...p,
                          gardenType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer tuintype" />
                      </SelectTrigger>
                      <SelectContent>
                        {gardenTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenanceLevel">Onderhoudsniveau</Label>
                    <Select
                      value={newGarden.maintenanceLevel}
                      onValueChange={(value) =>
                        setNewGarden((p) => ({
                          ...p,
                          maintenanceLevel: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer onderhoudsniveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceLevelOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wateringSystem">Bewateringssysteem</Label>
                    <Select
                      value={newGarden.wateringSystem}
                      onValueChange={(value) =>
                        setNewGarden((p) => ({
                          ...p,
                          wateringSystem: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer bewateringssysteem" />
                      </SelectTrigger>
                      <SelectContent>
                        {wateringSystemOptions.map((system) => (
                          <SelectItem key={system} value={system}>
                            {system}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishedDate">Oprichtingsdatum</Label>
                    <Input
                      id="establishedDate"
                      type="date"
                      value={newGarden.establishedDate}
                      onChange={(e) =>
                        setNewGarden((p) => ({
                          ...p,
                          establishedDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="soilCondition">Grondconditie</Label>
                    <Input
                      id="soilCondition"
                      placeholder="Beschrijf de algemene grondconditie"
                      value={newGarden.soilCondition}
                      onChange={(e) =>
                        setNewGarden((p) => ({
                          ...p,
                          soilCondition: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Algemene beschrijving van de tuin..."
                    value={newGarden.description}
                    onChange={(e) =>
                      setNewGarden((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notities</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Aanvullende notities, speciale instructies, etc..."
                    value={newGarden.notes}
                    onChange={(e) =>
                      setNewGarden((p) => ({
                        ...p,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? "Opslaan…" : "Tuin Aanmaken"}
                  </Button>
                  <Button type="reset" variant="outline" disabled={loading}>
                    Reset Formulier
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tips voor het aanmaken</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-3">
              <div>
                <strong>Verplichte velden:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Tuinnaam - Kies een herkenbare naam</li>
                  <li>Locatie - Volledig adres of beschrijving</li>
                </ul>
              </div>
              <div>
                <strong>Afmetingen:</strong>
                <p>Vul de lengte en breedte in meters in voor een betere planning van plantvakken.</p>
              </div>
              <div>
                <strong>Tuintype:</strong>
                <p>Kies het juiste type voor betere organisatie en rapportage.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Na het aanmaken
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <p>Na het aanmaken van de tuin kun je:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Plantvakken toevoegen</li>
                <li>Planten per vak beheren</li>
                <li>Verzorgingsschema's opstellen</li>
                <li>Voortgang bijhouden</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
