'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { TaskService, type WeeklyTask } from '@/lib/services/task.service'

interface SimpleTasksViewProps {
  userId?: string
  gardenId?: string
}

export function SimpleTasksView({ userId, gardenId }: SimpleTasksViewProps) {
  const [todayTasks, setTodayTasks] = useState<WeeklyTask[]>([])
  const [overdueTasks, setOverdueTasks] = useState<WeeklyTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [userId, gardenId])

  const loadTasks = async () => {
    try {
      setLoading(true)
      
      const [todayResult, overdueResult] = await Promise.all([
        TaskService.getTodayTasks(),
        TaskService.getOverdueTasks()
      ])

      if (todayResult.data) setTodayTasks(todayResult.data)
      if (overdueResult.data) setOverdueTasks(overdueResult.data)
      
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
    } finally {
      setLoading(false)
    }
  }

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const result = await TaskService.bulkCompleteTasks([taskId], completed)
      if (!result.error) {
        loadTasks() // Reload tasks after update
      }
    } catch (error) {
      // Secure error handling for banking standards - no console logging in production
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Taken laden...</span>
      </div>
    )
  }

  const totalTasks = todayTasks.length + overdueTasks.length

  if (totalTasks === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Geen taken vandaag</h3>
          <p className="text-muted-foreground">
            Je hebt geen taken die vandaag moeten worden uitgevoerd.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Achterstallige Taken ({overdueTasks.length})
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              Deze taken zijn over tijd en moeten zo snel mogelijk worden afgerond
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {task.plant && (
                      <Badge variant="outline" className="text-xs">
                        {task.plant.name}
                      </Badge>
                    )}
                    <Badge variant="destructive" className="text-xs">
                      Over tijd
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleTaskToggle(task.id, !task.completed)}
                  variant={task.completed ? "outline" : "default"}
                  className="ml-4"
                >
                  {task.completed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Afgerond
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Afronden
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Taken voor Vandaag ({todayTasks.length})
            </CardTitle>
            <CardDescription>
              Taken die vandaag moeten worden uitgevoerd
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {task.plant && (
                      <Badge variant="outline" className="text-xs">
                        {task.plant.name}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Vandaag
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleTaskToggle(task.id, !task.completed)}
                  variant={task.completed ? "outline" : "default"}
                  className="ml-4"
                >
                  {task.completed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Afgerond
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Afronden
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {totalTasks > 0 && (
          <p>
            Je hebt {totalTasks} ta{totalTasks === 1 ? 'ak' : 'ken'} voor vandaag
            {overdueTasks.length > 0 && ` (${overdueTasks.length} achterstallig)`}
          </p>
        )}
      </div>
    </div>
  )
}