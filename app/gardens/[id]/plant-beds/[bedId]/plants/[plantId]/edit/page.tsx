"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlantForm, PlantFormData, PlantFormErrors, createInitialPlantFormData } from "@/components/ui/plant-form"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf, Save, Trash2 } from "lucide-react"
import { getPlant, updatePlant, deletePlant } from "@/lib/database"
import type { Plant } from "@/lib/supabase"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import type { TaskWithPlantInfo } from '@/lib/types/tasks'

export default function EditPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [plant, setPlant] = useState<Plant | null>(null)
  const [plantData, setPlantData] = useState<PlantFormData>(createInitialPlantFormData())
  const [errors, setErrors] = useState<PlantFormErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [tasks, setTasks] = useState<TaskWithPlantInfo[]>([])

  // Load plant data
  useEffect(() => {
    const loadPlant = async () => {
      try {
        setLoading(true)
        const plantData = await getPlant(params.plantId as string)
        
        if (plantData) {
          setPlant(plantData)
          
          // Convert plant data to form data
          setPlantData({
            name: plantData.name,
            color: plantData.color || "",
            height: plantData.height?.toString() || "",
            scientificName: plantData.scientific_name || "",
            variety: plantData.variety || "",
            plantsPerSqm: plantData.plants_per_sqm?.toString() || "4",
            sunPreference: plantData.sun_preference || 'partial-sun',
            plantingDate: plantData.planting_date || "",
            expectedHarvestDate: plantData.expected_harvest_date || "",
            status: plantData.status || "gezond",
            notes: plantData.notes || "",
            careInstructions: plantData.care_instructions || "",
            wateringFrequency: plantData.watering_frequency?.toString() || "",
            fertilizerSchedule: plantData.fertilizer_schedule || "",
            emoji: plantData.emoji || "🌼",
            isStandardFlower: false, // We don't store this in the database
          })
        }
      } catch (error) {
        // Console logging removed for banking standards.error('Error loading plant:', error)
        toast({
          title: "Fout bij laden",
          description: "Kon de plant gegevens niet laden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const loadTasks = async () => {
      try {
        const { data: tasksData } = await TaskService.getTasksWithPlantInfo({ 
          plant_id: params.plantId as string 
        })
        if (tasksData) {
          setTasks(tasksData)
        }
      } catch (error) {
        // Console logging removed for banking standards.error('Error loading tasks:', error)
      }
    }

    if (params.plantId) {
      loadPlant()
      loadTasks()
    }
  }, [params.plantId, toast])

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
    
    if (!plant) return

    // Validate form
    const newErrors = validateForm(plantData)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    setErrors({})

    try {
      const updateData = {
        name: plantData.name,
        scientific_name: plantData.scientificName || undefined,
        variety: plantData.variety || undefined,
        color: plantData.color || undefined,
        height: plantData.height ? Number.parseInt(plantData.height) : undefined,
        plants_per_sqm: plantData.plantsPerSqm ? Number.parseInt(plantData.plantsPerSqm) : undefined,
        sun_preference: plantData.sunPreference,
        planting_date: plantData.plantingDate || undefined,
        expected_harvest_date: plantData.expectedHarvestDate || undefined,
        status: plantData.status,
        notes: plantData.notes || undefined,
        care_instructions: plantData.careInstructions || undefined,
        watering_frequency: plantData.wateringFrequency ? Number.parseInt(plantData.wateringFrequency) : undefined,
        fertilizer_schedule: plantData.fertilizerSchedule || undefined,
        emoji: plantData.emoji,
      }

      const result = await updatePlant(plant.id, updateData)
      
      if (!result) {
        throw new Error('Failed to update plant')
      }

      toast({
        title: "Plant bijgewerkt",
        description: `Plant "${plantData.name}" is succesvol bijgewerkt.`,
      })

      router.push(`/gardens/${params.id}/plantvak-view/${params.bedId}`)
    } catch (error) {
      // Console logging removed for banking standards.error('Error updating plant:', error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er ging iets mis bij het bijwerken van de plant.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!plant) return

    if (!confirm(`Weet je zeker dat je de plant "${plant.name}" wilt verwijderen?`)) {
      return
    }

    setDeleting(true)

    try {
      await deletePlant(plant.id)
      
      toast({
        title: "Plant verwijderd",
        description: `Plant "${plant.name}" is succesvol verwijderd.`,
      })

      router.push(`/gardens/${params.id}/plantvak-view/${params.bedId}`)
    } catch (error) {
      // Console logging removed for banking standards.error('Error deleting plant:', error)
      toast({
        title: "Fout bij verwijderen",
        description: "Er ging iets mis bij het verwijderen van de plant.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleTaskAdded = () => {
    // Refresh tasks
    const loadTasks = async () => {
      try {
        const { data: tasksData } = await TaskService.getTasksWithPlantInfo({ 
          plant_id: params.plantId as string 
        })
        if (tasksData) {
          setTasks(tasksData)
        }
      } catch (error) {
        // Console logging removed for banking standards.error('Error loading tasks:', error)
      }
    }
    loadTasks()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plant niet gevonden</h2>
          <p className="text-gray-600 mb-6">De opgevraagde plant bestaat niet of is verwijderd.</p>
          <Button asChild>
            <Link href={`/gardens/${params.id}/plantvak-view/${params.bedId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar plantvak
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href={`/gardens/${params.id}/plantvak-view/${params.bedId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar plantvak
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Leaf className="h-8 w-8 text-green-600" />
          Plant Bewerken
        </h1>
        <div className="text-gray-600">
          <p>{plant.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Form */}
        <div className="lg:col-span-2">
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
                submitLabel="Wijzigingen opslaan"
                isSubmitting={saving}
                showAdvanced={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowAddTask(true)}
                className="w-full"
                variant="outline"
              >
                Taak toevoegen
              </Button>
              
              <Button 
                onClick={handleDelete}
                variant="destructive" 
                className="w-full"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Verwijderen...' : 'Plant verwijderen'}
              </Button>
            </CardContent>
          </Card>

          {/* Tasks */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Taken ({tasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        task.completed ? 'bg-green-500' : 
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <p className="text-xs text-gray-500">
                      En {tasks.length - 3} meer...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskForm
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={handleTaskAdded}
        preselectedPlantId={plant.id}
      />
    </div>
  )
}