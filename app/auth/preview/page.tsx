'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Users, 
  Shield, 
  CheckCircle,
  Clock,
  AlertTriangle,
  TreePine,
  BookOpen,
  ClipboardList,
  User,
  Info
} from 'lucide-react'
import { EnhancedTaskCard, type EnhancedTask } from '@/components/tasks/enhanced-task-card'
import { AuthNavigation } from '@/components/navigation/auth-nav'
import { AuthProvider } from '@/components/auth/auth-provider'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

// Mock enhanced tasks with user tracking
const MOCK_TASKS: EnhancedTask[] = [
  {
    id: '1',
    title: 'Rozen water geven',
    description: 'Geef alle rozen in plantvak A een grondige watergurt',
    due_date: new Date().toISOString().split('T')[0], // Today
    completed: true,
    completed_at: '2024-01-15T09:30:00Z',
    completed_by: {
      id: '2',
      full_name: 'Jan de Tuinman',
      email: 'jan@tuinbeheer.nl',
      avatar_url: null
    },
    created_by: {
      id: '1', 
      full_name: 'Admin User',
      email: 'admin@tuinbeheer.nl',
      avatar_url: null
    },
    priority: 'high',
    task_type: 'watering',
    plant_name: 'Rode Rozen',
    plant_bed_name: 'Plantvak A',
    garden_name: 'Voortuin',
    notes: 'Extra water geven vanwege warme dagen',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T09:30:00Z'
  },
  {
    id: '2',
    title: 'Tomaten snoeien',
    description: 'Verwijder overtollige scheuten van tomatplanten',
    due_date: new Date().toISOString().split('T')[0], // Today
    completed: false,
    created_by: {
      id: '1',
      full_name: 'Admin User', 
      email: 'admin@tuinbeheer.nl',
      avatar_url: null
    },
    priority: 'medium',
    task_type: 'pruning',
    plant_name: 'Cherry Tomaten',
    plant_bed_name: 'Plantvak B',
    garden_name: 'Moestuin',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  },
  {
    id: '3',
    title: 'Bladluizen bestrijden',
    description: 'Controleer en behandel bladluizen op de dahlia\'s',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    completed: false,
    created_by: {
      id: '2',
      full_name: 'Jan de Tuinman',
      email: 'jan@tuinbeheer.nl',
      avatar_url: null
    },
    priority: 'high',
    task_type: 'pest_control',
    plant_name: 'Dahlia mix',
    plant_bed_name: 'Plantvak C',
    garden_name: 'Bloementuin',
    notes: 'Biologische middelen gebruiken',
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  }
]

