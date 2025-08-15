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
import { ArrowLeft, Plus, AlertCircle, Sun, CloudSun, Cloud } from "lucide-react"
import { createPlantBed } from "@/lib/database"
import { useParams } from "next/navigation"

interface NewPlantBed {
  name: string
  description: string
  location: string
  size: string
  soil_type: string
  sun_exposure: 'full-sun' | 'partial-sun' | 'shade'
  season_year: number
}

export default function NewPlantBedPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [newPlantBed, setNewPlantBed] = React.useState<NewPlantBed>({
    name: "",
    description: "",
    location: "",
    size: "",
    soil_type: "",
    sun_exposure: "full-sun",
    season_year: new Date().getFullYear(),
  })

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!newPlantBed.name.trim()) nextErrors.name = "Plantvak naam is verplicht"
    if (!newPlantBed.location.trim()) nextErrors.location = "Locatie is verplicht"
    if (!newPlantBed.size.trim()) nextErrors.size = "Afmetingen zijn verplicht"

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
      const plantBed = await createPlantBed({
        name: newPlantBed.name,
        description: newPlantBed.description || undefined,
        garden_id: params.id as string,
        location: newPlantBed.location,
        size: newPlantBed.size,
        soil_type: newPlantBed.soil_type || undefined,
        sun_exposure: newPlantBed.sun_exposure,
        season_year: newPlantBed.season_year,
      })

      toast({
        title: "Plantvak aangemaakt!",
        description: `Plantvak "${newPlantBed.name}" is succesvol aangemaakt met letter code.`,
      })

      if (plantBed) {
        router.push(`/gardens/${params.id}/plant-beds`)
      } else {
        router.push(`/gardens/${params.id}/plant-beds`)
      }
    } catch (err) {
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
      name: "",
      description: "",
      location: "",
      size: "",
      soil_type: "",
      sun_exposure: "full-sun",
      season_year: new Date().getFullYear(),
    })
    setErrors({})
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/gardens/${params.id}/plant-beds`)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Terug naar Plantvakken
        </Button>

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Plus className="h-7 w-7 text-green-600" />
            Nieuw Plantvak Toevoegen
          </h1>
          <p className="text-muted-foreground">Voeg een nieuw plantvak toe aan je tuin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Plantvak Informatie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Plantvak Naam *</Label>
                    <Input
                      id="name"
                      placeholder="Bijv. Groenteveld Noord"
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
                    <Label htmlFor="location">Locatie *</Label>
                    <Input
                      id="location"
                      placeholder="Bijv. Noordkant van de tuin"
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
                    <Label htmlFor="size">Afmetingen *</Label>
                    <Input
                      id="size"
                      placeholder="Bijv. 4x3 meter"
                      value={newPlantBed.size}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          size: e.target.value,
                        }))
                      }
                      className={errors.size ? "border-destructive" : ""}
                      required
                    />
                    {errors.size && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.size}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season_year">Seizoen Jaar</Label>
                    <Input
                      id="season_year"
                      type="number"
                      value={newPlantBed.season_year}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          season_year: parseInt(e.target.value) || new Date().getFullYear(),
                        }))
                      }
                      min={2020}
                      max={2030}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sun_exposure">Zonligging</Label>
                    <Select
                      value={newPlantBed.sun_exposure}
                      onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') =>
                        setNewPlantBed((p) => ({
                          ...p,
                          sun_exposure: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-sun">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4 text-yellow-500" />
                            Volle zon
                          </div>
                        </SelectItem>
                        <SelectItem value="partial-sun">
                          <div className="flex items-center gap-2">
                            <CloudSun className="h-4 w-4 text-orange-500" />
                            Halfschaduw
                          </div>
                        </SelectItem>
                        <SelectItem value="shade">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-gray-500" />
                            Schaduw
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soil_type">Grondsoort</Label>
                    <Input
                      id="soil_type"
                      placeholder="Bijv. Klei, Zand, Potgrond"
                      value={newPlantBed.soil_type}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          soil_type: e.target.value,
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
                    placeholder="Beschrijving van het plantvak..."
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
              <CardTitle>Automatische Letter Toewijzing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-3">
              <div>
                <strong>Hoe werkt het:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Het eerste plantvak krijgt automatisch letter "A"</li>
                  <li>Het tweede plantvak krijgt automatisch letter "B"</li>
                  <li>En zo verder tot letter "Z"</li>
                </ul>
              </div>
              <div>
                <strong>Voordelen:</strong>
                <p>Geen gedoe meer met namen bedenken - het systeem regelt het automatisch!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips voor het aanmaken</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-3">
              <div>
                <strong>Verplichte velden:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Plantvak Naam - Kies een herkenbare naam</li>
                  <li>Locatie - Beschrijf waar het plantvak zich bevindt</li>
                  <li>Afmetingen - Voer lengte x breedte in meters in</li>
                </ul>
              </div>
              <div>
                <strong>Optionele velden:</strong>
                <p>Zonligging, grondsoort en beschrijving helpen bij het beheren van je planten.</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}