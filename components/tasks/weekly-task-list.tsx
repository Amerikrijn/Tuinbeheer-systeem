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
    show_completed: false,
    group_by_plant: true,
    sort_by: 'due_date'
  })

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

  // Complete/uncomplete task
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await TaskService.updateTask(taskId, { completed })
      
      if (error) {
        console.error('Error updating task:', error)
        return
      }
      
      // Reload calendar
      await loadWeeklyCalendar(currentWeekStart)
    } catch (err) {
      console.error('Error completing task:', err)
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
  const TaskCard = ({ task, compact = false }: { task: WeeklyTask; compact?: boolean }) => {
    const taskTypeConfig = getTaskTypeConfig(task.task_type)
    const priorityConfig = getPriorityConfig(task.priority)
    
    return (
      <Card className={`mb-3 ${task.completed ? 'opacity-60' : ''} ${compact ? 'p-2' : ''}`}>
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              {/* Plantvak → Bloem info */}
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

              {/* Task title */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{taskTypeConfig?.icon || '📝'}</span>
                <div className="flex-1">
                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
              </div>

              {/* Task metadata */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority badge */}
                <Badge 
                  variant="secondary" 
                  className={priorityConfig?.badge_color || 'bg-gray-100 text-gray-800'}
                >
                  {priorityConfig?.label || task.priority}
                </Badge>

                {/* Task type badge */}
                <Badge variant="outline" className="text-xs">
                  {taskTypeConfig?.label || task.task_type}
                </Badge>

                {/* Due date */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatTaskDate(task.due_date)}
                </div>

                {/* Status indicator */}
                {task.status_category === 'overdue' && !task.completed && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Verlopen
                  </Badge>
                )}
                
                {task.status_category === 'today' && !task.completed && (
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
    const tasksToShow = config.show_completed ? day.tasks : day.tasks.filter(t => !t.completed)
    
    if (tasksToShow.length === 0) return null

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
          {/* Show all tasks in rows */}
          <div className="space-y-3">
            {tasksToShow.map(task => (
              <TaskCard key={task.id} task={task} showPlantInfo />
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
            
            return (
              <div className="space-y-3">
                {tasksToShow.map(task => (
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