function PreviewContent() {
  const { user, isAdmin, hasPermission } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState(MOCK_TASKS)

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    // Mock task completion with user tracking
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            completed,
            completed_at: completed ? new Date().toISOString() : undefined,
            completed_by: completed && user ? {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              avatar_url: user.avatar_url
            } : undefined
          }
        : task
    ))

    toast({
      title: completed ? "Taak voltooid" : "Taak heropend",
      description: completed ? "Taak is gemarkeerd als voltooid" : "Taak is terug gezet naar te doen",
    })
  }

  const handleTaskEdit = (task: EnhancedTask) => {
    toast({
      title: "Taak bewerken",
      description: `Bewerken van taak: ${task.title}`,
    })
  }

  const handleTaskDelete = async (taskId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    setTasks(prev => prev.filter(task => task.id !== taskId))
    
    toast({
      title: "Taak verwijderd",
      description: "De taak is permanent verwijderd",
      variant: "destructive"
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Niet ingelogd</h2>
            <p className="text-muted-foreground mb-4">
              Log in om de preview functionaliteit te bekijken
            </p>
            <Button asChild>
              <a href="/auth/login">Naar login pagina</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gebruikerssysteem Preview</h1>
          <p className="text-muted-foreground">
            Demo van het nieuwe authenticatie en gebruikersbeheer systeem
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Eye className="w-4 h-4 mr-2" />
          Preview Modus
        </Badge>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Huidige Gebruiker</span>
          </CardTitle>
          <CardDescription>
            Informatie over de ingelogde gebruiker en permissies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Naam</label>
                <p className="font-medium">{user.full_name || 'Geen naam ingesteld'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">E-mail</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <div className="mt-1">
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Gebruiker
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actief
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Permissies</label>
                <div className="mt-2 space-y-1">
                  {user.permissions.slice(0, 6).map(permission => (
                    <Badge key={permission} variant="outline" className="mr-1 mb-1 text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {user.permissions.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.permissions.length - 6} meer...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Sections */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Enhanced Tasks</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="admin">Admin Features</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5" />
                <span>Enhanced Task Cards</span>
              </CardTitle>
              <CardDescription>
                Taakkaarten met gebruiker tracking - zie wie taken heeft voltooid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tasks.map(task => (
                  <EnhancedTaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onEdit={handleTaskEdit}
                    onDelete={handleTaskDelete}
                    showUserInfo={true}
                  />
                ))}
              </div>
              
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nieuwe functionaliteit:</strong> Je kunt nu zien wie taken heeft voltooid en wanneer. 
                  Taken die je zelf voltooit worden automatisch aan jouw account gekoppeld.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission System</CardTitle>
              <CardDescription>
                Overzicht van het granulaire permission systeem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Jouw Permissies</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'gardens.view', label: 'Tuinen bekijken' },
                      { key: 'gardens.create', label: 'Tuinen aanmaken' },
                      { key: 'tasks.view', label: 'Taken bekijken' },
                      { key: 'tasks.complete', label: 'Taken voltooien' },
                      { key: 'logbook.create', label: 'Logboek schrijven' },
                      { key: 'users.manage', label: 'Gebruikers beheren' }
                    ].map(perm => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <span className="text-sm">{perm.label}</span>
                        {hasPermission(perm.key) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Role-Based Access Control</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Administrator</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Volledige toegang tot alle functionaliteiten, kan gebruikers uitnodigen en beheren
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Gebruiker</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Kan logboek bijhouden en taken afvinken, geen beheer functionaliteiten
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Admin Functionaliteit</span>
              </CardTitle>
              <CardDescription>
                Administratieve functies voor gebruikersbeheer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin() ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Je hebt administrator rechten. Je kunt alle functionaliteiten gebruiken.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button asChild className="h-auto p-4">
                      <a href="/admin/users" className="flex flex-col items-start space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span className="font-semibold">Gebruikersbeheer</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-left">
                          Beheer gebruikers, verstuur uitnodigingen, wijzig rollen
                        </p>
                      </a>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4" disabled>
                      <div className="flex flex-col items-start space-y-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-5 h-5" />
                          <span className="font-semibold">Audit Log</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-left">
                          Bekijk alle acties in het systeem (nog niet geïmplementeerd)
                        </p>
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Je hebt geen administrator rechten. Alleen administrators kunnen gebruikers beheren.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Navigation</CardTitle>
              <CardDescription>
                Navigatie past zich aan op basis van gebruiker permissies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  De navigatie balk toont alleen menu items waarvoor je permissies hebt. 
                  Je huidige rol ({user.role === 'admin' ? 'Administrator' : 'Gebruiker'}) bepaalt welke secties je kunt zien.
                </p>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">Beschikbare Menu Items:</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Home - Overzicht van tuinen</span>
                    </div>
                    {hasPermission('gardens.view') && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Tuinen - Beheer tuinen</span>
                      </div>
                    )}
                    {hasPermission('tasks.view') && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Taken - Bekijk en beheer taken</span>
                      </div>
                    )}
                    {hasPermission('logbook.view') && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Logboek - Tuinlogboek bijhouden</span>
                      </div>
                    )}
                    {isAdmin() && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Admin - Gebruikersbeheer en instellingen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle>Technische Implementatie</CardTitle>
          <CardDescription>
            Informatie over de technische aspecten van het gebruikerssysteem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🔐 Authenticatie</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Supabase Auth integratie</li>
                <li>• Email uitnodigingen</li>
                <li>• JWT tokens met custom claims</li>
                <li>• Row Level Security (RLS)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">👥 Gebruikersbeheer</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Role-based access control</li>
                <li>• Granulaire permissies</li>
                <li>• User tracking op acties</li>
                <li>• Audit logging</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">📱 Frontend</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• React context voor auth state</li>
                <li>• Permission-based UI rendering</li>
                <li>• Responsive design</li>
                <li>• TypeScript type safety</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPreviewPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AuthNavigation />
        <PreviewContent />
      </div>
    </AuthProvider>
  )
}