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
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf, Plus, AlertCircle, Sun } from "lucide-react"
import { createPlantBed, getGarden } from "@/lib/database"
import type { Garden } from "@/lib/supabase"

interface NewPlantBed {
  id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: "full-sun" | "partial-sun" | "shade" | ""
  description: string
}

export default function NewPlantBedPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

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

  const [newPlantBed, setNewPlantBed] = React.useState<NewPlantBed>({
    id: "",
    name: "",
    location: "",
    size: "",
    soilType: "",
    sunExposure: "",
    description: "",
  })

  React.useEffect(() => {
    const loadGarden = async () => {
      try {
        const gardenData = await getGarden(params.id as string)
        setGarden(gardenData)
      } catch (error) {
        console.error("Error loading garden:", error)
        toast({
          title: "Fout",
          description: "Kon tuin niet laden.",
          variant: "destructive",
        })
      }
    }

    loadGarden()
  }, [params.id, toast])

  const sunExposureOptions = [
    { value: "full-sun", label: "Volle zon (6+ uur direct zonlicht)" },
    { value: "partial-sun", label: "Gedeeltelijke zon (3-6 uur zonlicht)" },
    { value: "shade", label: "Schaduw (minder dan 3 uur zonlicht)" },
  ]

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!newPlantBed.id.trim()) nextErrors.id = "Plantvak ID is verplicht"
    if (!newPlantBed.name.trim()) nextErrors.name = "Plantvak naam is verplicht"
    // Location is optional - removed validation

    // Validate ID format (letters, numbers, hyphens only)
    if (newPlantBed.id && !/^[a-zA-Z0-9-]+$/.test(newPlantBed.id)) {
      nextErrors.id = "ID mag alleen letters, cijfers en streepjes bevatten"
    }

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

    if (!garden) {
      toast({
        title: "Fout",
        description: "Tuin informatie niet beschikbaar.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const plantBed = await createPlantBed({
        id: newPlantBed.id,
        garden_id: garden.id,
        name: newPlantBed.name,
        location: newPlantBed.location || undefined,
        size: newPlantBed.size || undefined,
        soil_type: newPlantBed.soilType || undefined,
        sun_exposure: newPlantBed.sunExposure || undefined,
        description: newPlantBed.description || undefined,
      })

      toast({
        title: "Plantvak aangemaakt!",
        description: `Plantvak "${newPlantBed.name}" is succesvol aangemaakt.`,
      })

      if (plantBed) {
        router.push(`/gardens/${garden.id}/plant-beds/${plantBed.id}`)
      } else {
        router.push(`/gardens/${garden.id}/plant-beds`)
      }
    } catch (err) {
      console.error("Error creating plant bed:", err)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het aanmaken van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNewPlantBed({
      id: "",
      name: "",
      location: "",
      size: "",
      soilType: "",
      sunExposure: "",
      description: "",
    })
    setErrors({})
  }

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
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
            onClick={() => router.push(`/gardens/${garden.id}/plant-beds`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Plantvakken
          </Button>

          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <Plus className="h-7 w-7 text-green-600" />
              Nieuw Plantvak Toevoegen
            </h1>
            <p className="text-muted-foreground">Voeg een nieuw plantvak toe aan {garden.name}</p>
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
                Plantvak Informatie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="id">Plantvak ID *</Label>
                    <Input
                      id="id"
                      placeholder="Bijv. A1, NOORD-01, VAK-001"
                      value={newPlantBed.id}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          id: e.target.value.toUpperCase(),
                        }))
                      }
                      className={errors.id ? "border-destructive" : ""}
                      required
                    />
                    {errors.id && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.id}
                      </div>
                    )}
                    <p className="text-xs text-gray-600">Unieke identificatie voor dit plantvak</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Plantvak Naam *</Label>
                    <Input
                      id="name"
                      placeholder="Bijv. Noordelijke Border, Kruidentuin"
                      value={newPlantBed.name}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
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
                    <Label htmlFor="location">Locatie in Tuin *</Label>
                    <Input
                      id="location"
                      placeholder="Bijv. Noordoosthoek, Langs het hek, Midden van de tuin"
                      value={newPlantBed.location}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
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
                    <Label htmlFor="size">Grootte</Label>
                    <Input
                      id="size"
                      placeholder="Bijv. 2x3m, 6m², Klein, Groot"
                      value={newPlantBed.size}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          size: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Grondtype</Label>
                    <Input
                      id="soilType"
                      placeholder="Bijv. Klei, Zand, Leem, Potgrond"
                      value={newPlantBed.soilType}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          soilType: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="sunExposure">Zonligging</Label>
                    <Select
                      value={newPlantBed.sunExposure}
                      onValueChange={(value) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          sunExposure: value as "full-sun" | "partial-sun" | "shade",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer zonligging" />
                      </SelectTrigger>
                      <SelectContent>
                        {sunExposureOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Sun
                                className={`h-4 w-4 ${
                                  option.value === "full-sun"
                                    ? "text-yellow-500"
                                    : option.value === "partial-sun"
                                      ? "text-orange-500"
                                      : "text-gray-500"
                                }`}
                              />
                              {option.label}
                            </div>
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
                    rows={4}
                    placeholder="Beschrijf het plantvak, bijzonderheden, doelstellingen..."
                    value={newPlantBed.description}
                    onChange={(e) =>
                      setNewPlantBed((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? "Opslaan…" : "Plantvak Aanmaken"}
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
              <CardTitle>Tips voor Plantvakken</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-3">
              <div>
                <strong>Plantvak ID:</strong>
                <p>Kies een logisch systeem zoals A1, B2 of NOORD-01 voor gemakkelijke identificatie.</p>
              </div>
              <div>
                <strong>Locatie:</strong>
                <p>Beschrijf de precieze locatie binnen de tuin voor vrijwilligers.</p>
              </div>
              <div>
                <strong>Zonligging:</strong>
                <p>Belangrijk voor het kiezen van de juiste planten voor dit vak.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Na het aanmaken
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <p>Na het aanmaken van het plantvak kun je:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Planten toevoegen aan dit vak</li>
                <li>Verzorgingsschema opstellen</li>
                <li>Voortgang bijhouden</li>
                <li>Foto's toevoegen</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
