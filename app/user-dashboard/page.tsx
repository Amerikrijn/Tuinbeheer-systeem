'use client'

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle, Clock, CloudRain, Sun, CloudDrizzle, Snowflake, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { useUserDashboardRealtime } from '@/hooks/use-realtime-updates'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  garden_id?: string
  garden_name?: string
  completed_by?: string
  completed_at?: string
}

interface LogbookEntry {
  id: string
  title: string
  description: string
  garden_id: string
  garden_name?: string
  entry_type: 'planting' | 'maintenance' | 'harvest' | 'observation' | 'problem'
  created_at: string
  created_by?: string
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
}

function UserDashboardContent() {
  const { user, hasGardenAccess, getAccessibleGardens, loadGardenAccess } = useAuth()
  const { toast } = useToast()
  
  // Real-time data management
  const {
    tasks,
    setTasks,
    logbookEntries,
    setLogbookEntries,
    gardens,
    setGardens,
    realtimeStatus
  } = useUserDashboardRealtime(user?.id || '')
  
  const [loading, setLoading] = useState(true)
  const [gardenAccessLoaded, setGardenAccessLoaded] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Ensure garden access is loaded for regular users
  useEffect(() => {
    async function ensureGardenAccess() {
      if (!user) return
      
      // For users, ensure garden access is loaded
      if (user.role === 'user' && (!user.garden_access || user.garden_access.length === 0)) {

        try {
          await loadGardenAccess()
          setGardenAccessLoaded(true)

        } catch (error) {

          setGardenAccessLoaded(true) // Still mark as loaded to avoid infinite loop
        }
      } else {
        setGardenAccessLoaded(true)
      }
    }
    
    ensureGardenAccess()
  }, [user?.id, loadGardenAccess])

  useEffect(() => {
    if (user && gardenAccessLoaded) {
      loadUserData()
    }
  }, [user, gardenAccessLoaded])

  const loadUserData = async () => {
    if (!user || !gardenAccessLoaded) return
    
    setLoading(true)
    try {
      const accessibleGardens = getAccessibleGardens()
      
      // Load tasks for accessible gardens
      let tasksQuery = supabase
        .from('tasks')
        .select(`
          *,
          gardens(name)
        `)
        .order('due_date', { ascending: true })

      // If user has limited garden access, filter by those gardens
      if (accessibleGardens.length > 0) {
        tasksQuery = tasksQuery.in('garden_id', accessibleGardens)
      }

      const { data: tasksData, error: tasksError } = await tasksQuery

      if (tasksError) {
        throw tasksError
      }

      // Transform tasks data
      const transformedTasks = tasksData?.map(task => ({
        ...task,
        garden_name: task.gardens?.name
      })) || []

      setTasks(transformedTasks)

      // Load logbook entries for accessible gardens
      let logbookQuery = supabase
        .from('logbook_entries')
        .select(`
          *,
          gardens(name),
          users(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      // If user has limited garden access, filter by those gardens
      if (accessibleGardens.length > 0) {
        logbookQuery = logbookQuery.in('garden_id', accessibleGardens)
      }

      const { data: logbookData, error: logbookError } = await logbookQuery

      if (logbookError) {
        throw logbookError
      }

      // Transform logbook data
      const transformedLogbook = logbookData?.map(entry => ({
        id: entry.id,
        title: entry.notes.substring(0, 50) + (entry.notes.length > 50 ? '...' : ''),
        description: entry.notes,
        garden_id: entry.garden_id,
        garden_name: entry.gardens?.name,
        entry_type: getEntryTypeFromNotes(entry.notes),
        created_at: entry.created_at,
        created_by: entry.users?.full_name || entry.users?.email,
        weather: getRandomWeather() // For preview purposes
      })) || []

      setLogbookEntries(transformedLogbook)

    } catch (error) {

      toast({
        title: "Fout bij laden",
        description: "Kon taken en logboek niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getEntryTypeFromNotes = (notes: string): LogbookEntry['entry_type'] => {
    const lowerNotes = notes.toLowerCase()
    if (lowerNotes.includes('plant') || lowerNotes.includes('zaai')) return 'planting'
    if (lowerNotes.includes('onderhoud') || lowerNotes.includes('snoeien')) return 'maintenance'
    if (lowerNotes.includes('oogst') || lowerNotes.includes('geoogst')) return 'harvest'
    if (lowerNotes.includes('probleem') || lowerNotes.includes('ziekte')) return 'problem'
    return 'observation'
  }

  const getRandomWeather = (): LogbookEntry['weather'] => {
    const options: LogbookEntry['weather'][] = ['sunny', 'cloudy', 'rainy', 'snowy']
    return options[Math.floor(Math.random() * options.length)]
  }

  const markTaskCompleted = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        })
        .eq('id', taskId)

      if (error) {
        throw error
      }

      toast({
        title: "Taak voltooid",
        description: "De taak is succesvol afgerond",
      })

      // Reload tasks
      loadUserData()

    } catch (error) {

      toast({
        title: "Fout bij voltooien",
        description: "Kon taak niet markeren als voltooid",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in_progress': return 'secondary'
      case 'todo': return 'outline'
      default: return 'outline'
    }
  }

  const getEntryTypeColor = (type: LogbookEntry['entry_type']) => {
    switch (type) {
      case 'planting': return 'bg-green-100 dark:bg-green-900 text-green-800'
      case 'maintenance': return 'bg-blue-100 dark:bg-blue-900 text-blue-800'
      case 'harvest': return 'bg-orange-100 text-orange-800'
      case 'observation': return 'bg-purple-100 text-purple-800'
      case 'problem': return 'bg-red-100 dark:bg-red-900 text-red-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getEntryTypeLabel = (type: LogbookEntry['entry_type']) => {
    switch (type) {
      case 'planting': return 'Planten'
      case 'maintenance': return 'Onderhoud'
      case 'harvest': return 'Oogst'
      case 'observation': return 'Observatie'
      case 'problem': return 'Probleem'
      default: return 'Overig'
    }
  }

  const getWeatherIcon = (weather?: LogbookEntry['weather']) => {
    switch (weather) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />
      case 'cloudy': return <CloudDrizzle className="w-4 h-4 text-muted-foreground" />
      case 'rainy': return <CloudRain className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      case 'snowy': return <Snowflake className="w-4 h-4 text-blue-300" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <span className="ml-2 text-muted-foreground">Dashboard laden...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Geen gebruiker ingelogd</p>
        </div>
      </div>
    )
  }

  const pendingTasks = tasks.filter(task => task.status !== 'completed')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Mijn Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welkom {user.full_name || user.email}! Hier zijn jouw taken en logboek items.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Taken</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltooide Taken</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logboek Items</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logbookEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Tasks and Logbook */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Taken ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="logbook">Logboek ({logbookEntries.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Mijn Taken</CardTitle>
              <CardDescription>
                Taken voor jouw toegewezen tuinen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Geen openstaande taken</p>
                  <p>Alle taken zijn voltooid! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:bg-accent dark:hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority === 'high' ? 'Hoog' : 
                               task.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                            </Badge>
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status === 'in_progress' ? 'Bezig' : 
                               task.status === 'completed' ? 'Voltooid' : 'Te doen'}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {task.garden_name && (
                              <span className="flex items-center gap-1">
                                🌱 {task.garden_name}
                              </span>
                            )}
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(task.due_date).toLocaleDateString('nl-NL')}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.status !== 'completed' && (
                          <Button 
                            size="sm" 
                            onClick={() => markTaskCompleted(task.id)}
                            className="ml-4"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Voltooien
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logbook">
          <Card>
            <CardHeader>
              <CardTitle>Mijn Logboek</CardTitle>
              <CardDescription>
                Recente activiteiten in jouw toegewezen tuinen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logbookEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Geen logboek items</p>
                  <p>Nog geen activiteiten geregistreerd</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logbookEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{entry.title}</h3>
                          <Badge className={getEntryTypeColor(entry.entry_type)}>
                            {getEntryTypeLabel(entry.entry_type)}
                          </Badge>
                        </div>
                        {getWeatherIcon(entry.weather)}
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{entry.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {entry.garden_name && (
                          <span className="flex items-center gap-1">
                            🌱 {entry.garden_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(entry.created_at).toLocaleDateString('nl-NL')}
                        </span>
                        {entry.created_by && (
                          <span className="flex items-center gap-1">
                            👤 {entry.created_by}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Protected user dashboard 
export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <UserDashboardContent />
    </ProtectedRoute>
  )
}