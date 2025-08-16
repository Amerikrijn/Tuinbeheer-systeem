"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskDetailsDialog } from "./task-details-dialog"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  CheckCircle,
  Leaf
} from "lucide-react"
import { TaskService } from "@/lib/services/task.service"
import { useAuth } from "@/hooks/use-supabase-auth"
import type { 
  WeeklyCalendar, 
  WeeklyTask, 
  TaskCalendarDay,
  WeekViewConfig 
} from "@/lib/types/tasks"
import { 
  getTaskTypeConfig, 
  getPriorityConfig, 
  formatTaskDate, 
  getWeekStartDate
} from "@/lib/types/tasks"

interface WeeklyTaskListProps {
  onTaskEdit?: (task: WeeklyTask) => void
  onTaskAdd?: (plantId?: string) => void
}

export function WeeklyTaskList({ onTaskEdit, onTaskAdd }: WeeklyTaskListProps) {
  const { user } = useAuth()
  const [calendar, setCalendar] = useState<WeeklyCalendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate())
  const [selectedDay, setSelectedDay] = useState<TaskCalendarDay | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [config, setConfig] = useState<WeekViewConfig>({
    week_start: getWeekStartDate().toISOString().split('T')[0],
    show_completed: true,
    group_by_plant: true,
    sort_by: 'due_date'
  })

  // Add loading state for individual tasks
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())
  
  // Task details dialog state
  const [selectedTask, setSelectedTask] = useState<WeeklyTask | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)

  // Load weekly calendar
  const loadWeeklyCalendar = useCallback(async (weekStart: Date) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await TaskService.getWeeklyCalendar(weekStart, user)
      
      if (error) {
        setError(error)
        return
      }
      
      setCalendar(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Complete/uncomplete task with simple, reliable approach
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    // Prevent multiple simultaneous updates of the same task
    if (updatingTasks.has(taskId)) {
      return
    }

    try {
      // Add task to updating set
      setUpdatingTasks(prev => new Set(prev).add(taskId))

      // Update task in database
      const { error } = await TaskService.updateTask(taskId, { completed })
      
      if (error) {
        // Console logging removed for banking standards.error('Error updating task:', error)
        return
      }
      
      // Reload calendar to get fresh data from database
      await loadWeeklyCalendar(currentWeekStart)
      
    } catch (err) {
      // Console logging removed for banking standards.error('Error completing task:', err)
    } finally {
      // Always remove task from updating set
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
  }

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStartDate())
  }

  // Load data when week changes
  useEffect(() => {
    loadWeeklyCalendar(currentWeekStart)
  }, [currentWeekStart, loadWeeklyCalendar])

  // Task Card Component
  const TaskCard = ({ task, compact = false, showPlantInfo = false }: { task: WeeklyTask; compact?: boolean; showPlantInfo?: boolean }) => {
    const taskTypeConfig = getTaskTypeConfig(task.task_type)
    const priorityConfig = getPriorityConfig(task.priority)
    
    const handleTaskDoubleClick = () => {
      setSelectedTask(task)
      setShowTaskDialog(true)
    }
    
    return (
      <Card 
        className={`mb-3 transition-all duration-200 cursor-pointer hover:shadow-md ${task.completed ? 'opacity-70 bg-muted border-muted-foreground' : 'bg-card border-border'} ${compact ? 'p-2' : ''}`}
        onClick={() => onTaskEdit?.(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onTaskEdit?.(task)
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Taak: ${task.title}. ${task.completed ? 'Voltooid' : 'Niet voltooid'}. Klik om details te bekijken.`}
      >
        <div className={`${compact ? 'p-2' : 'p-4'} flex items-start gap-3`}>
          <div className="flex-shrink-0 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleTaskComplete(task.id, !task.completed)
              }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                task.completed 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground hover:border-primary hover:bg-primary/10'
              }`}
              aria-label={task.completed ? 'Markeer als niet voltooid' : 'Markeer als voltooid'}
            >
              {task.completed && (
                <CheckCircle2 
                  className={`w-3 h-3 ${
                    task.completed 
                      ? 'text-primary-foreground' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                />
              )}
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 text-base text-foreground leading-snug">
              <span className="font-medium text-sm text-muted-foreground">{task.garden_name}</span>
              {task.garden_name && task.plant_bed_name && (
                <span className="text-muted-foreground" aria-hidden>→</span>
              )}
              <span className="font-medium text-sm text-muted-foreground">{task.plant_bed_name}</span>
              <span className="text-muted-foreground" aria-hidden>•</span>
              <div className="flex items-center gap-1">
                <Leaf className="h-3 w-3 text-primary" />
                <span className={`font-semibold truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
              </div>
            </div>
            
            {task.description && (
              <p className={`text-sm mb-2 line-clamp-2 ${
                task.completed ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              {task.priority && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 ${
                    task.completed 
                      ? 'opacity-60 bg-muted text-muted-foreground' 
                      : priorityConfig?.badge_color || 'bg-muted text-muted-foreground'
                  }`}
                >
                  {priorityConfig?.label || task.priority}
                </Badge>
              )}
              
              {task.due_date && (
                <span className={`flex items-center gap-1 ${
                  task.completed ? 'opacity-60 border-muted text-muted-foreground' : 'text-muted-foreground'
                }`}>
                  <Calendar className="h-3 w-3" />
                  {formatTaskDate(task.due_date)}
                </span>
              )}
              
              <span className={`${
                task.completed ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}>
                {task.plant_name}
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Day Card Component
  const DayCard = ({ day }: { day: TaskCalendarDay }) => {
    // Separate active and completed tasks
    const activeTasks = day.tasks.filter(t => !t.completed)
    const completedTasks = day.tasks.filter(t => t.completed)
    
    // Sort active tasks by priority (high first), then by due date
    const sortedActiveTasks = [...activeTasks].sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority // Higher priority first
      }
      
      // Then sort by due date
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    
    if (day.tasks.length === 0) return null

    return (
      <Card className={`mb-4 ${day.is_today ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3 text-foreground">
              <Calendar className="w-6 h-6 text-primary" />
              {day.day_name} {new Date(day.date).getDate()}
              {day.is_today && <Badge className="ml-2">Vandaag</Badge>}
            </CardTitle>
            
            <div className="flex gap-2">
              {day.overdue_count > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {day.overdue_count} verlopen
                </Badge>
              )}
              {day.completed_count > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {day.completed_count} klaar
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Show active tasks first */}
            {sortedActiveTasks.map(task => (
              <TaskCard key={task.id} task={task} showPlantInfo />
            ))}
            
                     {/* Show completed tasks at the bottom with strikethrough */}
         {completedTasks.map(task => (
           <div key={task.id} className="opacity-60">
             <TaskCard task={task} showPlantInfo />
           </div>
         ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Fout bij laden</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => loadWeeklyCalendar(currentWeekStart)}>
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!calendar) return null

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  Week {calendar.week_number}, {calendar.year}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(calendar.week_start).toLocaleDateString('nl-NL', { 
                    day: 'numeric', 
                    month: 'short' 
                  })} - {new Date(calendar.week_end).toLocaleDateString('nl-NL', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentWeek}
              >
                Vandaag
              </Button>
              
              {onTaskAdd && (
                <Button
                  size="sm"
                  onClick={() => onTaskAdd()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Taak
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                onClick={() => setConfig(prev => ({ ...prev, show_completed: !prev.show_completed }))}
                className="transition-colors"
              >
                <CheckCircle
                  className={`h-4 w-4 ${
                    config.show_completed 
                      ? 'text-green-600 fill-green-100' 
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
              <span className="text-sm">Toon afgeronde taken</span>
            </label>
            

          </div>
        </CardContent>
      </Card>

      {/* Weekly task list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Alle taken deze week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Get all tasks for the week
            const allWeekTasks = calendar.days.flatMap(day => day.tasks)
            const tasksToShow = config.show_completed ? allWeekTasks : allWeekTasks.filter(t => !t.completed)
            
            if (tasksToShow.length === 0) {
              return (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Geen taken deze week!</p>
                </div>
              )
            }
            
            // Sort tasks: completed at bottom, then by priority (high first), then by due date
            const sortedTasks = [...tasksToShow].sort((a, b) => {
              // 1. Completed tasks go to bottom
              if (a.completed !== b.completed) {
                return a.completed ? 1 : -1
              }
              
              // 2. For non-completed tasks, sort by priority (high > medium > low)
              if (!a.completed && !b.completed) {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
                const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
                const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
                
                if (aPriority !== bPriority) {
                  return bPriority - aPriority // Higher priority first
                }
              }
              
              // 3. Then sort by due date
              return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            })
            
            return (
              <div className="space-y-3">
                {sortedTasks.map(task => (
                  <TaskCard key={task.id} task={task} showPlantInfo />
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Empty state */}
      {calendar.days.every(day => day.tasks.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              Geen taken deze week!
            </h3>
            <p className="text-muted-foreground mb-4">
              Je hebt geen taken gepland voor deze week.
            </p>
            {onTaskAdd && (
              <Button
                onClick={() => onTaskAdd()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Eerste taak toevoegen
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        isOpen={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false)
          setSelectedTask(null)
        }}
        onTaskUpdated={() => {
          loadWeeklyCalendar(currentWeekStart)
        }}
        onTaskDeleted={() => {
          loadWeeklyCalendar(currentWeekStart)
        }}
      />
    </div>
  )
}