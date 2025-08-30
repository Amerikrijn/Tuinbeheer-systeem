"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AddTaskForm } from '@/components/tasks/add-task-form'
import { TaskService } from '@/lib/services/task.service'
import { supabase } from '@/lib/supabase'
import type { TaskWithPlantInfo } from '@/lib/types/tasks'
import type { Plant } from '@/lib/types/index'
import { PlantPhotoGallery } from '@/components/plant-photo-gallery'

interface PlantWithBeds extends Plant {
  plant_beds?: {
    name: string
    sun_exposure?: string
    gardens?: {
      id: string
      name: string
    }
  }
}
import { 
  ArrowLeft, 
  Leaf, 
  Sun, 
  CloudSun, 
  Cloud, 
  Ruler, 
  Palette, 
  Users, 
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit
} from "lucide-react"
import { getTaskTypeConfig, getPriorityConfig, formatTaskDate } from '@/lib/types/tasks'

export default function PlantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [plant, setPlant] = useState<PlantWithBeds | null>(null)
  const [tasks, setTasks] = useState<TaskWithPlantInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (params.id) {
      loadPlantData()
      loadPlantTasks()
    }
  }, [params.id, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlantData = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select(`
          *,
          plant_beds!inner (
            name,
            sun_exposure,
            gardens!inner (
              id,
              name
            )
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setPlant(data)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const loadPlantTasks = async () => {
    try {
      const { data, error } = await TaskService.getTasksForPlant(params.id as string)
      if (error) throw new Error(error)
      setTasks(data)
    } catch (error) {

    }
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await TaskService.updateTask(taskId, { completed })
      if (error) throw new Error(error)
      setRefreshKey(prev => prev + 1)
    } catch (error) {

    }
  }

  const getSunIcon = (preference?: string) => {
    switch (preference) {
      case 'full-sun': return <Sun className=""w-4 h-4 text-yellow-500" />
      case 'partial-sun': return <CloudSun className=""w-4 h-4 text-orange-500" />
      case 'shade': return <Cloud className=""w-4 h-4 text-muted-foreground" />
      default: return <CloudSun className=""w-4 h-4 text-muted-foreground/50" />
    }
  }

  const getSunLabel = (preference?: string) => {
    switch (preference) {
      case 'full-sun': return 'Volle zon'
      case 'partial-sun': return 'Halfschaduw'
      case 'shade': return 'Schaduw'
      default: return 'Onbekend'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'gezond': return 'bg-green-100 text-green-800'
      case 'aandacht_nodig': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800'
      case 'ziek': return 'bg-red-100 dark:bg-red-900 text-red-800'
      case 'dood': return 'bg-muted text-muted-foreground'
      case 'geoogst': return 'bg-blue-100 dark:bg-blue-900 text-blue-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'gezond': return 'Gezond'
      case 'aandacht_nodig': return 'Aandacht nodig'
      case 'ziek': return 'Ziek'
      case 'dood': return 'Dood'
      case 'geoogst': return 'Geoogst'
      default: return 'Onbekend'
    }
  }

  if (loading) {
    return (
      <div className=""container mx-auto p-4 max-w-4xl">
        <div className=""animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className=""flex items-center justify-between mb-3">
            <div className=""flex items-center gap-3">
              <div className=""h-8 w-20 bg-green-100 dark:bg-green-900/30 rounded" />
              <div className=""h-6 w-32 bg-green-100 dark:bg-green-900/30 rounded" />
            </div>
            <div className=""h-8 w-20 bg-green-100 dark:bg-green-900/30 rounded" />
          </div>
          
          {/* Content skeleton */}
          <div className=""grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className=""lg:col-span-2 space-y-4">
              <div className=""h-32 bg-green-100 dark:bg-green-900/30 rounded" />
              <div className=""h-24 bg-green-100 dark:bg-green-900/30 rounded" />
              <div className=""h-40 bg-green-100 dark:bg-green-900/30 rounded" />
            </div>
            <div className=""space-y-4">
              <div className=""h-24 bg-green-100 dark:bg-green-900/30 rounded" />
              <div className=""h-32 bg-green-100 dark:bg-green-900/30 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className=""container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className=""p-8 text-center">
            <AlertCircle className=""w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className=""text-lg font-medium text-foreground mb-2">Plant niet gevonden</h3>
            <p className=""text-muted-foreground mb-4">De plant die je zoekt bestaat niet of is verwijderd.</p>
            <Button asChild>
              <Link href="/">Terug naar overzicht</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const overdueTasks = activeTasks.filter(t => t.due_date < new Date().toISOString().split('T')[0])
  const todayTasks = activeTasks.filter(t => t.due_date === new Date().toISOString().split('T')[0])
  
  // Sort active tasks by date for flower-specific view
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  return (
    <div className=""container mx-auto p-4 max-w-4xl">
      {/* Minimalist Header */}
      <div className=""mb-4">
        <div className=""flex items-center justify-between mb-3">
          <div className=""flex items-center gap-3">
            <Button 
              asChild 
              variant="outline" 
              size="sm"
              className=""h-8 px-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-300 hover:bg-green-50 dark:bg-green-950 dark:hover:bg-green-950/30"
            >
              <Link href="/">
                <ArrowLeft className=""w-4 h-4 mr-2" />
                Terug
              </Link>
            </Button>
            
            <div className=""flex items-center gap-2">
              <Leaf className=""w-5 h-5 text-green-600 dark:text-green-400" />
              <h1 className=""text-xl font-semibold text-foreground">{plant.name}</h1>
              <Badge className={getStatusColor(plant.status)}>
                {getStatusLabel(plant.status)}
              </Badge>
            </div>
          </div>
          
          {/* Edit Button */}
          <Button 
            asChild
            size="sm"
            className=""h-8 px-3 bg-green-600 dark:bg-green-700 hover:bg-green-700"
          >
            <Link href={`/gardens/${plant.plant_beds?.gardens?.id}/plant-beds/${plant.plant_bed_id}/plants/${plant.id}/edit`}>
              <Edit className=""w-4 h-4 mr-2" />
              Bewerken
            </Link>
          </Button>
        </div>
      </div>

      <div className=""grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plant Details */}
        <div className=""lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card className=""border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
            <CardHeader className=""pb-3">
              <CardTitle className=""flex items-center gap-2 text-lg text-green-800">
                <Leaf className=""w-5 h-5" />
                Basis Plantgegevens
              </CardTitle>
            </CardHeader>
            <CardContent className=""space-y-3">
              <div className=""grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className=""text-xs font-medium text-foreground">Plantnaam</label>
                  <p className=""text-base font-semibold flex items-center gap-2">
                    {plant.emoji && <span className=""text-lg">{plant.emoji}</span>}
                    {plant.name}
                  </p>
                </div>
                
                {plant.color && (
                  <div>
                    <label className=""text-xs font-medium text-foreground">Kleur</label>
                    <p className=""text-base font-medium text-foreground">{plant.color}</p>
                  </div>
                )}

                {plant.height && (
                  <div>
                    <label className=""text-xs font-medium text-foreground">Hoogte</label>
                    <p className=""text-base font-medium text-foreground">
                      {plant.height} cm
                    </p>
                  </div>
                )}

                <div>
                  <label className=""text-xs font-medium text-foreground">Locatie</label>
                  <p className=""text-foreground text-sm">{plant.plant_beds?.name} • {plant.plant_beds?.gardens?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scientific Information - Only show if any field is filled */}
          {(plant.scientific_name || plant.variety) && (
            <Card className=""border-2 border-green-200 dark:border-green-800">
              <CardHeader className=""pb-3">
                <CardTitle className=""flex items-center gap-2 text-lg">
                  <span className=""w-5 h-5 text-blue-600 dark:text-blue-400">🔬</span>
                  Wetenschappelijke Informatie
                </CardTitle>
              </CardHeader>
              <CardContent className=""space-y-3">
                <div className=""grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plant.scientific_name && (
                    <div>
                      <label className=""text-xs font-medium text-foreground">Wetenschappelijke naam</label>
                      <p className=""text-foreground italic text-sm">{plant.scientific_name}</p>
                    </div>
                  )}

                  {plant.variety && (
                    <div className={plant.scientific_name ? "md:col-span-1" : "md:col-span-2"}>
                      <label className=""text-xs font-medium text-foreground">Variëteit</label>
                      <p className=""text-foreground text-sm">{plant.variety}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Growing Conditions - Only show if any field is filled */}
          {(plant.sun_preference || plant.plants_per_sqm || plant.planting_date || plant.expected_harvest_date) && (
            <Card className=""border-2 border-green-200 dark:border-green-800">
              <CardHeader className=""pb-3">
                <CardTitle className=""flex items-center gap-2 text-lg">
                  <Sun className=""w-5 h-5 text-orange-600" />
                  Groei Informatie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=""grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plant.sun_preference && (
                    <div className=""flex items-center gap-3">
                      {getSunIcon(plant.sun_preference)}
                      <div>
                        <p className=""text-xs text-muted-foreground">Zonvoorkeur</p>
                        <p className=""font-medium text-foreground text-sm">{getSunLabel(plant.sun_preference)}</p>
                      </div>
                    </div>
                  )}

                  {plant.plants_per_sqm && (
                    <div className=""flex items-center gap-3">
                      <Users className=""w-5 h-5 text-green-500 dark:text-green-400" />
                      <div>
                        <p className=""text-xs text-muted-foreground">Planten per m²</p>
                        <p className=""font-medium text-foreground text-sm">{plant.plants_per_sqm} stuks</p>
                      </div>
                    </div>
                  )}

                  {(plant.planting_date || plant.expected_harvest_date) && (
                    <div className=""md:col-span-2">
                      <div className=""flex items-center gap-3 mb-2">
                        <Calendar className=""w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <p className=""text-sm font-medium text-foreground">Planning</p>
                      </div>
                      <div className=""grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                        {plant.planting_date && (
                          <div>
                            <p className=""text-xs text-muted-foreground">Plantdatum</p>
                            <p className=""font-medium text-foreground text-sm">
                              {new Date(plant.planting_date).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                        )}
                        {plant.expected_harvest_date && (
                          <div>
                            <p className=""text-xs text-muted-foreground">Verwachte bloeitijd</p>
                            <p className=""font-medium text-foreground text-sm">
                              {new Date(plant.expected_harvest_date).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Care Instructions */}
          {(plant.notes || plant.care_instructions || plant.watering_frequency || plant.fertilizer_schedule) && (
            <Card className=""border-2 border-green-200 dark:border-green-800">
              <CardHeader className=""pb-3">
                <CardTitle className=""flex items-center gap-2 text-lg">
                  <span className=""w-5 h-5 text-green-600 dark:text-green-400">🌿</span>
                  Verzorging
                </CardTitle>
              </CardHeader>
              <CardContent className=""space-y-3">
                {plant.care_instructions && (
                  <div>
                    <h4 className=""font-medium mb-2 text-foreground text-sm">Verzorgingsinstructies</h4>
                    <p className=""text-foreground bg-muted p-3 rounded-md text-sm">{plant.care_instructions}</p>
                  </div>
                )}
                
                {(plant.watering_frequency || plant.fertilizer_schedule) && (
                  <div>
                    <h4 className=""font-medium mb-3 text-foreground text-sm">Verzorgingsschema</h4>
                    <div className=""grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plant.watering_frequency && (
                        <div className=""flex items-center gap-3 bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                          <span className=""text-blue-600 dark:text-blue-400">💧</span>
                          <div>
                            <p className=""text-xs text-muted-foreground">Water frequentie</p>
                            <p className=""font-medium text-foreground text-sm">Elke {plant.watering_frequency} dagen</p>
                          </div>
                        </div>
                      )}
                      {plant.fertilizer_schedule && (
                        <div className=""flex items-center gap-3 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                          <span className=""text-green-600 dark:text-green-400">🧪</span>
                          <div>
                            <p className=""text-xs text-muted-foreground">Bemesting</p>
                            <p className=""font-medium text-foreground text-sm">{plant.fertilizer_schedule}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {plant.notes && (
                  <div>
                    <h4 className=""font-medium mb-2 text-foreground text-sm">Opmerkingen</h4>
                    <p className=""text-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md border-l-4 border-yellow-400 text-sm">{plant.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Plant Photo Gallery */}
          <PlantPhotoGallery 
            plantId={plant.id}
            plantName={plant.name}
          />
        </div>

        {/* Tasks Sidebar */}
        <div className=""space-y-4">
          {/* Task Summary */}
          <Card className=""border-2 border-green-200 dark:border-green-800">
            <CardHeader className=""pb-3">
              <div className=""flex items-center justify-between">
                <CardTitle className=""flex items-center gap-2 text-lg">
                  <Calendar className=""w-5 h-5" />
                  Taken
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 h-8 px-3"
                >
                  <Plus className=""w-4 h-4 mr-1" />
                  Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className=""space-y-3">
                <div className=""flex justify-between items-center">
                  <span className=""text-xs text-muted-foreground">Actieve taken</span>
                  <Badge variant="secondary" className=""text-xs">{activeTasks.length}</Badge>
                </div>
                <div className=""flex justify-between items-center">
                  <span className=""text-xs text-muted-foreground">Vandaag</span>
                  <Badge className=""bg-orange-100 text-orange-800 text-xs">{todayTasks.length}</Badge>
                </div>
                <div className=""flex justify-between items-center">
                  <span className=""text-xs text-muted-foreground">Verlopen</span>
                  <Badge variant="destructive" className=""text-xs">{overdueTasks.length}</Badge>
                </div>
                <div className=""flex justify-between items-center">
                  <span className=""text-xs text-muted-foreground">Afgerond</span>
                  <Badge className=""bg-green-100 text-green-800 text-xs">{completedTasks.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <Card className=""border-2 border-green-200 dark:border-green-800">
              <CardHeader className=""pb-3">
                <CardTitle className=""text-base">Actieve Taken</CardTitle>
              </CardHeader>
              <CardContent className=""space-y-3">
                {sortedActiveTasks.slice(0, 5).map((task) => {
                  const taskTypeConfig = getTaskTypeConfig(task.task_type)
                  const priorityConfig = getPriorityConfig(task.priority)
                  const isOverdue = task.due_date < new Date().toISOString().split('T')[0]
                  const isToday = task.due_date === new Date().toISOString().split('T')[0]
                  
                  return (
                    <div key={task.id} className=""border rounded-lg p-3 space-y-2">
                      <div className=""flex items-start justify-between">
                        <div className=""flex items-center gap-2">
                          <span className=""text-sm">{taskTypeConfig?.icon || '📝'}</span>
                          <div className=""flex-1">
                            <p className=""font-medium text-sm">{task.title}</p>
                            <div className=""flex items-center gap-2 mt-1">
                              <Badge 
                                variant={isOverdue ? "destructive" : isToday ? "default" : "secondary"}
                                className=""text-xs"
                              >
                                {isOverdue ? 'Verlopen' : isToday ? 'Vandaag' : formatTaskDate(task.due_date)}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={{`text-xs ${priorityConfig?.badge_color}`}
                              >
                                {priorityConfig?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTaskComplete(task.id, true)}
                          className=""shrink-0 h-7 w-7 p-0"
                        >
                          <CheckCircle2 className=""w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                
                {activeTasks.length > 5 && (
                  <Button asChild variant="outline" className=""w-full h-8 text-xs">
                    <Link href="/tasks">
                      Alle taken bekijken ({activeTasks.length - 5} meer)
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* No tasks state */}
          {tasks.length === 0 && (
            <Card className=""border-2 border-green-200 dark:border-green-800">
              <CardContent className=""p-4 text-center">
                <Calendar className=""w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className=""font-medium text-foreground mb-2 text-sm">Nog geen taken</h3>
                <p className=""text-xs text-muted-foreground mb-3">
                  Voeg je eerste taak toe voor deze plant.
                </p>
                <Button
                  onClick={() => setShowAddTask(true)}
                  className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 h-8 px-3 text-xs"
                >
                  <Plus className=""w-4 h-4 mr-2" />
                  Eerste taak toevoegen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskForm
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={() => setRefreshKey(prev => prev + 1)}
        preselectedPlantId={plant.id}
      />
    </div>
  )
}