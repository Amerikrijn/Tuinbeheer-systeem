"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Leaf, Plus, Sun, Palette, MapPin, Ruler, Droplets } from "lucide-react"
import { useGarden } from "@/hooks/use-garden"
import { PlantvakService } from "@/lib/services/plantvak.service"

interface NewPlantBed {
  location: string
  size: string
  soilType: string
  sunExposure: "full-sun" | "partial-sun" | "shade" | ""
  description: string
}

const sunExposureOptions = [
  { value: "full-sun", label: "Volle zon" },
  { value: "partial-sun", label: "Halfschaduw" },
  { value: "shade", label: "Schaduw" },
]

const soilTypeOptions = [
  { value: "klei", label: "Klei" },
  { value: "zand", label: "Zand" },
  { value: "leem", label: "Leem" },
  { value: "veen", label: "Veen" },
  { value: "gemengd", label: "Gemengd" },
]

export default function NewPlantBedPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { garden, isLoading } = useGarden(params.id)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [newPlantBed, setNewPlantBed] = useState<NewPlantBed>({
    location: "",
    size: "",
    soilType: "",
    sunExposure: "",
    description: "",
  })

  const goBack = () => router.back()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!newPlantBed.size.trim()) {
      newErrors.size = "Grootte is verplicht"
    }
    if (!newPlantBed.soilType) {
      newErrors.soilType = "Bodemtype is verplicht"
    }
    if (!newPlantBed.sunExposure) {
      newErrors.sunExposure = "Zonligging is verplicht"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const plantBed = await PlantvakService.create({
        garden_id: garden!.id,
        location: newPlantBed.location.trim() || undefined,
        size: newPlantBed.size,
        soil_type: newPlantBed.soilType,
        sun_exposure: newPlantBed.sunExposure as "full-sun" | "partial-sun" | "shade",
        description: newPlantBed.description,
      })

      if (plantBed) {
        toast({
          title: "Plantvak aangemaakt!",
          description: `Plantvak "${plantBed.letter_code}" is succesvol aangemaakt met letter code ${plantBed.letter_code || '?'}.`,
        })

        // Show additional success message with letter code
        setTimeout(() => {
          toast({
            title: `Letter Code: ${plantBed.letter_code}`,
            description: `Je kunt nu plantvak ${plantBed.letter_code} gebruiken om taken toe te voegen en bloemen te planten.`,
          })
        }, 1000)
        
        router.push(`/gardens/${garden!.id}/plantvak-view/${plantBed.id}`)
      } else {
        throw new Error('Failed to create plantvak')
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
      location: "",
      size: "",
      soilType: "",
      sunExposure: "",
      description: "",
    })
    setErrors({})
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Tuin niet gevonden</h1>
          <p className="text-gray-600 mt-2">De opgevraagde tuin bestaat niet.</p>
          <Button onClick={goBack} className="mt-4">
            Terug
          </Button>
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
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>

          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <Plus className="h-7 w-7 text-green-600" />
              Nieuw Plantvak Toevoegen
            </h1>
            <p className="text-muted-foreground">Voeg een nieuw plantvak toe aan {garden.name}</p>
          </div>
        </div>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Locatie</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Bijv. Noordwest hoek, achter de schuur"
                        value={newPlantBed.location}
                        onChange={(e) =>
                          setNewPlantBed((p) => ({ ...p, location: e.target.value }))
                        }
                        className="pl-10"
                      />
                    </div>

                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Grootte *</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="size"
                        placeholder="Bijv. 2x3 meter, 6m²"
                        value={newPlantBed.size}
                        onChange={(e) =>
                          setNewPlantBed((p) => ({ ...p, size: e.target.value }))
                        }
                        className={`pl-10 ${errors.size ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.size && (
                      <p className="text-sm text-red-500">{errors.size}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Bodemtype *</Label>
                    <Select
                      value={newPlantBed.soilType}
                      onValueChange={(value) =>
                        setNewPlantBed((p) => ({ ...p, soilType: value }))
                      }
                    >
                      <SelectTrigger className={errors.soilType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecteer bodemtype" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.soilType && (
                      <p className="text-sm text-red-500">{errors.soilType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sunExposure">Zonligging *</Label>
                    <Select
                      value={newPlantBed.sunExposure}
                      onValueChange={(value) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          sunExposure: value as "full-sun" | "partial-sun" | "shade",
                        }))
                      }
                    >
                      <SelectTrigger className={errors.sunExposure ? "border-red-500" : ""}>
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
                    {errors.sunExposure && (
                      <p className="text-sm text-red-500">{errors.sunExposure}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      placeholder="Optionele beschrijving van het plantvak..."
                      value={newPlantBed.description}
                      onChange={(e) =>
                        setNewPlantBed((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Letter Code Preview */}
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-800 text-lg font-bold rounded-full flex items-center justify-center">
                        ?
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Letter Code Preview</h4>
                        <p className="text-sm text-blue-700">
                          Dit plantvak krijgt automatisch de volgende beschikbare letter toegewezen.
                          {newPlantBed.name && (
                            <span className="block mt-1">
                              <strong>Plantvak:</strong> {newPlantBed.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? "Opslaan…" : "Plantvak Aanmaken"}
                  </Button>
                  <Button type="reset" variant="outline" disabled={loading} onClick={handleReset}>
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
                <strong>Letter Code:</strong>
                <p>Elk plantvak krijgt automatisch een unieke letter toegewezen (A, B, C, etc.) voor gemakkelijke identificatie.</p>
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
        </aside>
      </div>
    </div>
  )
}
