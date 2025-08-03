"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus } from "lucide-react"
import { getGarden, getPlantBed, createPlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { FlowerForm, type FlowerFormData } from "@/components/forms/flower-form"
import { AddTaskForm } from '@/components/tasks/add-task-form'

export default function NewPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [plantBed, setPlantBed] = React.useState<PlantBedWithPlants | null>(null)
  const [loading, setLoading] = React.useState(false)
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

  const handleSubmit = async (formData: FlowerFormData) => {
    if (!plantBed) {
      toast({
        title: "Fout",
        description: "Plantvak informatie niet beschikbaar.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const createdPlant = await createPlant({
        plant_bed_id: plantBed.id,
        name: formData.name,
        latin_name: formData.latinName || undefined,
        variety: formData.variety || undefined,
        color: formData.color || undefined,
        height: formData.height ? Number.parseInt(formData.height) : undefined,
        plants_per_sqm: formData.plantsPerSqm ? Number.parseInt(formData.plantsPerSqm) : undefined,
        sun_preference: formData.sunPreference,
        planting_date: formData.plantingDate || undefined,
        expected_harvest_date: formData.expectedHarvestDate || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        care_instructions: formData.careInstructions || undefined,
        watering_frequency: formData.wateringFrequency ? Number.parseInt(formData.wateringFrequency) : undefined,
        fertilizer_schedule: formData.fertilizerSchedule || undefined,
        emoji: formData.emoji,
      })

      if (createdPlant) {
        setCreatedPlantId(createdPlant.id)
      }
      toast({
        title: "Bloem toegevoegd!",
        description: `Bloem "${formData.name}" is succesvol toegevoegd aan ${plantBed.name}.`,
      })
      router.push(`/gardens/${garden?.id}/plant-beds/${plantBed.id}/plants`)
    } catch (err) {
      console.error("Error creating plant:", err)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het toevoegen van de bloem.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/gardens/${garden?.id}/plant-beds/${plantBed?.id}/plants`)
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
              Nieuwe Bloem
            </h1>
            <p className="text-muted-foreground">Voeg een nieuwe bloem toe aan {plantBed.name}</p>
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
          <FlowerForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Bloem Toevoegen"
            title="Bloem informatie"
            loading={loading}
          />
        </div>

        <aside className="space-y-4">
          {createdPlantId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-green-900">Bloem toegevoegd!</h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Taak toevoegen
                </Button>
              </div>
              <p className="text-sm text-green-700">
                Je kunt nu taken toevoegen voor deze bloem.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Tips</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Vul minimaal bloemnaam, kleur en lengte in</p>
              <p>• Klik op "Meer opties" voor extra velden</p>
              <p>• Gebruik de suggesties voor standaard bloemen</p>
              <p>• Voeg een plantdatum toe voor groei tracking</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Plantvak Info</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div><strong>Plantvak:</strong> {plantBed.name}</div>
              <div><strong>Locatie:</strong> {plantBed.location}</div>
              {plantBed.sun_exposure && (
                <div><strong>Zonligging:</strong> {plantBed.sun_exposure}</div>
              )}
              <div><strong>Huidige planten:</strong> {plantBed.plants.length}</div>
            </div>
          </div>
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
              description: "De taak is succesvol toegevoegd aan de bloem.",
            })
          }}
          preselectedPlantId={createdPlantId}
        />
      )}
    </div>
  )
}
