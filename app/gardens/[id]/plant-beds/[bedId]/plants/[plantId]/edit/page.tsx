"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Plus, CheckCircle, Trash2 } from "lucide-react"
import { getPlant, updatePlant } from "@/lib/database"
import type { Plant } from "@/lib/supabase"
import { FlowerForm, type FlowerFormData } from "@/components/forms/flower-form"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import type { TaskWithPlantInfo } from '@/lib/types/tasks'

export default function EditPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [tasks, setTasks] = useState<TaskWithPlantInfo[]>([])
  // Add loading state for individual tasks
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadPlant() {
      try {
        const plantId = params.plantId as string
        const plantData = await getPlant(plantId)
        
        if (!plantData) {
          toast({
            title: "Bloem niet gevonden",
            description: "De bloem kon niet worden gevonden.",
            variant: "destructive",
          })
          router.back()
          return
        }

        setPlant(plantData)

        // Load tasks for this plant
        const { data: plantTasks, error: taskError } = await TaskService.getTasksForPlant(plantId)
        if (taskError) {
          console.error("Error loading tasks:", taskError)
        } else {
          setTasks(plantTasks)
        }
      } catch (error) {
        console.error("Error loading plant:", error)
        toast({
          title: "Fout",
          description: "Kon bloem niet laden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPlant()
  }, [params.plantId, toast, router])

  const handleSubmit = async (formData: FlowerFormData) => {
    if (!plant) return

    setSaving(true)
    try {
      await updatePlant(plant.id, {
        name: formData.name,
        scientific_name: formData.scientificName || undefined,
        latin_name: formData.latinName || undefined,
        variety: formData.variety || undefined,
        color: formData.color || undefined,
        plant_color: formData.plantColor || undefined,
        height: formData.height ? Number.parseInt(formData.height) : undefined,
        plant_height: formData.plantHeight ? Number.parseInt(formData.plantHeight) : undefined,
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

      toast({
        title: "Bloem bijgewerkt!",
        description: `Bloem "${formData.name}" is succesvol bijgewerkt.`,
      })
      router.push(`/plants/${plant.id}`)
    } catch (error) {
      console.error("Error updating plant:", error)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het bijwerken van de bloem.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    // Prevent multiple simultaneous updates of the same task
    if (updatingTasks.has(taskId)) {
      return
    }

    try {
      // Add task to updating set
      setUpdatingTasks(prev => new Set(prev).add(taskId))

      // Optimistic update - update the tasks state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed, completed_at: completed ? new Date().toISOString() : undefined }
            : task
        )
      )

      const { error } = await TaskService.updateTask(taskId, { completed })
      
      if (error) {
        console.error("Error updating task:", error)
        // Revert optimistic update on error
        if (plant) {
          const { data: plantTasks, error: taskError } = await TaskService.getTasksForPlant(plant.id)
          if (!taskError) {
            setTasks(plantTasks)
          }
        }
        toast({
          title: "Fout",
          description: "Kon taak niet bijwerken.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: completed ? "Taak voltooid!" : "Taak heropend",
        description: completed ? "De taak is gemarkeerd als voltooid." : "De taak is heropend.",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      // Revert optimistic update on error
      if (plant) {
        const { data: plantTasks, error: taskError } = await TaskService.getTasksForPlant(plant.id)
        if (!taskError) {
          setTasks(plantTasks)
        }
      }
      toast({
        title: "Fout",
        description: "Kon taak niet bijwerken.",
        variant: "destructive",
      })
    } finally {
      // Always remove task from updating set
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId)
      // Reload tasks
      if (plant) {
        const { data: plantTasks, error: taskError } = await TaskService.getTasksForPlant(plant.id)
        if (!taskError) {
          setTasks(plantTasks)
        }
      }
      toast({
        title: "Taak verwijderd",
        description: "De taak is succesvol verwijderd.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Fout",
        description: "Kon taak niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Bloem laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Bloem niet gevonden</p>
          </div>
        </div>
      </div>
    )
  }

  // Convert plant data to FlowerFormData format
  const initialFormData: Partial<FlowerFormData> = {
    name: plant.name || '',
    color: plant.color || '',
    height: plant.height?.toString() || '',
    scientificName: plant.scientific_name || '',
    latinName: plant.latin_name || '',
    variety: plant.variety || '',
    plantColor: plant.plant_color || '',
    plantHeight: plant.plant_height?.toString() || '',
    plantsPerSqm: plant.plants_per_sqm?.toString() || '4',
    sunPreference: plant.sun_preference || 'partial-sun',
    plantingDate: plant.planting_date || '',
    expectedHarvestDate: plant.expected_harvest_date || '',
    status: (plant.status || 'gezond') as "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst",
    notes: plant.notes || '',
    careInstructions: plant.care_instructions || '',
    wateringFrequency: plant.watering_frequency?.toString() || '',
    fertilizerSchedule: plant.fertilizer_schedule || '',
    emoji: plant.emoji || '🌸',
    isStandardFlower: false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/plants/${plant.id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Terug naar bloem
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bloem Bewerken</h1>
            <p className="text-gray-600">{plant.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plant Form */}
          <div className="lg:col-span-2">
            <FlowerForm
              initialData={initialFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Wijzigingen Opslaan"
              title="Bloem informatie bewerken"
              loading={saving}
            />
          </div>

          {/* Tasks Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Taken
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddTask(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Toevoegen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Geen taken voor deze bloem
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      // Sort tasks: completed at bottom, active tasks by date
                      const sortedTasks = [...tasks].sort((a, b) => {
                        // 1. Completed tasks go to bottom
                        if (a.completed !== b.completed) {
                          return a.completed ? 1 : -1
                        }
                        
                        // 2. Sort by due date
                        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                      })
                      
                      return sortedTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border ${
                          task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <button
                              onClick={() => handleTaskToggle(task.id, !task.completed)}
                              className="mt-0.5"
                              disabled={updatingTasks.has(task.id)}
                            >
                              <CheckCircle
                                className={`h-4 w-4 ${
                                  task.completed ? 'text-green-600' : 
                                  updatingTasks.has(task.id) ? 'text-gray-300' :
                                  'text-gray-400 hover:text-green-600'
                                }`}
                              />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(task.due_date).toLocaleDateString('nl-NL')}
                              </p>
                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))})()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskForm
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={async () => {
          setShowAddTask(false)
          if (plant) {
            const { data: plantTasks, error: taskError } = await TaskService.getTasksForPlant(plant.id)
            if (!taskError) {
              setTasks(plantTasks)
            }
          }
        }}
        preselectedPlantId={plant.id}
      />
    </div>
  )
}