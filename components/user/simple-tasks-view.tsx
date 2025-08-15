"use client"

// Simple weekly tasks view for users - Updated for preview deployment
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from "lucide-react"
import { TaskService } from '@/lib/services/task.service'
import { Task } from '@/lib/supabase'

interface SimpleTasksViewProps {
  userId: string
  gardenId?: string
}

export default function SimpleTasksView({ userId, gardenId }: SimpleTasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Get end of week (Sunday)
  const getWeekEnd = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? 0 : 7) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get tasks for current week
  const fetchWeekTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const weekStart = getWeekStart(currentWeek)
      const weekEnd = getWeekEnd(currentWeek)
      
      const result = await TaskService.getWeeklyCalendar(
        userId,
        weekStart.toISOString(),
        weekEnd.toISOString(),
        gardenId
      )
      
      if (result.error) {
        setError(result.error)
        setTasks([])
      } else {
        setTasks(result.data || [])
      }
    } catch (err) {
      setError('Fout bij ophalen taken')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Mark task as completed
  const completeTask = async (taskId: string) => {
    try {
      const result = await TaskService.updateTask(taskId, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        // Refresh tasks
        fetchWeekTasks()
      }
    } catch (err) {
      setError('Fout bij voltooien taak')
    }
  }

  // Navigate to previous week
  const previousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  // Navigate to next week
  const nextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  // Group tasks by day
  const groupTasksByDay = () => {
    const grouped: { [key: string]: Task[] } = {}
    
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

  useEffect(() => {
    fetchWeekTasks()
  }, [currentWeek, gardenId])

  const groupedTasks = groupTasksByDay()
  const weekStart = getWeekStart(currentWeek)
  const weekEnd = getWeekEnd(currentWeek)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Taken deze week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Laden...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Taken deze week
        </CardTitle>
        
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={previousWeek}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige week
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextWeek}
            className="flex items-center gap-1"
          >
            Volgende week
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen taken deze week</p>
            <p className="text-sm">Geniet van je vrije tijd in de tuin!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([dateKey, dayTasks]) => {
              const date = new Date(dateKey)
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <div key={dateKey} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {formatDate(date)}
                      {isToday && <Badge variant="secondary" className="ml-2">Vandaag</Badge>}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {dayTasks.length} taak{dayTasks.length !== 1 ? 'en' : ''}
                    </span>
                  </div>
                  
                  {dayTasks.length > 0 ? (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-2 rounded border ${
                            task.status === 'completed' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {task.status === 'completed' && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                              <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                {task.title}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                            {task.task_type && (
                              <Badge variant="outline" className="mt-1">
                                {task.task_type}
                              </Badge>
                            )}
                          </div>
                          
                          {task.status !== 'completed' && (
                            <Button
                              size="sm"
                              onClick={() => completeTask(task.id)}
                              className="ml-2"
                            >
                              Voltooid
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Geen taken gepland
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}