"use client"

// Simple weekly tasks view for users - Updated for preview deployment
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-supabase-auth"
import { supabase } from "@/lib/supabase"
import { sortTasks, getTaskUrgency, getTaskUrgencyStyles } from "@/lib/utils/task-sorting"

interface SimpleTasksViewProps {
  // No props needed - gets user from auth
  // Using Record<never, never> to satisfy linting rules
}

export function SimpleTasksView({}: SimpleTasksViewProps) {
  const router = useRouter()
  const { user, getAccessibleGardens, loadGardenAccess } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [gardenNames, setGardenNames] = useState<string[]>([])
  const [gardenAccessLoaded, setGardenAccessLoaded] = useState(false)
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set())

  // Handle task completion
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (completingTasks.has(taskId)) return // Prevent double clicks
    
    try {
      setCompletingTasks(prev => new Set(prev).add(taskId))
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq('id', taskId)
      
      if (error) {
        console.error('Error updating task:', error)
        return
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed, completed_at: completed ? new Date().toISOString() : null }
            : task
        )
      )
      
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompletingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  // Calculate week dates
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date)
    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1 // Convert Sunday=0 to Monday=0
    startOfWeek.setDate(date.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return { startOfWeek, endOfWeek }
  }

  const formatWeekRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    const end = endDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    return `${start} - ${end}`
  }

  // Load garden access first
  useEffect(() => {
    async function ensureGardenAccess() {
      if (!user) return
      
      console.log('🔍 SimpleTasksView - Initial user state:', {
        email: user.email,
        role: user.role,
        garden_access: user.garden_access,
        hasAccess: user.garden_access?.length > 0
      })
      
      // For users, ensure garden access is loaded
      if (user.role === 'user' && (!user.garden_access || user.garden_access.length === 0)) {
        console.log('🔍 SimpleTasksView - Loading garden access for user...')
        try {
          await loadGardenAccess()
          setGardenAccessLoaded(true)
          console.log('✅ SimpleTasksView - Garden access loaded')
        } catch (error) {
          console.error('❌ SimpleTasksView - Failed to load garden access:', error)
          setGardenAccessLoaded(true) // Still mark as loaded to avoid infinite loop
        }
      } else {
        setGardenAccessLoaded(true)
      }
    }
    
    ensureGardenAccess()
  }, [user?.id, loadGardenAccess])

  // Load garden names
  useEffect(() => {
    async function loadGardenNames() {
      if (!user?.garden_access || !gardenAccessLoaded) return
      
      try {
        const accessibleGardens = getAccessibleGardens()
        if (accessibleGardens.length > 0) {
          const { data: gardens } = await supabase
            .from('gardens')
            .select('name')
            .in('id', accessibleGardens)
          
          setGardenNames(gardens?.map(g => g.name) || [])
        }
      } catch (error) {
        console.error('Error loading garden names:', error)
      }
    }
    
    loadGardenNames()
  }, [user?.garden_access, getAccessibleGardens, gardenAccessLoaded])

  // Load tasks for current week
  useEffect(() => {
    async function loadWeeklyTasks() {
      if (!user || !gardenAccessLoaded) return
      
      setLoading(true)
      try {
        // Check if user garden access is loaded
        if (user.role === 'user' && (!user.garden_access || user.garden_access.length === 0)) {
          console.log('🔍 SimpleTasksView - User has no garden access loaded')
          setTasks([])
          setLoading(false)
          return
        }
        
        const accessibleGardens = getAccessibleGardens()
        const { startOfWeek, endOfWeek } = getWeekDates(currentWeek)
        
        console.log('🔍 SimpleTasksView - User:', user?.email)
        console.log('🔍 SimpleTasksView - Garden access:', user?.garden_access)
        console.log('🔍 SimpleTasksView - Accessible gardens:', accessibleGardens)
        console.log('🔍 SimpleTasksView - Week range:', { startOfWeek: startOfWeek.toISOString(), endOfWeek: endOfWeek.toISOString() })
        
        if (accessibleGardens.length === 0) {
          console.log('⚠️ SimpleTasksView - No accessible gardens, showing empty state')
          setTasks([])
          setLoading(false)
          return
        }

        // Load both plant tasks and plant bed tasks for accessible gardens
        const [plantTasksResult, plantBedTasksResult] = await Promise.all([
          // Plant tasks
          supabase
            .from('tasks')
            .select(`
              *,
              plants (
                name,
                plant_beds (
                  name,
                  garden_id,
                  gardens (id, name)
                )
              )
            `)
            .not('plant_id', 'is', null)
            .gte('due_date', startOfWeek.toISOString().split('T')[0])
            .lte('due_date', endOfWeek.toISOString().split('T')[0]),
          
          // Plant bed tasks  
          supabase
            .from('tasks')
            .select(`
              *,
              plant_beds (
                name,
                garden_id,
                gardens (id, name)
              )
            `)
            .not('plant_bed_id', 'is', null)
            .is('plant_id', null)
            .gte('due_date', startOfWeek.toISOString().split('T')[0])
            .lte('due_date', endOfWeek.toISOString().split('T')[0])
        ])

        // Combine and filter tasks by garden access
        const plantTasks = (plantTasksResult.data || []).filter(task => 
          task.plants?.plant_beds?.gardens?.id && 
          accessibleGardens.includes(task.plants.plant_beds.gardens.id)
        )
        
        const plantBedTasks = (plantBedTasksResult.data || []).filter(task =>
          task.plant_beds?.gardens?.id &&
          accessibleGardens.includes(task.plant_beds.gardens.id)
        )

        const allTasks = [...plantTasks, ...plantBedTasks]

        console.log('🔍 SimpleTasksView - Raw tasks loaded:', {
          plantTasks: plantTasks.length,
          plantBedTasks: plantBedTasks.length,
          total: allTasks.length,
          sampleTask: allTasks[0] // Show first task for debugging
        })

        if (allTasks) {
          const sortedTasks = sortTasks(allTasks)
          
          // Filter for this week + overdue
          const now = new Date()
          const today = new Date(now)
          today.setHours(0, 0, 0, 0)
          
          const weeklyTasks = sortedTasks.filter(task => {
            if (task.completed) return false
            if (!task.due_date) return false
            
            const dueDate = new Date(task.due_date)
            const isOverdue = dueDate < today
            const isThisWeek = dueDate >= startOfWeek && dueDate <= endOfWeek
            
            return isOverdue || isThisWeek
          })
          
          setTasks(weeklyTasks)
          console.log('🔍 SimpleTasksView - Final tasks set:', {
            weeklyTasks: weeklyTasks.length,
            sampleTask: weeklyTasks[0]
          })
        }
      } catch (error) {
        console.error('Error loading weekly tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWeeklyTasks()
  }, [user, currentWeek, getAccessibleGardens, gardenAccessLoaded])

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const { startOfWeek, endOfWeek } = getWeekDates(currentWeek)

  if (loading || !gardenAccessLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Logbook button - always visible */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mijn Taken</h1>
              <p className="text-gray-600 mt-1">Laden...</p>
            </div>
            <Button 
              onClick={() => router.push('/logbook')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Logboek
            </Button>
          </div>
          
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logbook button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mijn Taken</h1>
            {gardenNames.length > 0 && (
              <p className="text-gray-600 mt-1">{gardenNames.join(', ')}</p>
            )}
          </div>
          <Button 
            onClick={() => router.push('/logbook')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Logboek
          </Button>
        </div>

        {/* Week Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Calendar className="w-5 h-5" />
                  Week {formatWeekRange(startOfWeek, endOfWeek)}
                </CardTitle>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tasks for this week */}
        <Card>
          <CardHeader>
            <CardTitle>Taken deze week ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Geen taken deze week</h3>
                <p>Je hebt geen openstaande taken voor deze periode.</p>
                {gardenNames.length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Je hebt nog geen tuinen toegewezen gekregen. Neem contact op met de beheerder.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const urgency = getTaskUrgency(task)
                  const styles = getTaskUrgencyStyles(urgency)
                  
                  // Create a display title from task_type and description
                  const taskTitle = task.description || `${task.task_type} taak` || 'Taak'
                  
                  return (
                    <div key={task.id} className={`p-4 border rounded-lg ${styles.container}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${styles.title}`}>
                          {taskTitle}
                        </h4>
                        <Badge className={`text-xs ${styles.badge}`}>
                          {styles.badgeText}
                        </Badge>
                      </div>
                      
                      {/* Show plant or plant bed info */}
                      {task.plants ? (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.plants.name} - {task.plants.plant_beds?.name} ({task.plants.plant_beds?.gardens?.name})
                        </p>
                      ) : task.plant_beds ? (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.plant_beds.name} ({task.plant_beds.gardens?.name})
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 mb-2">
                          Algemene taak
                        </p>
                      )}
                      
                      {/* Show task type if no description */}
                      {!task.description && task.task_type && (
                        <p className="text-sm text-gray-700 mb-2 capitalize">
                          Type: {task.task_type}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Deadline: {new Date(task.due_date).toLocaleDateString('nl-NL')}
                        </span>
                        {task.priority && task.priority !== 'medium' && (
                          <span className="font-medium">
                            Prioriteit: {task.priority === 'high' ? '🔴 Hoog' : '🔵 Laag'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}