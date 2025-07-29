"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus,
  Filter,
  MoreVertical
} from "lucide-react"
import { TaskService } from "@/lib/services/task.service"
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
  getWeekStartDate,
  TASK_TYPE_CONFIGS,
  PRIORITY_CONFIGS
} from "@/lib/types/tasks"

interface WeeklyTaskListProps {
  onTaskEdit?: (task: WeeklyTask) => void
  onTaskAdd?: (plantId?: string) => void
}

export function WeeklyTaskList({ onTaskEdit, onTaskAdd }: WeeklyTaskListProps) {
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

  // Load weekly calendar
  const loadWeeklyCalendar = async (weekStart: Date) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await TaskService.getWeeklyCalendar(weekStart)
      
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
  }

  // Complete/uncomplete task with better state management
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    console.log('handleTaskComplete called:', { taskId, completed, updatingTasks: Array.from(updatingTasks) })
    
    // Prevent multiple simultaneous updates of the same task
    if (updatingTasks.has(taskId)) {
      console.log('Task already updating, skipping:', taskId)
      return
    }

    try {
      // Add task to updating set
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.add(taskId)
        console.log('Added to updating set:', taskId, 'Set size:', newSet.size)
        return newSet
      })

      // Update task in database first (no optimistic update to prevent conflicts)
      console.log('Updating task in database:', taskId, completed)
      const { error } = await TaskService.updateTask(taskId, { completed })
      
      if (error) {
        console.error('Error updating task:', error)
        throw new Error(error)
      }
      
      console.log('Task updated successfully in database:', taskId)
      
      // Reload calendar to get fresh data from database
      await loadWeeklyCalendar(currentWeekStart)
      
    } catch (err) {
      console.error('Error completing task:', err)
      // Ensure we reload on any error
      await loadWeeklyCalendar(currentWeekStart)
    } finally {
      // Always remove task from updating set
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        console.log('Removed from updating set:', taskId, 'Set size:', newSet.size)
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
  }, [currentWeekStart])

  // Task Card Component
  const TaskCard = ({ task, compact = false, showPlantInfo = false }: { task: WeeklyTask; compact?: boolean; showPlantInfo?: boolean }) => {
    const taskTypeConfig = getTaskTypeConfig(task.task_type)
    const priorityConfig = getPriorityConfig(task.priority)
    
    return (
      <Card className={`mb-3 transition-all duration-200 ${task.completed ? 'opacity-70 bg-gray-50 border-gray-300' : 'bg-white border-gray-200'} ${compact ? 'p-2' : ''}`}>
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-start gap-3">
            {/* Enhanced Checkbox with better styling */}
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
              className={`mt-1 transition-all duration-200 ${task.completed ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : ''}`}
              disabled={updatingTasks.has(task.id)}
            />
            
            <div className="flex-1 min-w-0">
              {/* Plantvak → Bloem info - always show for now */}
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ 
                      backgroundColor: task.plant_color || '#10B981',
                      borderColor: task.plant_color || '#10B981'
                    }}
                  />
                  <span className="font-medium">{task.plant_bed_name}</span>
                </div>
                <span>→</span>
                <span className="text-gray-800 font-medium">{task.plant_name}</span>
              </div>

              {/* Task title with better completed styling */}
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-lg transition-all duration-200 ${task.completed ? 'opacity-60' : ''}`}>
                  {taskTypeConfig?.icon || '📝'}
                </span>
                <div className="flex-1">
                  <h4 className={`font-medium transition-all duration-200 ${
                    task.completed 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className={`text-sm mt-1 transition-all duration-200 ${
                      task.completed ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Task metadata with improved completed state styling */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority badge */}
                <Badge 
                  variant="secondary" 
                  className={`transition-all duration-200 ${
                    task.completed 
                      ? 'opacity-60 bg-gray-200 text-gray-500' 
                      : priorityConfig?.badge_color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {priorityConfig?.label || task.priority}
                </Badge>

                {/* Task type badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs transition-all duration-200 ${
                    task.completed ? 'opacity-60 border-gray-300 text-gray-400' : ''
                  }`}
                >
                  {taskTypeConfig?.label || task.task_type}
                </Badge>

                {/* Due date */}
                <div className={`flex items-center gap-1 text-xs transition-all duration-200 ${
                  task.completed ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  {formatTaskDate(task.due_date)}
                </div>

                {/* Completed indicator */}
                {task.completed && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Voltooid
                  </Badge>
                )}

                {/* Status indicator - only show for non-completed tasks */}
                {!task.completed && task.status_category === 'overdue' && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Verlopen
                  </Badge>
                )}
                
                {!task.completed && task.status_category === 'today' && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Vandaag
                  </Badge>
                )}
              </div>
            </div>

            {/* Action button */}
            {onTaskEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskEdit(task)}
                className="shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
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
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {day.day_name} {new Date(day.date).getDate()}
              {day.is_today && <Badge className="ml-2">Vandaag</Badge>}
            </CardTitle>
            
            <div className="flex gap-2">
              {day.overdue_count > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {day.overdue_count} verlopen
                </Badge>
              )}
              {day.completed_count > 0 && (
                <Badge variant="secondary" className="text-xs">
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
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fout bij laden</h3>
          <p className="text-gray-600 mb-4">{error}</p>
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
                <p className="text-sm text-gray-600">
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

      {/* Week summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{calendar.total_tasks}</div>
              <div className="text-sm text-gray-600">Totaal taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{calendar.completed_tasks}</div>
              <div className="text-sm text-gray-600">Afgerond</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{calendar.overdue_tasks}</div>
              <div className="text-sm text-gray-600">Verlopen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={config.show_completed}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, show_completed: !!checked }))
                }
              />
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
                  <p className="text-gray-600">Geen taken deze week!</p>
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Geen taken deze week!
            </h3>
            <p className="text-gray-600 mb-4">
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
    </div>
  )
}