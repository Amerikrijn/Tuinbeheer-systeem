'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, AlertTriangle, TreePine, BookOpen, Plus, Calendar } from 'lucide-react'
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
  },
  {
    id: '3',
    name: 'Moestuin', 
    description: 'De moestuin met groenten en kruiden'
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

// Mock logbook entries for specific gardens
const MOCK_LOGBOOK_ENTRIES: LogbookEntry[] = [
  {
    id: '1',
    title: 'Eerste rozen geplant',
    description: 'Vandaag 5 nieuwe rozenstruiken geplant in het eerste bed. Rode en witte variëteiten.',
    garden_id: '1',
    entry_type: 'planting',
    created_at: '2024-01-15T14:30:00Z',
    weather: 'Zonnig, 12°C'
  },
  {
    id: '2', 
    title: 'Onkruid verwijderd',
    description: 'Alle onkruid tussen de planten weggehaald. Grond is nu schoon.',
    garden_id: '1',
    entry_type: 'maintenance', 
    created_at: '2024-01-18T09:15:00Z',
    weather: 'Bewolkt, 8°C'
  },
  {
    id: '3',
    title: 'Gazon gemaaid',
    description: 'Het gras was te lang geworden, alles netjes gemaaid op 3cm hoogte.',
    garden_id: '2',
    entry_type: 'maintenance',
    created_at: '2024-01-16T16:00:00Z', 
    weather: 'Droog, 15°C'
  },
  {
    id: '4',
    title: 'Nieuwe bloembollen geplant',
    description: 'Tulpen en narcissen geplant voor het voorjaar. 50 bollen in totaal.',
    garden_id: '2',
    entry_type: 'planting',
    created_at: '2024-01-12T11:30:00Z',
    weather: 'Licht bewolkt, 10°C'
  },
  {
    id: '5',
    title: 'Eerste oogst sla',
    description: 'De eerste sla geoogst uit de moestuin. Heerlijk vers voor de salade!',
    garden_id: '3',
    entry_type: 'harvest',
    created_at: '2024-01-19T08:00:00Z',
    weather: 'Zonnig, 11°C'
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

interface LogbookEntry {
  id: string
  title: string
  description: string
  garden_id: string
  entry_type: 'planting' | 'maintenance' | 'harvest' | 'observation' | 'other'
  created_at: string
  weather?: string
}

export default function UserDashboardPage() {
  const { user, hasGardenAccess, getAccessibleGardens } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')

  useEffect(() => {
    if (user) {
      // Filter tasks and logbook entries based on user's garden access
      const accessibleGardens = getAccessibleGardens()
      
      const userTasks = MOCK_TASKS.filter(task => 
        user.role === 'admin' || accessibleGardens.includes(task.garden_id)
      )
      
      const userLogbookEntries = MOCK_LOGBOOK_ENTRIES.filter(entry => 
        user.role === 'admin' || accessibleGardens.includes(entry.garden_id)
      )
      
      setTasks(userTasks)
      setLogbookEntries(userLogbookEntries)
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

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'planting': return 'bg-green-100 text-green-800 border-green-200'
      case 'harvest': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'observation': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'planting': return 'Planten'
      case 'harvest': return 'Oogst'
      case 'maintenance': return 'Onderhoud'
      case 'observation': return 'Observatie'
      default: return 'Overig'
    }
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
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Te Doen Taken
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
              Voltooide Taken
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
              Logboek Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {logbookEntries.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vastgelegde activiteiten
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
            <div className="text-2xl font-bold text-purple-600">
              {pendingTasks.reduce((acc, task) => acc + task.estimated_duration, 0)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              geschatte werktijd
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks and Logbook Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Taken ({tasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="logbook" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Logboek ({logbookEntries.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="logbook" className="space-y-6">
        {/* Logbook Entries */}
        {logbookEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Logboek Items ({logbookEntries.length})</span>
              </CardTitle>
              <CardDescription>
                Jouw vastgelegde activiteiten voor toegewezen tuinen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logbookEntries.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium">{entry.title}</h3>
                        <Badge className={cn("text-xs", getEntryTypeColor(entry.entry_type))}>
                          {getEntryTypeLabel(entry.entry_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {entry.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>📍 {getGardenName(entry.garden_id)}</span>
                        <span>📅 {new Date(entry.created_at).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {entry.weather && <span>🌤️ {entry.weather}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Logbook Entries */}
        {logbookEntries.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Geen logboek items gevonden</h3>
              <p className="text-muted-foreground">
                Er zijn nog geen logboek items voor jouw toegewezen tuin(en).
              </p>
            </CardContent>
          </Card>
        )}
        </TabsContent>
      </Tabs>
    </div>
  )
}