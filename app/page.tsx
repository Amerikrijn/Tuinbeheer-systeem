"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, AlertCircle, Settings, Loader2, CheckCircle, BookOpen, ClipboardList, User, RefreshCw, TrendingUp, Database, HardDrive } from "lucide-react"
import { TuinService } from "@/lib/services/database.service"
import { getPlantBeds } from "@/lib/database"
import { getPlantBedsOptimized, measureQueryPerformance } from "@/lib/database-optimized"

import { uiLogger, AuditLogger } from "@/lib/logger"
import type { Tuin, PlantBedWithPlants, PlantvakWithBloemen } from "@/lib/types/index"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-supabase-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { supabase } from "@/lib/supabase"
import { sortTasks, getTaskUrgency, getTaskUrgencyStyles } from "@/lib/utils/task-sorting"
import { WeeklyTaskList } from "@/components/tasks/weekly-task-list"
import { SimpleTasksView } from "@/components/user/simple-tasks-view"
import { getUserFriendlyErrorMessage } from "@/lib/errors"

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

  // Load gardens with proper error handling and logging (memoized for performance)
  const loadGardens = React.useCallback(async (page = 1, searchTerm = "", append = false) => {
    const operationId = `loadGardens-${Date.now()}`
    
    try {
      uiLogger.info('Loading gardens', { page, searchTerm, append })
      
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Gebruik normale TuinService
      let paginatedData
      if (searchTerm) {
        paginatedData = await TuinService.getAll({ query: searchTerm }, { field: 'created_at', direction: 'desc' as const }, page, ITEMS_PER_PAGE)
      } else {
        paginatedData = await TuinService.getAll(undefined, { field: 'created_at', direction: 'desc' as const }, page, ITEMS_PER_PAGE)
      }
      
      if (!paginatedData.success) {
        throw new Error(paginatedData.error || 'Failed to load gardens')
      }

      const { data } = paginatedData
      if (!data) {
        throw new Error('No data received from server')
      }

      // Banking-grade logging: Log gardens loaded with metadata only
      uiLogger.debug('Gardens loaded from TuinService', { 
        count: data.data.length,
        operationId,
        hasActiveGardens: data.data.some(g => g.is_active)
      })

      uiLogger.info('Gardens loaded successfully', { 
        count: data.data.length, 
        totalPages: data.total_pages,
        page: data.page
      })



      setState(prev => ({
        ...prev,
        gardens: append ? [...prev.gardens, ...data.data] : data.data,
        loading: false,
        page: data.page,
        totalPages: data.total_pages,
        hasMore: data.page < data.total_pages,
      }))

      // Log user action for audit trail
      AuditLogger.logUserAction(
        null, // No user ID available in this context
        'VIEW',
        'gardens',
        undefined,
        { page, searchTerm, resultCount: data.data.length }
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
    <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
      {/* Header */}
      <header className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TreePine className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Tuinbeheer Systeem</h1>
        </div>

        {/* ✅ Performance Indicator */}
        
      </header>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Zoek tuinen op naam, locatie of beschrijving..."
            value={state.searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
            aria-label="Zoek tuinen"
          />
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/gardens/new">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Tuin
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h3 className="text-lg font-semibold text-destructive">Er is een fout opgetreden</h3>
          </div>
          <p className="text-destructive mb-4">{state.error}</p>
          <Button onClick={handleRetry} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Loading State */}
      {state.loading && state.gardens.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <TreePine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Geen tuinen gevonden
              </h3>
              <p className="text-muted-foreground mb-6">
                {state.searchTerm 
                  ? `Geen tuinen gevonden voor "${state.searchTerm}". Probeer een andere zoekterm.`
                  : 'Er zijn nog geen tuinen aangemaakt. Begin met het toevoegen van je eerste tuin.'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredGardens.map((garden) => (
                  <GardenCard 
                    key={garden.id} 
                    garden={garden} 
                    onDelete={handleDeleteGarden}
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
}

function GardenCard({ garden, onDelete }: GardenCardProps) {
  const [plantBeds, setPlantBeds] = React.useState<PlantvakWithBloemen[]>([])
  const [loadingFlowers, setLoadingFlowers] = React.useState(true)
  const [gardenUsers, setGardenUsers] = React.useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(true)

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
        uiLogger.error('Error loading flowers for garden preview', error as Error, { gardenId: garden.id })
        setPlantBeds([])
      } finally {
        setLoadingFlowers(false)
      }
    }

    loadFlowers()
  }, [garden.id])

  // Load users with access to this garden
  React.useEffect(() => {
    const loadGardenUsers = async () => {
      try {
        setLoadingUsers(true)
        const { data: users, error } = await supabase
          .from('user_garden_access')
          .select(`
            users (
              id,
              email,
              full_name
            )
          `)
          .eq('garden_id', garden.id)

        if (!error && users) {
          setGardenUsers(users.map(u => u.users).filter(Boolean))
        }
      } catch (error) {
        uiLogger.error('Error loading garden users', error as Error, { gardenId: garden.id })
        setGardenUsers([])
      } finally {
        setLoadingUsers(false)
      }
    }

    loadGardenUsers()
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-green-200 overflow-hidden">
      <Link href={`/gardens/${garden.id}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className={`font-semibold text-card-foreground group-hover:text-primary transition-colors truncate ${
                  garden.name.length > 20 ? 'text-sm' : 'text-base'
                }`}>
                {garden.name}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{garden.location}</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              Actief
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {garden.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {garden.description}
            </p>
          )}

          {/* Flower Preview Section */}
          <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground">Planten in deze tuin:</span>
                <span className="text-xs text-muted-foreground">
                  {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)} planten
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
                      <span className="text-xs text-muted-foreground">
                        +{plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) - 6}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Nog geen planten geplant
                </div>
              )}
            </div>

          {/* Users with access section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Gebruikers met toegang:</span>
              <span className="text-xs text-muted-foreground">
                {loadingUsers ? 'Laden...' : `${gardenUsers.length} gebruiker(s)`}
              </span>
            </div>
            
            {loadingUsers ? (
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            ) : gardenUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gardenUsers.slice(0, 3).map((user, index) => (
                  <span 
                    key={user.id} 
                    className="text-xs text-muted-foreground truncate"
                    title={user.full_name || user.email}
                  >
                    {user.full_name || user.email}
                  </span>
                ))}
                {gardenUsers.length > 3 && (
                  <div className="flex items-center justify-center bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                    +{gardenUsers.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                {loadingUsers ? 'Laden...' : 'Geen gebruikers'}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Aangemaakt {formatDate(garden.created_at)}</span>
            </div>
          </div>
          
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
  const router = useRouter()

  if (isAdmin()) {
    return <HomePageContent />
  } else {
    // Users get the exact same task interface as admin /tasks page
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header with Logbook button */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-green-700" />
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mijn Taken</h1>
            </div>
            <Button 
              onClick={() => router.push('/logbook')}
              variant="outline"
              className="text-sm"
            >
              Logboek
            </Button>
          </div>
          <p className="text-muted-foreground">
            Bekijk en beheer je tuintaken per week. Zie welke planten aandacht nodig hebben.
          </p>
        </div>

        {/* Use the same WeeklyTaskList component as admin */}
        <WeeklyTaskList />
      </div>
    )
  }
}


