"use client"

// Simple weekly tasks view for users - Updated for preview deployment
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from "lucide-react"
import { TaskService } from '@/lib/services/task.service'
import type { Task } from '@/lib/supabase'

interface SimpleTasksViewProps {
  userId: string
  gardenId?: string
}

export function SimpleTasksView({ userId, gardenId }: SimpleTasksViewProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get start of week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Get end of week (Sunday)
  const getWeekEnd = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + 7
    return new Date(d.setDate(diff))
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get week range string
  const getWeekRange = (): string => {
    const start = getWeekStart(currentWeek)
    const end = getWeekEnd(currentWeek)
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  // Load tasks for current week
  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const startDate = getWeekStart(currentWeek).toISOString().split('T')[0]
      const endDate = getWeekEnd(currentWeek).toISOString().split('T')[0]

      const { data, error } = await TaskService.getWeeklyCalendar({
        userId,
        gardenId,
        startDate,
        endDate
      })

      if (error) {
        setError(error)
        return
      }

      setTasks(data || [])
    } catch (err) {
      setError('Fout bij het laden van taken')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mark task as completed
  const completeTask = async (taskId: string) => {
    try {
      const { error } = await TaskService.updateTask(taskId, {
        completed_at: new Date().toISOString()
      })

      if (error) {
        setError(error)
        return
      }

      // Reload tasks
      await loadTasks()
    } catch (err) {
      setError('Fout bij het voltooien van taak')
      console.error('Error completing task:', err)
    }
  }

  // Group tasks by day
  const groupTasksByDay = () => {
    const grouped: Record<string, Task[]> = {}
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(getWeekStart(currentWeek))
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      grouped[dateKey] = []
    }

    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = task.due_date.split('T')[0]
        if (grouped[dateKey]) {
          grouped[dateKey].push(task)
        }
      }
    })

    return grouped
  }

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get task type icon
  const getTaskTypeIcon = (taskType: string): string => {
    switch (taskType) {
      case 'watering':
        return '💧'
      case 'fertilizing':
        return '🌱'
      case 'pruning':
        return '✂️'
      case 'harvesting':
        return '🌾'
      case 'planting':
        return '🌱'
      case 'pest_control':
        return '🐛'
      case 'general':
        return '🔧'
      default:
        return '📝'
    }
  }

  // Load tasks when week changes
  useEffect(() => {
    loadTasks()
  }, [currentWeek, userId, gardenId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Wekelijks Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Taken laden...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Wekelijks Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadTasks} variant="outline">
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedTasks = groupTasksByDay()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Wekelijks Overzicht
        </CardTitle>
        
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige week
          </Button>
          
          <span className="text-sm font-medium text-gray-600">
            {getWeekRange()}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
          >
            Volgende week
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Geen taken voor deze week</p>
            <p className="text-sm text-gray-500 mt-1">
              Alle taken zijn voltooid of er zijn geen taken gepland
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([dateKey, dayTasks]) => (
              <div key={dateKey} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  {formatDate(new Date(dateKey))}
                </h3>
                
                {dayTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Geen taken</p>
                ) : (
                  <div className="space-y-2">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          task.completed_at ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {getTaskTypeIcon(task.task_type || 'general')}
                          </span>
                          
                          <div>
                            <p className={`font-medium ${
                              task.completed_at ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </p>
                            
                            {task.description && (
                              <p className={`text-sm ${
                                task.completed_at ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className={getPriorityColor(task.priority || 'medium')}
                              >
                                {task.priority || 'medium'}
                              </Badge>
                              
                              {task.task_type && (
                                <Badge variant="outline">
                                  {task.task_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!task.completed_at && (
                          <Button
                            size="sm"
                            onClick={() => completeTask(task.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Voltooid
                          </Button>
                        )}
                        
                        {task.completed_at && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Voltooid</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}