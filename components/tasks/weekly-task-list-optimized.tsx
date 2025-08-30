"use client"

import React, { useState, useCallback, useMemo } from 'react'
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
  Clock, 
  Plus,
  Loader2
} from "lucide-react"
import { useWeeklyCalendar, useUpdateTask, usePrefetchWeeklyCalendar } from "@/hooks/use-tasks"
import type { 
  WeeklyTask, 
  TaskCalendarDay
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

export function WeeklyTaskListOptimized({ onTaskEdit, onTaskAdd }: WeeklyTaskListProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate())
  const [selectedDay, setSelectedDay] = useState<TaskCalendarDay | null>(null)
  const [selectedTask, setSelectedTask] = useState<WeeklyTask | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  
  // Use React Query hooks
  const { data: calendar, isLoading, error, isFetching } = useWeeklyCalendar(currentWeekStart)
  const updateTaskMutation = useUpdateTask()
  const { prefetchWeek } = usePrefetchWeeklyCalendar()
  
  // Prefetch adjacent weeks for smoother navigation
  React.useEffect(() => {
    const nextWeek = new Date(currentWeekStart)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const prevWeek = new Date(currentWeekStart)
    prevWeek.setDate(prevWeek.getDate() - 7)
    
    // Prefetch in background
    prefetchWeek(nextWeek)
    prefetchWeek(prevWeek)
  }, [currentWeekStart, prefetchWeek])
  
  // Memoized calculations
  const weekDisplay = useMemo(() => {
    if (!calendar) return ''
    const startDate = new Date(calendar.week_start)
    const endDate = new Date(calendar.week_end)
    return `${startDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }, [calendar])
  
  const stats = useMemo(() => {
    if (!calendar) return { total: 0, completed: 0, overdue: 0 }
    return {
      total: calendar.total_tasks,
      completed: calendar.completed_tasks,
      overdue: calendar.overdue_tasks
    }
  }, [calendar])
  
  // Handlers with useCallback to prevent re-renders
  const handleTaskComplete = useCallback(async (taskId: string, completed: boolean) => {
    await updateTaskMutation.mutateAsync({ 
      taskId, 
      data: { completed } 
    })
  }, [updateTaskMutation])
  
  const goToPreviousWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
  }, [currentWeekStart])
  
  const goToNextWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
  }, [currentWeekStart])
  
  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStartDate())
  }, [])
  
  // Task Card Component - Memoized to prevent re-renders
  const TaskCard = React.memo(({ 
    task, 
    compact = false 
  }: { 
    task: WeeklyTask
    compact?: boolean
  }) => {
    const taskTypeConfig = getTaskTypeConfig(task.task_type)
    const priorityConfig = getPriorityConfig(task.priority)
    const isUpdating = updateTaskMutation.isPending && 
      updateTaskMutation.variables?.taskId === task.id
    
    return (
      <Card 
        className={`mb-3 transition-all duration-200 cursor-pointer hover:shadow-md ${
          task.completed ? 'opacity-70 bg-muted border-muted-foreground' : 'bg-card border-border'
        } ${compact ? 'p-2' : ''} ${isUpdating ? 'opacity-50' : ''}`}
        onClick={() => !isUpdating && onTaskEdit?.(task)}
        tabIndex={0}
        role="button"
        aria-label={`Taak: ${task.title}. ${task.completed ? 'Voltooid' : 'Niet voltooid'}.`}
      >
        <div className={`${compact ? 'p-2' : 'p-4'} flex items-start gap-3`}>
          <div className="flex-shrink-0 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!isUpdating) {
                  handleTaskComplete(task.id, !task.completed)
                }
              }}
              disabled={isUpdating}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground hover:border-primary hover:bg-primary/10'
              } ${isUpdating ? 'cursor-not-allowed' : ''}`}
              aria-label={task.completed ? 'Markeer als niet voltooid' : 'Markeer als voltooid'}
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : task.completed ? (
                <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
              ) : null}
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-muted-foreground">{task.garden_name}</span>
              {task.garden_name && task.plant_bed_name && (
                <span className="text-muted-foreground">→</span>
              )}
              <span className="font-medium text-sm text-muted-foreground">{task.plant_bed_name}</span>
            </div>
            
            <h4 className={`font-medium mb-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h4>
            
            {task.plant_name && task.plant_name !== 'Plantvak taak' && (
              <p className="text-sm text-muted-foreground mb-2">
                Plant: {task.plant_name}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={taskTypeConfig.variant as any}
                className="text-xs"
              >
                {taskTypeConfig.icon && <taskTypeConfig.icon className="w-3 h-3 mr-1" />}
                {taskTypeConfig.label}
              </Badge>
              
              <Badge 
                variant={priorityConfig.variant as any}
                className="text-xs"
              >
                {priorityConfig.label}
              </Badge>
              
              {task.status_category === 'overdue' && !task.completed && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Te laat
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  })
  
  TaskCard.displayName = 'TaskCard'
  
  // Loading state
  if (isLoading && !calendar) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    )
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Er ging iets mis bij het laden van taken</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      {/* Week Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Week {calendar?.week_number || ''}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                disabled={isFetching}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentWeek}
                disabled={isFetching}
              >
                Vandaag
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                disabled={isFetching}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {weekDisplay}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{stats.total} taken</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{stats.completed} voltooid</span>
            </div>
            {stats.overdue > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span>{stats.overdue} te laat</span>
              </div>
            )}
          </div>
          
          {isFetching && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Bijwerken...
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Week Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {calendar?.days.map((day) => (
          <Card 
            key={day.date}
            className={`${day.is_today ? 'ring-2 ring-primary' : ''} ${
              day.is_weekend ? 'bg-muted/30' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {day.day_name}
                  {day.is_today && (
                    <Badge variant="default" className="ml-2 text-xs">
                      Vandaag
                    </Badge>
                  )}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(day.date).getDate()}
                </span>
              </div>
              
              {day.task_count > 0 && (
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-muted-foreground">
                    {day.task_count} {day.task_count === 1 ? 'taak' : 'taken'}
                  </span>
                  {day.completed_count > 0 && (
                    <span className="text-green-600">
                      {day.completed_count} voltooid
                    </span>
                  )}
                  {day.overdue_count > 0 && (
                    <span className="text-destructive">
                      {day.overdue_count} te laat
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {day.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Geen taken
                </p>
              ) : (
                <div className="space-y-2">
                  {day.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3"
                onClick={() => onTaskAdd?.()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Taak toevoegen
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        isOpen={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false)
          setSelectedTask(null)
        }}
        onTaskUpdated={() => {
          // React Query will automatically update the UI
        }}
        onTaskDeleted={() => {
          // React Query will automatically update the UI
        }}
      />
    </>
  )
}