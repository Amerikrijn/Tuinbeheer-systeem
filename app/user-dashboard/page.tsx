'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle, TreePine } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Mock garden data
const MOCK_GARDENS = [
  {
    id: '1',
    name: 'Hoofdtuin',
    description: 'De centrale tuin achter het huis'
  },
  {
    id: '2', 
    name: 'Vooruin',
    description: 'De tuin aan de voorkant bij de straat'
  }
]

// Mock tasks for specific gardens
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Rozen bijsnoeien',
    description: 'De rozen in het eerste bed moeten gesnoeid worden',
    garden_id: '1',
    priority: 'high' as const,
    status: 'pending' as const,
    due_date: '2024-01-20',
    estimated_duration: 30
  },
  {
    id: '2',
    title: 'Onkruid wieden',
    description: 'Onkruid verwijderen tussen de planten',
    garden_id: '1', 
    priority: 'medium' as const,
    status: 'pending' as const,
    due_date: '2024-01-22',
    estimated_duration: 45
  },
  {
    id: '3',
    title: 'Gras maaien',
    description: 'Het gazon in de vooruin maaien',
    garden_id: '2',
    priority: 'medium' as const, 
    status: 'completed' as const,
    due_date: '2024-01-18',
    estimated_duration: 60
  },
  {
    id: '4',
    title: 'Water geven',
    description: 'Alle planten water geven',
    garden_id: '2',
    priority: 'high' as const,
    status: 'pending' as const, 
    due_date: '2024-01-19',
    estimated_duration: 20
  }
]

interface Task {
  id: string
  title: string
  description: string
  garden_id: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'in_progress'
  due_date: string
  estimated_duration: number
}

export default function UserDashboardPage() {
  const { user, hasGardenAccess, getAccessibleGardens } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Filter tasks based on user's garden access
      const accessibleGardens = getAccessibleGardens()
      const userTasks = MOCK_TASKS.filter(task => 
        user.role === 'admin' || accessibleGardens.includes(task.garden_id)
      )
      setTasks(userTasks)
      setLoading(false)
    }
  }, [user, getAccessibleGardens])

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const }
        : task
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />
      default: return <AlertTriangle className="w-4 h-4 text-orange-600" />
    }
  }

  const getGardenName = (gardenId: string) => {
    return MOCK_GARDENS.find(g => g.id === gardenId)?.name || 'Onbekende tuin'
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Taken laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mijn Taken</h1>
          <p className="text-muted-foreground mt-1">
            Welkom terug, {user?.full_name || user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TreePine className="w-5 h-5 text-green-600" />
          <span className="text-sm text-muted-foreground">
            {user?.role === 'admin' ? 'Alle tuinen' : `${getAccessibleGardens().length} tuin(en)`}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Te Doen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              openstaande taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voltooid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              afgeronde taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Tijd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pendingTasks.reduce((acc, task) => acc + task.estimated_duration, 0)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              geschatte werktijd
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Openstaande Taken ({pendingTasks.length})</span>
              </CardTitle>
              <CardDescription>
                Deze taken wachten nog op uitvoering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority === 'high' ? 'Hoog' : 
                         task.priority === 'medium' ? 'Middel' : 'Laag'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>📍 {getGardenName(task.garden_id)}</span>
                      <span>⏱️ {task.estimated_duration} min</span>
                      <span>📅 {new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Voltooid
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Voltooide Taken ({completedTasks.length})</span>
              </CardTitle>
              <CardDescription>
                Deze taken zijn succesvol afgerond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-medium text-green-800">{task.title}</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        Voltooid
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>📍 {getGardenName(task.garden_id)}</span>
                      <span>⏱️ {task.estimated_duration} min</span>
                      <span>✅ Afgerond</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Tasks */}
        {tasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TreePine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Geen taken gevonden</h3>
              <p className="text-muted-foreground">
                Er zijn momenteel geen taken toegewezen aan jouw tuin(en).
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}