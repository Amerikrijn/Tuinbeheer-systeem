"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf, Save, Calendar, Plus, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { getPlant, updatePlant, deletePlant } from "@/lib/database"
import type { Plant } from "@/lib/supabase"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import type { TaskWithPlantInfo } from '@/lib/types/tasks'

interface EditPlant {
  name: string
  scientific_name: string
  latin_name: string
  variety: string
  color: string
  plant_color: string
  height: string
  plant_height: string
  plants_per_sqm: string
  sun_preference: 'full-sun' | 'partial-sun' | 'shade'
  planting_date: string
  expected_harvest_date: string
  status: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst'
  notes: string
  care_instructions: string
  watering_frequency: string
  fertilizer_schedule: string
  emoji: string
}


export default function EditPlantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [plant, setPlant] = useState<Plant | null>(null)
  const [editPlant, setEditPlant] = useState<EditPlant>({
    name: '',
    scientific_name: '',
    latin_name: '',
    variety: '',
    color: '',
    plant_color: '',
    height: '',
    plant_height: '',
    plants_per_sqm: '',
    sun_preference: 'full-sun',
    planting_date: '',
    expected_harvest_date: '',
    status: 'gezond',
    notes: '',
    care_instructions: '',
    watering_frequency: '',
    fertilizer_schedule: '',
    emoji: '🌸'
  })
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
            title: "Plant niet gevonden",
            description: "De plant kon niet worden gevonden.",
            variant: "destructive",
          })
          router.back()
          return
        }

        setPlant(plantData)
        setEditPlant({
          name: plantData.name || '',
          scientific_name: plantData.scientific_name || '',
          latin_name: plantData.latin_name || '',
          variety: plantData.variety || '',
          color: plantData.color || '',
          plant_color: plantData.plant_color || '',
          height: plantData.height?.toString() || '',
          plant_height: plantData.plant_height?.toString() || '',
          plants_per_sqm: plantData.plants_per_sqm?.toString() || '',
          sun_preference: plantData.sun_preference || 'full-sun',
          planting_date: plantData.planting_date || '',
          expected_harvest_date: plantData.expected_harvest_date || '',
          status: (plantData.status || 'gezond') as 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst',
          notes: plantData.notes || '',
          care_instructions: plantData.care_instructions || '',
          watering_frequency: plantData.watering_frequency?.toString() || '',
          fertilizer_schedule: plantData.fertilizer_schedule || '',
          emoji: plantData.emoji || '🌸'
        })

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
          description: "Kon plant niet laden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPlant()
  }, [params.plantId, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plant) return

    setSaving(true)
    try {
      await updatePlant(plant.id, {
        name: editPlant.name,
        scientific_name: editPlant.scientific_name || undefined,
        latin_name: editPlant.latin_name || undefined,
        variety: editPlant.variety || undefined,
        color: editPlant.color || undefined,
        plant_color: editPlant.plant_color || undefined,
        height: editPlant.height ? Number.parseInt(editPlant.height) : undefined,
        plant_height: editPlant.plant_height ? Number.parseInt(editPlant.plant_height) : undefined,
        plants_per_sqm: editPlant.plants_per_sqm ? Number.parseInt(editPlant.plants_per_sqm) : undefined,
        sun_preference: editPlant.sun_preference,
        planting_date: editPlant.planting_date || undefined,
        expected_harvest_date: editPlant.expected_harvest_date || undefined,
        status: editPlant.status,
        notes: editPlant.notes || undefined,
        care_instructions: editPlant.care_instructions || undefined,
        watering_frequency: editPlant.watering_frequency ? Number.parseInt(editPlant.watering_frequency) : undefined,
        fertilizer_schedule: editPlant.fertilizer_schedule || undefined,
        emoji: editPlant.emoji,
      })

      toast({
        title: "Plant bijgewerkt!",
        description: `Plant "${editPlant.name}" is succesvol bijgewerkt.`,
      })
      router.push(`/plants/${plant.id}`)
    } catch (error) {
      console.error("Error updating plant:", error)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het bijwerken van de plant.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
            <p className="mt-4 text-gray-600">Plant laden...</p>
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
            <p className="text-gray-600">Plant niet gevonden</p>
          </div>
        </div>
      </div>
    )
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
            Terug naar plant
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plant Bewerken</h1>
            <p className="text-gray-600">{plant.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plant Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Plant Informatie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Bloemnaam *</Label>
                      <Input
                        id="name"
                        value={editPlant.name}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scientificName">Wetenschappelijke naam</Label>
                      <Input
                        id="scientificName"
                        value={editPlant.scientific_name}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, scientific_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="latinName">Latijnse naam</Label>
                      <Input
                        id="latinName"
                        value={editPlant.latin_name}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, latin_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="variety">Variëteit</Label>
                      <Input
                        id="variety"
                        value={editPlant.variety}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, variety: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Bloem kleur</Label>
                      <Input
                        id="color"
                        value={editPlant.color}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plantColor">Plant kleur</Label>
                      <Input
                        id="plantColor"
                        value={editPlant.plant_color}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, plant_color: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Hoogte (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={editPlant.height}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, height: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plantHeight">Plant hoogte (cm)</Label>
                      <Input
                        id="plantHeight"
                        type="number"
                        value={editPlant.plant_height}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, plant_height: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plantsPerSqm">Planten per m²</Label>
                      <Input
                        id="plantsPerSqm"
                        type="number"
                        value={editPlant.plants_per_sqm}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, plants_per_sqm: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sunPreference">Zonvoorkeur</Label>
                      <Select
                        value={editPlant.sun_preference}
                        onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') =>
                          setEditPlant(prev => ({ ...prev, sun_preference: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-sun">☀️ Volle zon</SelectItem>
                          <SelectItem value="partial-sun">⛅ Gedeeltelijke zon</SelectItem>
                          <SelectItem value="shade">🌳 Schaduw</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editPlant.status}
                        onValueChange={(value: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst') =>
                          setEditPlant(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                                          <SelectItem value="gezond">🌱 Gezond</SelectItem>
                <SelectItem value="aandacht_nodig">⚠️ Aandacht nodig</SelectItem>
                <SelectItem value="ziek">🦠 Ziek</SelectItem>
                <SelectItem value="dood">💀 Dood</SelectItem>
                <SelectItem value="geoogst">🌾 Geoogst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plantingDate">Plantdatum</Label>
                      <Input
                        id="plantingDate"
                        type="date"
                        value={editPlant.planting_date}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, planting_date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedHarvestDate">Verwachte oogstdatum</Label>
                      <Input
                        id="expectedHarvestDate"
                        type="date"
                        value={editPlant.expected_harvest_date}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, expected_harvest_date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wateringFrequency">Begieten frequentie (dagen)</Label>
                      <Input
                        id="wateringFrequency"
                        type="number"
                        value={editPlant.watering_frequency}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, watering_frequency: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emoji">Emoji</Label>
                      <Input
                        id="emoji"
                        value={editPlant.emoji}
                        onChange={(e) => setEditPlant(prev => ({ ...prev, emoji: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fertilizerSchedule">Bemesting schema</Label>
                    <Input
                      id="fertilizerSchedule"
                      value={editPlant.fertilizer_schedule}
                      onChange={(e) => setEditPlant(prev => ({ ...prev, fertilizer_schedule: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careInstructions">Verzorgingsinstructies</Label>
                    <Textarea
                      id="careInstructions"
                      value={editPlant.care_instructions}
                      onChange={(e) => setEditPlant(prev => ({ ...prev, care_instructions: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notities</Label>
                    <Textarea
                      id="notes"
                      value={editPlant.notes}
                      onChange={(e) => setEditPlant(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Annuleren
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
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
                    Geen taken voor deze plant
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