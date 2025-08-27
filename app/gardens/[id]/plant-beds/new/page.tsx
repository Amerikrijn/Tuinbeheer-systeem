"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Leaf, Plus, Sun, MapPin, Ruler, Droplets, Hash } from "lucide-react"
import { PlantvakService } from "@/lib/services/plantvak.service"
import { getGarden } from "@/lib/database"
import type { Tuin } from "@/lib/types/index"

// Type alias for backward compatibility
type Garden = Tuin

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

export default function NewPlantBedPage() {
  const router = useRouter()
  const params = useParams()
  const gardenId = params.id as string
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [nextLetterCode, setNextLetterCode] = useState<string>("...")
  const [existingPlantvakken, setExistingPlantvakken] = useState<any[]>([])

  const [newPlantBed, setNewPlantBed] = useState<NewPlantBed>({
    location: "",
    size: "",
    soilType: "",
    sunExposure: "",
    description: "",
  })

  // Load garden data and calculate next letter code
  useEffect(() => {
    const loadGardenAndCalculateLetter = async () => {
      try {
        const gardenData = await getGarden(gardenId)
        setGarden(gardenData)
        
        // Get existing plantvakken and calculate next letter code
        const existingPlantvakken = await PlantvakService.getByGarden(gardenId)
        setExistingPlantvakken(existingPlantvakken)
        
        const existingCodes = existingPlantvakken.map(p => p.letter_code).filter(Boolean)
        
        // Generate next available letter code
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let nextCode = 'A'
        
        for (const letter of alphabet) {
          if (!existingCodes.includes(letter)) {
            nextCode = letter
            break
          }
        }
        
        // If all letters are used, start with A1, A2, etc.
        if (nextCode === 'A' && existingCodes.includes('A')) {
          let counter = 1
          while (existingCodes.includes(`A${counter}`)) {
            counter++
          }
          nextCode = `A${counter}`
        }
        
        setNextLetterCode(nextCode)
        console.log('🔤 Next letter code calculated:', nextCode)
      } catch (error) {
        console.error('Error loading garden:', error)
        toast({
          title: "Fout",
          description: "Kon tuin niet laden.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (gardenId) {
      loadGardenAndCalculateLetter()
    }
  }, [gardenId])

  const goBack = () => router.back()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Location is now optional - removed validation
    
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
      // Log the exact data being sent
      const plantvakData = {
        garden_id: gardenId,
        location: newPlantBed.location,
        size: newPlantBed.size,
        soil_type: newPlantBed.soilType,
        sun_exposure: newPlantBed.sunExposure as "full-sun" | "partial-sun" | "shade",
        description: newPlantBed.description,
      }
      
      console.log('🔍 Form data being sent to PlantvakService:', JSON.stringify(plantvakData, null, 2))
      console.log('🔍 Garden ID type:', typeof gardenId, 'Value:', gardenId)
      console.log('🔍 Garden ID valid UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(gardenId))

      const plantBed = await PlantvakService.create(plantvakData)

      if (plantBed) {
        console.log('✅ Plantvak created successfully:', plantBed)
        toast({
          title: "Plantvak aangemaakt!",
          description: `Plantvak "${plantBed.name}" is succesvol aangemaakt met letter code ${plantBed.letter_code}.`,
        })

        // Show additional success message with letter code
        setTimeout(() => {
          toast({
            title: `Letter Code: ${plantBed.letter_code}`,
            description: `Je kunt nu plantvak ${plantBed.letter_code} gebruiken om taken toe te voegen en bloemen te planten.`,
          })
        }, 1000)
        
        router.push(`/gardens/${gardenId}/plant-beds/${plantBed.id}`)
      } else {
        console.error('❌ PlantvakService.create returned null')
        throw new Error('Failed to create plantvak - service returned null')
      }
    } catch (err) {
      console.error("❌ Error creating plant bed:", err)
      if (err && typeof err === 'object' && 'message' in err) {
        console.error("❌ Error details:", {
          message: (err as any).message,
          stack: (err as any).stack,
          name: (err as any).name
        })
      }
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
                {/* Automatic Letter Code Assignment - Prominent Display */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-800 text-3xl font-bold rounded-full flex items-center justify-center border-4 border-blue-300">
                      {nextLetterCode}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 text-xl mb-2">Automatische Plantvak Naam</h4>
                      <p className="text-blue-700 mb-3">
                        Dit plantvak krijgt <strong>automatisch</strong> de naam <strong className="text-2xl">{nextLetterCode}</strong>.
                      </p>
                      <p className="text-blue-600 text-sm">
                        De letter code wordt automatisch de naam van het plantvak.
                      </p>
                      
                      {/* Show existing plantvakken */}
                      {existingPlantvakken.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-blue-600 mb-2">Bestaande plantvakken in deze tuin:</p>
                          <div className="flex flex-wrap gap-2">
                            {existingPlantvakken.map((plantvak, index) => (
                              <span 
                                key={plantvak.id}
                                className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 text-sm font-bold rounded-full border-2 border-green-300"
                              >
                                {plantvak.letter_code || '?'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {existingPlantvakken.length === 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          🎉 Dit is het eerste plantvak in deze tuin!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Locatie (optioneel)</Label>
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
              <CardTitle>Automatische Letter Codes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-3">
              <div>
                <strong>Hoe het werkt:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Eerste plantvak → <strong>A</strong></li>
                  <li>Tweede plantvak → <strong>B</strong></li>
                  <li>Derde plantvak → <strong>C</strong></li>
                  <li>Enzovoort...</li>
                  <li>Na Z → <strong>A1, A2, A3...</strong></li>
                </ul>
              </div>
              <div>
                <strong>Voordelen:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Geen handmatige invoer nodig</li>
                  <li>Altijd unieke codes</li>
                  <li>Logische volgorde</li>
                  <li>Gemakkelijk te onthouden</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
