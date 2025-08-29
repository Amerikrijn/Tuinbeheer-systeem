"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Home, Leaf, Plus, AlertCircle } from "lucide-react"
import { getMockPlantBeds } from "@/lib/mock-data"

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface NewPlantBed {
  id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: string
  description: string
  notes: string
}

/* -------------------------------------------------------------------------- */
/*                            Component Definition                            */
/* -------------------------------------------------------------------------- */

export default function NewPlantBedPage() {
  const router = useRouter()
  const { toast } = useToast()

  /* --------------------------------- State -------------------------------- */

  const [loading, setLoading] = React.useState(false)
  const [existingIds, setExistingIds] = React.useState<string[]>([])
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [newPlantBed, setNewPlantBed] = React.useState<NewPlantBed>({
    id: "",
    name: "",
    location: "",
    size: "Gemiddeld (5-15 m²)",
    soilType: "",
    sunExposure: "full-sun",
    description: "",
    notes: "",
  })

  /* ------------------------------ Side-effects ---------------------------- */

  React.useEffect(() => {
    // Load existing plant-bed IDs so we can prevent duplicates
    const beds = getMockPlantBeds()
    setExistingIds(beds.map((b) => b.id.toLowerCase()))
  }, [])

  /* ------------------------------- Helpers -------------------------------- */

  const sizeOptions = ["Klein (< 5 m²)", "Gemiddeld (5-15 m²)", "Groot (15-30 m²)", "Extra groot (> 30 m²)"]

  const soilTypeOptions = [
    "Kleigrond",
    "Zandgrond",
    "Leemgrond",
    "Veengrond",
    "Potgrond",
    "Kleigrond met compost",
    "Zandgrond met compost",
    "Humusrijke grond",
  ]

  const sunExposureOptions = [
    { value: "full-sun", label: "Volle zon (6+ uur/dag)" },
    { value: "partial-sun", label: "Gedeeltelijke zon (3-6 uur/dag)" },
    { value: "shade", label: "Schaduw (< 3 uur/dag)" },
  ]

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    // ID
    if (!newPlantBed.id.trim()) {
      nextErrors.id = "Plantvak-ID is verplicht"
    } else if (!/^[A-Z0-9]+$/i.test(newPlantBed.id)) {
      nextErrors.id = "ID mag alleen letters en cijfers bevatten"
    } else if (existingIds.includes(newPlantBed.id.toLowerCase())) {
      nextErrors.id = "Dit ID bestaat al"
    }

    // Name
    if (!newPlantBed.name.trim()) nextErrors.name = "Naam is verplicht"

    // Location
    if (!newPlantBed.location.trim()) nextErrors.location = "Locatie is verplicht"

    // Soil
    if (!newPlantBed.soilType.trim()) nextErrors.soilType = "Grondsoort is verplicht"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  /* ------------------------------ Handlers -------------------------------- */

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
      // Simuleer een API-call
      await new Promise((res) => setTimeout(res, 1500))

      toast({
        title: "Plantvak aangemaakt!",
        description: `Plantvak ${newPlantBed.id.toUpperCase()} (${newPlantBed.name}) is succesvol aangemaakt.`,
      })
      router.push("/admin/plant-beds")
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
      id: "",
      name: "",
      location: "",
      size: "Gemiddeld (5-15 m²)",
      soilType: "",
      sunExposure: "full-sun",
      description: "",
      notes: "",
    })
    setErrors({})
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/*                            Page header                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center gap-4">
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
          Plantvakken
        </Button>

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Plus className="h-7 w-7 text-green-600" />
            Nieuw plantvak
          </h1>
          <p className="text-muted-foreground">Voeg een nieuw plantvak toe aan de tuin</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                                Form                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---------------------------- Left column ------------------------ */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Plantvak-informatie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
                {/* -------------------- Basic fields ------------------- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* ID */}
                  <div className="space-y-2">
                    <Label htmlFor="id">Plantvak-ID *</Label>
                    <Input
                      id="id"
                      placeholder="Bijv. A1, B, C2"
                      value={newPlantBed.id}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          id: e.target.value.toUpperCase(),
                        }))
                      }
                      className={errors.id ? "border-destructive" : ""}
                      maxLength={5}
                      required
                    />
                    {errors.id && <ErrorMsg message={errors.id} />}
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      placeholder="Bijv. Rozenbed"
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
                    {errors.name && <ErrorMsg message={errors.name} />}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Locatie *</Label>
                    <Input
                      id="location"
                      placeholder="Bijv. Noordkant tuin"
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
                    {errors.location && <ErrorMsg message={errors.location} />}
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <Label htmlFor="size">Grootte</Label>
                    <Select
                      value={newPlantBed.size}
                      onValueChange={(value) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          size: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grootte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Soil type */}
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Grondsoort *</Label>
                    <Select
                      value={newPlantBed.soilType}
                      onValueChange={(value) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          soilType: value,
                        }))
                      }
                    >
                      <SelectTrigger className={errors.soilType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Kies grondsoort" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.soilType && <ErrorMsg message={errors.soilType} />}
                  </div>

                  {/* Sun exposure */}
                  <div className="space-y-2">
                    <Label htmlFor="sunExposure">Zonlicht</Label>
                    <Select
                      value={newPlantBed.sunExposure}
                      onValueChange={(value) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          sunExposure: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zonlicht" />
                      </SelectTrigger>
                      <SelectContent>
                        {sunExposureOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ------------------ Description / notes -------------- */}
                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Optionele beschrijving…"
                    value={newPlantBed.description}
                    onChange={(e) =>
                      setNewPlantBed((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notities</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Optionele notities…"
                    value={newPlantBed.notes}
                    onChange={(e) =>
                      setNewPlantBed((p) => ({
                        ...p,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* ------------------ Form actions --------------------- */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Opslaan…" : "Opslaan"}
                  </Button>
                  <Button type="reset" variant="outline" disabled={loading}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* --------------------------- Sidebar ----------------------- */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <p>
                • Kies een uniek ID van max. 5 tekens. <br />• Geef een duidelijke naam en locatie. <br />• Controleer
                of de grondsoort overeenkomt met de geplande beplanting.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Helper components                            */
/* -------------------------------------------------------------------------- */

function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1 text-destructive text-sm">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  )
}
