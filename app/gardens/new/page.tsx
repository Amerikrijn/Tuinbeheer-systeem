"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

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
  establishedDate: string
  notes: string
}

export default function NewGardenPage() {
  const router = useRouter()
  const { toast } = useToast()

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

  const [newGarden, setNewGarden] = React.useState<NewGarden>({
    name: "",
    description: "",
    location: "",
    totalArea: "",
    length: "",
    width: "",
    gardenType: "Gemeenschapstuin",
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

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!newGarden.name.trim()) nextErrors.name = "Tuinnaam is verplicht"
    if (!newGarden.location.trim()) nextErrors.location = "Locatie is verplicht"
    if (newGarden.length && !Number.isFinite(Number(newGarden.length))) nextErrors.length = "Lengte moet een getal zijn"
    if (newGarden.width && !Number.isFinite(Number(newGarden.width))) nextErrors.width = "Breedte moet een getal zijn"
    if (newGarden.totalArea && !Number.isFinite(Number(newGarden.totalArea)))
      nextErrors.totalArea = "Totale oppervlakte moet een getal zijn"

    // Validate minimum garden size for plant beds
    if (newGarden.length && newGarden.width) {
      const length = parseFloat(newGarden.length)
      const width = parseFloat(newGarden.width)
      if (!isNaN(length) && !isNaN(width)) {
        if (length < 2 || width < 2) {
          nextErrors.length = length < 2 ? "Minimale lengte is 2 meter voor plantvakken" : nextErrors.length
          nextErrors.width = width < 2 ? "Minimale breedte is 2 meter voor plantvakken" : nextErrors.width
        }
        const area = length * width
        if (area < 4) {
          nextErrors.totalArea = "Tuin moet minimaal 4m² zijn voor plantvakken"
        }
      }
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

    setLoading(true)
    try {
      // Calculate square meters automatically if length and width are provided
      let calculatedTotalArea = newGarden.totalArea
      if (newGarden.length && newGarden.width && !newGarden.totalArea) {
        const length = parseFloat(newGarden.length)
        const width = parseFloat(newGarden.width)
        if (!isNaN(length) && !isNaN(width)) {
          calculatedTotalArea = (length * width).toString()
        }
      }

      const garden = await createGarden({
        name: newGarden.name,
        description: newGarden.description || undefined,
        location: newGarden.location,
        total_area: calculatedTotalArea || undefined, // keep as text
        length: newGarden.length || undefined,
        width: newGarden.width || undefined,
        garden_type: newGarden.gardenType || undefined,
        established_date: newGarden.establishedDate || undefined,
        notes: newGarden.notes || undefined,
      })

      toast({
        title: "Tuin aangemaakt!",
        description: `Tuin "${newGarden.name}" is succesvol aangemaakt.`,
      })

      if (garden) {
        window.location.href = `/gardens/${garden.id}`
      } else {
        window.location.href = "/gardens"
      }
    } catch (err) {
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
      establishedDate: "",
      notes: "",
    })
    setErrors({})
  }

  return (
    <div className="container mx-auto space-y-4 p-4">
      {/* Minimalist Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            console.log('Navigating back to gardens')
            window.location.href = "/gardens"
          }} 
          className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug
        </Button>

        <div className="flex items-center gap-2">
          <Plus className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-semibold">Nieuwe Tuin</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TreePine className="h-5 w-5 text-green-600" />
                Tuin Informatie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">Tuinnaam *</Label>
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
                      <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location" className="text-sm font-medium">Locatie *</Label>
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
                      <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {errors.location}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length" className="text-sm font-medium">Lengte (meter)</Label>
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
                      <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {errors.length}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width" className="text-sm font-medium">Breedte (meter)</Label>
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
                      <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {errors.width}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalArea" className="text-sm font-medium">
                      Totale oppervlakte (m²)
                      {newGarden.length && newGarden.width && !newGarden.totalArea && (
                        <span className="text-sm text-green-600 ml-2">
                          (Berekend: {(parseFloat(newGarden.length) * parseFloat(newGarden.width)).toFixed(1)} m²)
                        </span>
                      )}
                    </Label>
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
                      placeholder={
                        newGarden.length && newGarden.width && !newGarden.totalArea
                          ? `${(parseFloat(newGarden.length) * parseFloat(newGarden.width)).toFixed(1)} (automatisch berekend)`
                          : "Voer oppervlakte handmatig in"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gardenType" className="text-sm font-medium">Tuintype</Label>
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
                    <Label htmlFor="establishedDate" className="text-sm font-medium">Oprichtingsdatum</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Beschrijving</Label>
                  <Textarea
                    id="description"
                    rows={3}
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
                  <Label htmlFor="notes" className="text-sm font-medium">Notities</Label>
                  <Textarea
                    id="notes"
                    rows={2}
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

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 h-9 px-4">
                    {loading ? "Opslaan…" : "Tuin Aanmaken"}
                  </Button>
                  <Button type="reset" variant="outline" disabled={loading} className="h-9 px-4">
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong className="text-green-700 dark:text-green-300">Verplichte velden:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Tuinnaam - Kies een herkenbare naam</li>
                  <li>Locatie - Volledig adres of beschrijving</li>
                </ul>
              </div>
              <div>
                <strong className="text-green-700 dark:text-green-300">Afmetingen:</strong>
                <p className="text-xs">Vul lengte en breedte in voor betere planning van plantvakken.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Na het aanmaken
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc list-inside space-y-1 text-xs">
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
