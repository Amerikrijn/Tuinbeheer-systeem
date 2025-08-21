"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Leaf } from "lucide-react"
import { PlantForm, createInitialPlantFormData, type PlantFormData, type PlantFormErrors } from "@/components/ui/plant-form"
import { getSupabaseClient } from '@/lib/supabase'
import { useToast } from "@/hooks/use-toast"

export default function NewPlantPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = React.useState<PlantFormData>(createInitialPlantFormData())
  const [errors, setErrors] = React.useState<PlantFormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Clear any dialog states that might be stuck
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'unset'
      const dialogs = document.querySelectorAll('[role="dialog"]')
      dialogs.forEach(dialog => {
        if (dialog.getAttribute('data-state') === 'open') {
          dialog.setAttribute('data-state', 'closed')
        }
      })
    }
  }, [])

  const validateForm = (data: PlantFormData): PlantFormErrors => {
    const newErrors: PlantFormErrors = {}

    if (!data.name.trim()) {
      newErrors.name = "Plantnaam is verplicht"
    }

    if (!data.color.trim()) {
      newErrors.color = "Kleur is verplicht"
    }

    if (!data.height.trim()) {
      newErrors.height = "Hoogte is verplicht"
    } else if (isNaN(Number(data.height)) || Number(data.height) <= 0) {
      newErrors.height = "Hoogte moet een positief getal zijn"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = validateForm(formData)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Formulier onvolledig",
        description: "Controleer de gemarkeerde velden en probeer opnieuw.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const supabase = getSupabaseClient()
      
      // Create plant without requiring plant_bed_id, position, etc.
      // This creates a plant in the general catalog
      const { data, error } = await supabase
        .from('plants')
        .insert({
          name: formData.name,
          scientific_name: formData.scientificName || null,
          variety: formData.variety || null,
          color: formData.color,
          height: Number(formData.height),
          plants_per_sqm: formData.plantsPerSqm ? Number(formData.plantsPerSqm) : null,
          sun_preference: formData.sunPreference,
          planting_date: formData.plantingDate || null,
          expected_harvest_date: formData.expectedHarvestDate || null,
          status: formData.status,
          notes: formData.notes || null,
          care_instructions: formData.careInstructions || null,
          watering_frequency: formData.wateringFrequency ? Number(formData.wateringFrequency) : null,
          fertilizer_schedule: formData.fertilizerSchedule || null,
          emoji: formData.emoji,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Plant aangemaakt!",
        description: `Plant "${formData.name}" is succesvol toegevoegd aan je collectie.`,
      })

      // Redirect to the new plant's detail page
      router.push(`/plants/${data.id}`)
      
    } catch (error) {
      console.error('Error creating plant:', error)
      
      let errorMessage = "Er ging iets mis bij het aanmaken van de plant."
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message: string }
        if (err.message.includes('plant_bed_id')) {
          errorMessage = "Deze plant moet aan een plantvak worden toegevoegd. Ga naar een tuin en voeg de plant daar toe."
        } else if (err.message.includes('duplicate') || err.message.includes('unique')) {
          errorMessage = "Er bestaat al een plant met deze naam."
        } else {
          errorMessage = err.message
        }
      }
      
      toast({
        title: "Fout bij aanmaken",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(createInitialPlantFormData())
    setErrors({})
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
          <Link href="/plants">
            <ArrowLeft className="h-4 w-4" />
            Terug naar Planten
          </Link>
        </Button>

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Plus className="h-7 w-7 text-green-600" />
            Nieuwe Plant Toevoegen
          </h1>
          <p className="text-muted-foreground">Voeg een nieuwe plant toe aan je collectie</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <PlantForm
            data={formData}
            errors={errors}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onReset={handleReset}
            submitLabel="Plant Toevoegen"
            isSubmitting={isSubmitting}
            showAdvanced={true}
          />
        </div>

        {/* Sidebar with tips */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Tips voor het toevoegen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-3">
              <div>
                <strong>Verplichte velden:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Plantnaam - Kies een herkenbare naam</li>
                  <li>Kleur - Hoofdkleur van de bloem</li>
                  <li>Hoogte - Gemiddelde hoogte in centimeters</li>
                </ul>
              </div>
              <div>
                <strong>Standaard bloemen:</strong>
                <p>Type de naam van bekende bloemen zoals "Roos" of "Tulp" voor automatische suggesties.</p>
              </div>
              <div>
                <strong>Aanvullende informatie:</strong>
                <p>Vul optionele velden in voor betere planning en verzorging.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-600">ℹ️</span>
                Na het toevoegen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <p>Na het toevoegen van de plant kun je:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>De plant aan een plantvak toewijzen</li>
                <li>Verzorgingstaken aanmaken</li>
                <li>Foto's uploaden</li>
                <li>Voortgang bijhouden in het logboek</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}