"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useViewPreference } from "@/hooks/use-view-preference"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, AlertCircle, Grid3X3, Settings, Loader2, CheckCircle, BookOpen, ClipboardList } from "lucide-react"
import { TuinService } from "@/lib/services/database.service"
import { getPlantBeds } from "@/lib/database"
import { uiLogger, AuditLogger } from "@/lib/logger"
import type { Tuin, PlantBedWithPlants, PlantvakWithBloemen } from "@/lib/types/index"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-supabase-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { supabase } from "@/lib/supabase"

interface HomePageState {
  gardens: Tuin[]
  loading: boolean
  error: string | null
  searchTerm: string
  page: number
  totalPages: number
  hasMore: boolean
}

const ITEMS_PER_PAGE = 12

function HomePageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { isVisualView, toggleView } = useViewPreference()
  const { user, isAdmin } = useAuth()
  
  const [state, setState] = React.useState<HomePageState>({
    gardens: [],
    loading: true,
    error: null,
    searchTerm: "",
    page: 1,
    totalPages: 1,
    hasMore: false,
  })

  // Load gardens with proper error handling and logging
  const loadGardens = React.useCallback(async (page = 1, searchTerm = "", append = false) => {
    const operationId = `loadGardens-${Date.now()}`
    
    try {
      uiLogger.info('Loading gardens', { page, searchTerm, append })
      
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const filters = searchTerm ? { query: searchTerm } : undefined
      const sort = { field: 'created_at', direction: 'desc' as const }
      
      const result = await TuinService.getAll(filters, sort, page, ITEMS_PER_PAGE)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load gardens')
      }

      const { data: paginatedData } = result
      if (!paginatedData) {
        throw new Error('No data received from server')
      }

      uiLogger.info('Gardens loaded successfully', { 
        count: paginatedData.data.length, 
        totalPages: paginatedData.total_pages,
        page: paginatedData.page 
      })

      setState(prev => ({
        ...prev,
        gardens: append ? [...prev.gardens, ...paginatedData.data] : paginatedData.data,
        loading: false,
        page: paginatedData.page,
        totalPages: paginatedData.total_pages,
        hasMore: paginatedData.page < paginatedData.total_pages,
      }))

      // Log user action for audit trail
      AuditLogger.logUserAction(
        null, // No user ID available in this context
        'VIEW',
        'gardens',
        undefined,
        { page, searchTerm, resultCount: paginatedData.data.length }
      )

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      uiLogger.error('Failed to load gardens', error as Error, { 
        page, 
        searchTerm, 
        operationId 
      })
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        gardens: append ? prev.gardens : [], // Keep existing gardens if appending
      }))

      // Show user-friendly error message
      toast({
        title: "Fout bij laden van tuinen",
        description: getUserFriendlyErrorMessage(errorMessage),
        variant: "destructive",
      })
    }
  }, [toast])

  // Search with debouncing
  const debouncedSearch = React.useMemo(
    () => {
      let timeoutId: NodeJS.Timeout
      return (searchTerm: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          loadGardens(1, searchTerm, false)
        }, 300) // 300ms debounce
      }
    },
    [loadGardens]
  )

  // Initial load
  React.useEffect(() => {
    loadGardens()
  }, [loadGardens])

  // Handle search input changes
  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setState(prev => ({ ...prev, searchTerm: value }))
    debouncedSearch(value)
  }, [debouncedSearch])

  // Load more gardens (pagination)
  const handleLoadMore = React.useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadGardens(state.page + 1, state.searchTerm, true)
    }
  }, [loadGardens, state.loading, state.hasMore, state.page, state.searchTerm])

  // Retry loading gardens
  const handleRetry = React.useCallback(() => {
    loadGardens(1, state.searchTerm, false)
  }, [loadGardens, state.searchTerm])

  // Delete garden with confirmation
  const handleDeleteGarden = React.useCallback(async (gardenId: string, gardenName: string) => {
    if (!confirm(`Weet u zeker dat u de tuin "${gardenName}" wilt verwijderen?`)) {
      return
    }

    try {
      uiLogger.info('Deleting garden', { gardenId, gardenName })
      
      const result = await TuinService.delete(gardenId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete garden')
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        gardens: prev.gardens.filter(garden => garden.id !== gardenId)
      }))

      uiLogger.info('Garden deleted successfully', { gardenId, gardenName })
      
      toast({
        title: "Tuin verwijderd",
        description: `De tuin "${gardenName}" is succesvol verwijderd.`,
      })

      AuditLogger.logUserAction(null, 'DELETE', 'gardens', gardenId, { name: gardenName })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete garden'
      
      uiLogger.error('Failed to delete garden', error as Error, { gardenId, gardenName })
      
      toast({
        title: "Fout bij verwijderen",
        description: getUserFriendlyErrorMessage(errorMessage),
        variant: "destructive",
      })
    }
  }, [toast])

  // Filter gardens based on search term (client-side filtering for immediate feedback)
  const filteredGardens = React.useMemo(() => {
    if (!state.searchTerm.trim()) {
      return state.gardens
    }
    
    const searchLower = state.searchTerm.toLowerCase()
    return state.gardens.filter(garden =>
      garden.name.toLowerCase().includes(searchLower) ||
      garden.description?.toLowerCase().includes(searchLower) ||
      garden.location?.toLowerCase().includes(searchLower)
    )
  }, [state.gardens, state.searchTerm])

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <header className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TreePine className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Tuinbeheer Systeem</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {isAdmin() 
            ? 'Administrator Dashboard - Beheer alle tuinen en gebruikers' 
            : 'Welkom bij uw persoonlijke tuinbeheer dashboard. Beheer uw tuinen, plantbedden en houd bij wat u heeft geplant.'
          }
        </p>
      </header>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Zoek tuinen op naam, locatie of beschrijving..."
            value={state.searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
            aria-label="Zoek tuinen"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={isVisualView ? "default" : "outline"}
            size="sm"
            onClick={toggleView}
            className="px-2"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            {isVisualView ? "Lijst" : "Visueel"}
          </Button>

          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/gardens/new">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Tuin
            </Link>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Er is een fout opgetreden</h3>
          </div>
          <p className="text-red-700 mb-4">{state.error}</p>
          <Button onClick={handleRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Loading State */}
      {state.loading && state.gardens.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gardens Grid */}
      {!state.loading || state.gardens.length > 0 ? (
        <>
          {filteredGardens.length === 0 && !state.loading ? (
            <div className="text-center py-12">
              <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {state.searchTerm ? 'Geen tuinen gevonden' : 'Nog geen tuinen'}
              </h3>
              <p className="text-gray-500 mb-6">
                {state.searchTerm 
                  ? `Geen tuinen gevonden voor "${state.searchTerm}". Probeer een andere zoekterm.`
                  : 'Begin met het maken van uw eerste tuin om uw planten te beheren.'
                }
              </p>
              {!state.searchTerm && (
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/gardens/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Maak uw eerste tuin
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className={isVisualView 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                : "space-y-4 mb-8"
              }>
                {filteredGardens.map((garden) => (
                  <GardenCard 
                    key={garden.id} 
                    garden={garden} 
                    onDelete={handleDeleteGarden}
                    isListView={!isVisualView}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {state.hasMore && !state.searchTerm && (
                <div className="text-center">
                  <Button 
                    onClick={handleLoadMore} 
                    disabled={state.loading}
                    variant="outline"
                    className="min-w-32"
                  >
                    {state.loading ? 'Laden...' : 'Meer laden'}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      ) : null}
    </div>
  )
}

// Garden Card Component
interface GardenCardProps {
  garden: Tuin
  onDelete: (gardenId: string, gardenName: string) => void
  isListView?: boolean
}

function GardenCard({ garden, onDelete, isListView = false }: GardenCardProps) {
  const [plantBeds, setPlantBeds] = React.useState<PlantvakWithBloemen[]>([])
  const [loadingFlowers, setLoadingFlowers] = React.useState(true)

  // Helper function to get emoji based on plant name
  const getPlantEmoji = (name?: string, storedEmoji?: string): string => {
    // If plant already has a stored emoji, use it
    if (storedEmoji && storedEmoji.trim()) {
      return storedEmoji
    }
    
    const plantName = (name || '').toLowerCase()
    
    // Exacte matches voor eenjarige bloemen
    if (plantName.includes('zinnia')) return '🌻'
    if (plantName.includes('marigold') || plantName.includes('tagetes')) return '🌼'
    if (plantName.includes('impatiens')) return '🌸'
    if (plantName.includes('ageratum')) return '🌸'
    if (plantName.includes('salvia')) return '🌺'
    if (plantName.includes('verbena')) return '🌸'
    if (plantName.includes('lobelia')) return '🌸'
    if (plantName.includes('alyssum')) return '🤍'
    if (plantName.includes('cosmos')) return '🌸'
    if (plantName.includes('petunia')) return '🌺'
    if (plantName.includes('begonia')) return '🌸'
    if (plantName.includes('viooltje') || plantName.includes('viola')) return '🌸'
    if (plantName.includes('stiefmoedje') || plantName.includes('pansy')) return '🌸'
    if (plantName.includes('snapdragon') || plantName.includes('leeuwenbek')) return '🌸'
    if (plantName.includes('zonnebloem') || plantName.includes('sunflower')) return '🌻'
    if (plantName.includes('calendula') || plantName.includes('goudsbloem')) return '🌼'
    if (plantName.includes('nicotiana') || plantName.includes('siertabak')) return '🤍'
    if (plantName.includes('cleome') || plantName.includes('spinnenbloem')) return '🌸'
    if (plantName.includes('celosia') || plantName.includes('hanekam')) return '🌺'
    
    // Default fallback
    return '🌸'
  }

  // Load plant beds and flowers for preview
  React.useEffect(() => {
    const loadFlowers = async () => {
      try {
        setLoadingFlowers(true)
        const beds = await getPlantBeds(garden.id)
        setPlantBeds(beds as PlantvakWithBloemen[])
      } catch (error) {
        console.error('Error loading flowers for garden preview:', error)
        setPlantBeds([])
      } finally {
        setLoadingFlowers(false)
      }
    }

    loadFlowers()
  }, [garden.id])

  // Get all unique flowers from all plant beds
  const allFlowers = React.useMemo(() => {
    const flowers = plantBeds.flatMap(bed => bed.plants || [])
    // Remove duplicates based on name and get first 6 for preview
    const uniqueFlowers = flowers.filter((flower, index, arr) => 
      arr.findIndex(f => f.name.toLowerCase() === flower.name.toLowerCase()) === index
    ).slice(0, 6)
    return uniqueFlowers
  }, [plantBeds])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Onbekende datum'
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(garden.id, garden.name)
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 border-2 hover:border-green-200 overflow-hidden ${
      isListView ? 'mb-2' : ''
    }`}>
      <Link href={`/gardens/${garden.id}`} className="block">
        <CardHeader className={isListView ? "pb-2 py-3" : "pb-3"}>
          <div className={`flex items-start justify-between ${isListView ? 'gap-4' : ''}`}>
            <div className="flex-1 min-w-0">
              <CardTitle className={`font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate ${
                isListView ? 'text-base' : 'text-lg'
              }`}>
                {garden.name}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{garden.location}</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              Actief
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className={isListView ? "pt-0 py-2" : "pt-0"}>
          {garden.description && !isListView && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {garden.description}
            </p>
          )}

          {/* Flower Preview Section */}
          <div className={isListView ? "mb-2" : "mb-4"}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Bloemen in deze tuin:</span>
              <span className="text-xs text-gray-500">
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)} bloemen
              </span>
            </div>
            
            {loadingFlowers ? (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : allFlowers.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {allFlowers.map((flower, index) => (
                  <div
                    key={`${flower.id}-${index}`}
                    className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-lg px-2 py-1"
                    title={flower.name}
                  >
                    <span className="text-sm">
                      {getPlantEmoji(flower.name, flower.emoji)}
                    </span>
                    <span className="text-xs font-medium text-green-800 truncate max-w-16">
                      {flower.name}
                    </span>
                  </div>
                ))}
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) > 6 && (
                  <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-600">
                      +{plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) - 6}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">
                Nog geen bloemen geplant
              </div>
            )}
          </div>
          
{!isListView && (
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Aangemaakt {formatDate(garden.created_at)}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600">
              <Leaf className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Beheren</span>
            </div>
            
            <Button
              onClick={handleDeleteClick}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Verwijderen
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

// Helper function to provide user-friendly error messages
function getUserFriendlyErrorMessage(error: string): string {
  if (error.includes('fetch')) {
    return 'Controleer uw internetverbinding en probeer het opnieuw.'
  }
  
  if (error.includes('timeout')) {
    return 'De server reageert langzaam. Probeer het later opnieuw.'
  }
  
  if (error.includes('table') || error.includes('relation')) {
    return 'Database configuratie probleem. Neem contact op met support.'
  }
  
  if (error.includes('permission') || error.includes('unauthorized')) {
    return 'U heeft geen toegang tot deze functie.'
  }
  
  return error || 'Er is een onverwachte fout opgetreden.'
}

// Main page component with error boundary and auth protection
export default function HomePage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <RoleBasedHomeContent />
      </ErrorBoundary>
    </ProtectedRoute>
  )
}

// Role-based home content
function RoleBasedHomeContent() {
  const { user, isAdmin } = useAuth()

  if (isAdmin()) {
    return <HomePageContent />
  } else {
    // Simple user home with tasks and logbook only
    return <UserSimpleHome />
  }
}

// Simple user home component
function UserSimpleHome() {
  const { user, getAccessibleGardens } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = React.useState<any[]>([])
  const [logbookEntries, setLogbookEntries] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const accessibleGardens = getAccessibleGardens()
      console.log('🔍 User accessible gardens:', accessibleGardens)
      
      // Load tasks for accessible gardens
      let tasksQuery = supabase
        .from('tasks')
        .select('*, gardens(name)')
        .eq('status', 'todo')
        .order('due_date', { ascending: true })
        .limit(5)

      if (accessibleGardens.length > 0) {
        tasksQuery = tasksQuery.in('garden_id', accessibleGardens)
      }

      const { data: tasksData } = await tasksQuery
      setTasks(tasksData || [])

      // Load recent logbook entries
      let logbookQuery = supabase
        .from('logbook_entries')
        .select('*, gardens(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (accessibleGardens.length > 0) {
        logbookQuery = logbookQuery.in('garden_id', accessibleGardens)
      }

      const { data: logbookData } = await logbookQuery
      setLogbookEntries(logbookData || [])

    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "Fout bij laden",
        description: "Kon gegevens niet laden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markTaskCompleted = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_by: user?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Taak voltooid",
        description: "Taak is gemarkeerd als voltooid",
      })

      loadUserData() // Reload data
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon taak niet voltooien",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Gegevens laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welkom, {user?.full_name || user?.email?.split('@')[0]}!</h1>
        <p className="text-muted-foreground mt-2">Jouw taken en logboek overzicht</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Openstaande Taken
            </CardTitle>
            <CardDescription>Jouw toegewezen taken</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Geen openstaande taken</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.gardens?.name}</p>
                      {task.due_date && (
                        <p className="text-xs text-orange-600 mt-1">
                          Deadline: {new Date(task.due_date).toLocaleDateString('nl-NL')}
                        </p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => markTaskCompleted(task.id)}
                      className="ml-2"
                    >
                      Voltooien
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logbook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recent Logboek
            </CardTitle>
            <CardDescription>Laatste logboek items</CardDescription>
          </CardHeader>
          <CardContent>
            {logbookEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Geen logboek items</p>
            ) : (
              <div className="space-y-3">
                {logbookEntries.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{entry.title}</h4>
                    <p className="text-sm text-muted-foreground">{entry.gardens?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/user-dashboard">
              <ClipboardList className="w-4 h-4 mr-2" />
              Alle Taken
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/logbook">
              <BookOpen className="w-4 h-4 mr-2" />
              Volledig Logboek
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
