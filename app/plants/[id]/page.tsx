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
import type { Bloem } from '@/lib/types/index'
import { BloemDetailView } from '@/components/ui/bloem-detail-view'

interface PlantWithBeds extends Bloem {
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
      console.error('Error loading plant:', error)
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
      console.error('Error loading plant tasks:', error)
    }
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await TaskService.updateTask(taskId, { completed })
      if (error) throw new Error(error)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getSunIcon = (preference?: string) => {
    switch (preference) {
      case 'full-sun': return <Sun className="w-4 h-4 text-yellow-500" />
      case 'partial-sun': return <CloudSun className="w-4 h-4 text-orange-500" />
      case 'shade': return <Cloud className="w-4 h-4 text-gray-500" />
      default: return <CloudSun className="w-4 h-4 text-gray-400" />
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
      case 'aandacht_nodig': return 'bg-yellow-100 text-yellow-800'
      case 'ziek': return 'bg-red-100 text-red-800'
      case 'dood': return 'bg-gray-100 text-gray-800'
      case 'geoogst': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bloem niet gevonden</h3>
            <p className="text-gray-600 mb-4">De bloem die je zoekt bestaat niet of is verwijderd.</p>
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
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">{plant.name}</h1>
              <Badge className={getStatusColor(plant.status)}>
                {getStatusLabel(plant.status)}
              </Badge>
            </div>
          </div>
          
          {/* Edit Button */}
          <Button asChild>
            <Link href={`/gardens/${plant.plant_beds?.gardens?.id}/plant-beds/${plant.plant_bed_id}/plants/${plant.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Bewerken
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Info */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Leaf className="w-5 h-5" />
                Locatie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-blue-700">Locatie</label>
                <p className="text-lg font-semibold text-blue-900">{plant.plant_beds?.name} • {plant.plant_beds?.gardens?.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Flower Details using new consistent view */}
          <BloemDetailView 
            data={{
              name: plant.name,
              color: plant.color || '',
              height: plant.height || plant.plant_height || 0,
              scientific_name: plant.scientific_name,
              latin_name: plant.latin_name,
              variety: plant.variety,
              plant_color: plant.plant_color,
              plant_height: plant.plant_height,
              plants_per_sqm: plant.plants_per_sqm,
              sun_preference: plant.sun_preference,
              planting_date: plant.planting_date,
              expected_harvest_date: plant.expected_harvest_date,
              status: plant.status,
              notes: plant.notes,
              care_instructions: plant.care_instructions,
              watering_frequency: plant.watering_frequency,
              fertilizer_schedule: plant.fertilizer_schedule,
              emoji: plant.emoji
            }}
            showAllSections={false}
          />
        </div>

        {/* Tasks Sidebar */}
        <div className="space-y-6">
          {/* Task Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Taken
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actieve taken</span>
                  <Badge variant="secondary">{activeTasks.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vandaag</span>
                  <Badge className="bg-orange-100 text-orange-800">{todayTasks.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verlopen</span>
                  <Badge variant="destructive">{overdueTasks.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Afgerond</span>
                  <Badge className="bg-green-100 text-green-800">{completedTasks.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actieve Taken</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedActiveTasks.slice(0, 5).map((task) => {
                  const taskTypeConfig = getTaskTypeConfig(task.task_type)
                  const priorityConfig = getPriorityConfig(task.priority)
                  const isOverdue = task.due_date < new Date().toISOString().split('T')[0]
                  const isToday = task.due_date === new Date().toISOString().split('T')[0]
                  
                  return (
                    <div key={task.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{taskTypeConfig?.icon || '📝'}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={isOverdue ? "destructive" : isToday ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {isOverdue ? 'Verlopen' : isToday ? 'Vandaag' : formatTaskDate(task.due_date)}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${priorityConfig?.badge_color}`}
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
                          className="shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                
                {activeTasks.length > 5 && (
                  <Button asChild variant="outline" className="w-full">
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
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Nog geen taken</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Voeg je eerste taak toe voor deze bloem.
                </p>
                <Button
                  onClick={() => setShowAddTask(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
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