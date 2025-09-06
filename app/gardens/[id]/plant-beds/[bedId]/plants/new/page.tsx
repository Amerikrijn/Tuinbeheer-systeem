"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlantForm, PlantFormData, PlantFormErrors, createInitialPlantFormData } from "@/components/ui/plant-form"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf } from "lucide-react"
import { getGarden, getPlantBed, createPlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import type { TaskWithPlantInfo } from '@/lib/types/tasks'

export default function NewPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [plantBed, setPlantBed] = React.useState<PlantBedWithPlants | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<PlantFormErrors>({})
  const [showAddTask, setShowAddTask] = React.useState(false)
  const [createdPlantId, setCreatedPlantId] = React.useState<string | null>(null)
  const [plantData, setPlantData] = React.useState<PlantFormData>(createInitialPlantFormData())

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

        toast({
          title: "Fout bij laden",
          description: "Kon de gegevens niet laden. Probeer het opnieuw.",
          variant: "destructive",
        })
      }
    }

    if (params.id && params.bedId) {
      loadData()
    }
  }, [params.id, params.bedId, toast])

  const validateForm = (data: PlantFormData): PlantFormErrors => {
    const newErrors: PlantFormErrors = {}

    // Required fields
    if (!data.name.trim()) {
      newErrors.name = "Plantnaam is verplicht"
    } else if (data.name.length > 100) {
      newErrors.name = "Plantnaam mag maximaal 100 karakters bevatten"
    }

    if (!data.color.trim()) {
      newErrors.color = "Kleur is verplicht"
    } else if (data.color.length > 50) {
      newErrors.color = "Kleur mag maximaal 50 karakters bevatten"
    }

    if (!data.height.trim()) {
      newErrors.height = "Hoogte is verplicht"
    } else if (isNaN(Number(data.height)) || Number(data.height) <= 0) {
      newErrors.height = "Hoogte moet een geldig getal groter dan 0 zijn"
    } else if (Number(data.height) > 500) {
      newErrors.height = "Hoogte mag niet meer dan 500 cm zijn"
    }

    // Optional field validations
    if (data.scientificName && data.scientificName.length > 200) {
      newErrors.scientificName = "Wetenschappelijke naam mag maximaal 200 karakters bevatten"
    }

    if (data.variety && data.variety.length > 100) {
      newErrors.variety = "Variëteit mag maximaal 100 karakters bevatten"
    }

    if (data.plantsPerSqm && (isNaN(Number(data.plantsPerSqm)) || Number(data.plantsPerSqm) <= 0)) {
      newErrors.plantsPerSqm = "Planten per m² moet een geldig getal groter dan 0 zijn"
    } else if (data.plantsPerSqm && Number(data.plantsPerSqm) > 100) {
      newErrors.plantsPerSqm = "Planten per m² mag niet meer dan 100 zijn"
    }

    if (data.wateringFrequency && (isNaN(Number(data.wateringFrequency)) || Number(data.wateringFrequency) <= 0)) {
      newErrors.wateringFrequency = "Water frequentie moet een geldig getal groter dan 0 zijn"
    } else if (data.wateringFrequency && Number(data.wateringFrequency) > 365) {
      newErrors.wateringFrequency = "Water frequentie mag niet meer dan 365 dagen zijn"
    }

    if (data.notes && data.notes.length > 1000) {
      newErrors.notes = "Opmerkingen mogen maximaal 1000 karakters bevatten"
    }

    if (data.careInstructions && data.careInstructions.length > 1000) {
      newErrors.careInstructions = "Verzorgingsinstructies mogen maximaal 1000 karakters bevatten"
    }

    if (data.fertilizerSchedule && data.fertilizerSchedule.length > 100) {
      newErrors.fertilizerSchedule = "Bemestingsschema mag maximaal 100 karakters bevatten"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!garden || !plantBed) {
      toast({
        title: "Fout",
        description: "Tuin of plantvak gegevens zijn niet geladen.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    const newErrors = validateForm(plantData)
    // Enforce required bloom period
    if (!plantData.bloomPeriod || !plantData.bloomStartMonth || !plantData.bloomEndMonth) {
      newErrors.bloomPeriod = 'Bloeiperiode is verplicht'
    }
    // Enforce required sowing date
    if (!plantData.plantingDate) {
      newErrors.plantingDate = 'Zaaidatum is verplicht'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const createdPlant = await createPlant({
        plant_bed_id: plantBed.id,
        name: plantData.name,
        scientific_name: plantData.scientificName || undefined,
        variety: plantData.variety || undefined,
        color: plantData.color || undefined,
        height: plantData.height ? Number.parseInt(plantData.height) : undefined,
        plants_per_sqm: plantData.plantsPerSqm ? Number.parseInt(plantData.plantsPerSqm) : undefined,
        sun_preference: plantData.sunPreference,
        planting_date: plantData.plantingDate || undefined,
        bloom_period: plantData.bloomPeriod,
        status: plantData.status,
        notes: plantData.notes || undefined,
        care_instructions: plantData.careInstructions || undefined,
        watering_frequency: plantData.wateringFrequency ? Number.parseInt(plantData.wateringFrequency) : undefined,
        fertilizer_schedule: plantData.fertilizerSchedule || undefined,
        emoji: plantData.emoji,
      })

      if (createdPlant) {
        setCreatedPlantId(createdPlant.id)
      }
      
      toast({
        title: "Plant toegevoegd!",
        description: `Plant "${plantData.name}" is succesvol toegevoegd aan ${plantBed.name}.`,
      })
      
      router.push(`/gardens/${garden?.id}/plantvak-view/${plantBed.id}`)
    } catch (error) {

      toast({
        title: "Fout bij toevoegen",
        description: "Er ging iets mis bij het toevoegen van de plant. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPlantData(createInitialPlantFormData())
    setErrors({})
  }

  const handleTaskAdd = (plantId?: string) => {
    if (createdPlantId) {
      setShowAddTask(true)
    } else {
      toast({
        title: "Geen plant geselecteerd",
        description: "Voeg eerst een plant toe voordat je een taak kunt aanmaken.",
        variant: "destructive",
      })
    }
  }

  const handleTaskAdded = () => {
    // Task added successfully, could refresh tasks or show confirmation
  }

  if (!garden || !plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href={`/gardens/${garden.id}/plantvak-view/${plantBed.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar plantvak
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
          Nieuwe Plant Toevoegen
        </h1>
        <div className="text-muted-foreground">
          <p><strong>Tuin:</strong> {garden.name}</p>
          <p><strong>Plantvak:</strong> {plantBed.name}</p>
        </div>
      </div>

      {/* Plant Form */}
      <Card>
        <CardHeader>
          <CardTitle>Plant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PlantForm
            data={plantData}
            errors={errors}
            onChange={setPlantData}
            onSubmit={handleSubmit}
            onReset={handleReset}
            submitLabel="Plant toevoegen"
            isSubmitting={loading}
            showAdvanced={true}
          />
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      {createdPlantId && (
        <AddTaskForm
          isOpen={showAddTask}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={handleTaskAdded}
          preselectedPlantId={createdPlantId}
        />
      )}
    </div>
  )
}
