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
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, AlertCircle, Grid3X3, Settings, Loader2, CheckCircle, BookOpen, ClipboardList, User, RefreshCw } from "lucide-react"
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

      // Debug: Log what gardens are being loaded
      console.log('🔍 DEBUG: Gardens loaded from TuinService:', paginatedData.data.map(g => ({
        name: g.name,
        is_active: g.is_active,
        id: g.id
      })))

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
        console.error('Error loading flowers for garden preview:', error)
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
        console.error('Error loading garden users:', error)
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

          {/* Users with access section */}
          <div className={isListView ? "mb-2" : "mb-4"}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Gebruikers met toegang:</span>
              <span className="text-xs text-gray-500">
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
                {gardenUsers.slice(0, 3).map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                  >
                    <User className="h-3 w-3" />
                    <span className="max-w-20 truncate">
                      {user.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                ))}
                {gardenUsers.length > 3 && (
                  <div className="flex items-center justify-center bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    +{gardenUsers.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">
                Geen gebruikers toegewezen
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
    // Users get their own dedicated interface
    return <UserDashboardInterface />
  }
}

// User Dashboard Interface - only tasks and logbook for assigned gardens
function UserDashboardInterface() {
  const { user, getAccessibleGardens, loadGardenAccess } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [tasks, setTasks] = React.useState<any[]>([])
  const [logbookEntries, setLogbookEntries] = React.useState<any[]>([])
    const [celebrating, setCelebrating] = React.useState(false)
  const [gardenNames, setGardenNames] = React.useState<string[]>([])

  React.useEffect(() => {
    if (user) {
 
      loadUserData()
    }
  }, [user])

  // Load garden names when user data is available
  React.useEffect(() => {
    const loadGardenNames = async () => {
      if (!user || loading) return
      
      const accessibleGardens = getAccessibleGardens()
      if (accessibleGardens.length > 0) {
        try {
          const { data: gardens } = await supabase
            .from('gardens')
            .select('name')
            .in('id', accessibleGardens)
          
          if (gardens) {
            setGardenNames(gardens.map(g => g.name))
          }
        } catch (error) {
          console.error('Error loading garden names:', error)
          setGardenNames([])
        }
      } else {
        setGardenNames([])
      }
    }
    
    loadGardenNames()
  }, [user?.id, user?.garden_access?.length, loading])



  const handleRefresh = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    try {
      // First refresh garden access
      await loadGardenAccess()
      // Then reload all data
      await loadUserData()
      
      toast({
        title: "✅ Gegevens ververst",
        description: "Taken en logboek zijn bijgewerkt",
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "❌ Fout bij verversen",
        description: "Kon gegevens niet bijwerken",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setRefreshing(false)
    }
  }

  const celebrate = () => {
    setCelebrating(true)
    
    // Play celebration sound
    try {
      const audio = new Audio('/sounds/celebration.mp3')
      audio.play().catch(e => console.log('Could not play sound:', e))
    } catch (e) {
      console.log('Audio not available:', e)
    }
    
    // Show celebration toast
    toast({
      title: "🎉 Taak voltooid!",
      description: "Goed gedaan! De taak is succesvol afgerond.",
      duration: 4000
    })
    
    // Stop celebration after animation
    setTimeout(() => {
      setCelebrating(false)
    }, 3000)
  }

  const loadUserData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load garden access first if user has none
      if (user.role === 'user' && (!user.garden_access || user.garden_access.length === 0)) {
        console.log('🔍 User has no garden access, loading from database...')
        await loadGardenAccess()
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const accessibleGardens = getAccessibleGardens()
      console.log('🔍 User accessible gardens:', accessibleGardens)

      // Load tasks for accessible gardens
      let tasksData = []
      
      // Check if user has access (empty array for admin means all gardens)
      const isAdmin = user?.role === 'admin'
      const hasGardenAccess = isAdmin || accessibleGardens.length > 0
      
      if (hasGardenAccess) {
        console.log('🔍 User has garden access. Admin:', isAdmin, 'Gardens:', accessibleGardens)
        
        // First check if there are any plants in accessible gardens
        let plantsQuery = supabase
          .from('plants')
          .select(`
            id,
            name,
            plant_beds!inner(
              id,
              name,
              garden_id,
              gardens!inner(name)
            )
          `)
        
        // Only filter by garden_id if user is not admin
        if (!isAdmin && accessibleGardens.length > 0) {
          plantsQuery = plantsQuery.in('plant_beds.garden_id', accessibleGardens)
        }
        
        const { data: plantsCheck, error: plantsError } = await plantsQuery
        console.log('🌱 Plants found:', plantsCheck)
        
        // Calculate date ranges for this week + overdue
        const now = new Date()
        const today = new Date(now)
        today.setHours(0, 0, 0, 0)
        
        // Start of week (Monday in Europe)
        const startOfWeek = new Date(now)
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Convert Sunday=0 to Monday=0
        startOfWeek.setDate(now.getDate() - dayOfWeek)
        startOfWeek.setHours(0, 0, 0, 0)
        
        // End of week (Sunday)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        


        // Load both pending tasks (this week + overdue) AND recent completed tasks
        let allTasksQuery = supabase
          .from('tasks')
          .select(`
            *,
            plants!inner(
              name,
              plant_beds!inner(
                name,
                garden_id,
                gardens!inner(name)
              )
            )
          `)
        
                  // SECURITY: ALWAYS filter by garden access for non-admin users  
          if (!isAdmin) {
            if (accessibleGardens.length === 0) {
              console.warn('⚠️ SECURITY: User has no garden access, blocking tasks query')
              tasksData = []
              setTasks(tasksData)
              return // Early return to prevent any data leakage
            }
            allTasksQuery = allTasksQuery.in('plants.plant_beds.garden_id', accessibleGardens)
            console.log('🔍 SECURITY: User tasks query filtering by gardens:', accessibleGardens)
          }
          
          const { data: allTaskResults, error: tasksError } = await allTasksQuery.order('updated_at', { ascending: false })

          if (!tasksError && allTaskResults) {
            // Filter and combine pending tasks (this week + overdue) with recent completed tasks
            const pendingTasks = allTaskResults.filter(task => {
              if (task.completed) return false
              if (!task.due_date) return true // Tasks without due date are always shown
              
              const dueDate = new Date(task.due_date)
              const isOverdue = dueDate < today
              const isThisWeek = dueDate >= startOfWeek && dueDate <= endOfWeek
              
              return isOverdue || isThisWeek
            })

            // Get recent completed tasks (last 7 days)
            const sevenDaysAgo = new Date(now)
            sevenDaysAgo.setDate(now.getDate() - 7)
            
            const recentCompletedTasks = allTaskResults.filter(task => {
              if (!task.completed) return false
              const updatedDate = new Date(task.updated_at)
              return updatedDate >= sevenDaysAgo
            }).slice(0, 5) // Limit to 5 recent completed tasks

            // Combine pending and recent completed tasks
            tasksData = [...pendingTasks, ...recentCompletedTasks]
          }

        console.log('📋 All tasks loaded:', allTaskResults?.length || 0)
        console.log('📋 Final tasks data:', tasksData.length)
      } else {
        console.log('⚠️ User has no garden access')
      }
      setTasks(tasksData)

      // Load logbook entries for accessible gardens (exclude task-related entries)
      let logbookData = []
      if (hasGardenAccess) {
        let logbookQuery = supabase
          .from('logbook_entries')
          .select(`
            *,
            plant_beds!inner(
              id,
              name,
              garden_id,
              gardens!inner(name)
            )
          `)
          // Show both logbook entries AND completed tasks for complete history
        
        // SECURITY: ALWAYS filter by garden access for non-admin users
        if (!isAdmin) {
          if (accessibleGardens.length === 0) {
            console.warn('⚠️ SECURITY: User has no garden access, blocking logbook query')
            logbookData = []
            setLogbookEntries(logbookData)
            return // Early return to prevent any data leakage
          }
          logbookQuery = logbookQuery.in('plant_beds.garden_id', accessibleGardens)
          console.log('🔍 SECURITY: User logbook query filtering by gardens:', accessibleGardens)
        }
        
        const { data: logbookResults, error: logbookError } = await logbookQuery
          .order('created_at', { ascending: false })
          .limit(20) // Limit to recent entries

        if (!logbookError) {
          logbookData = logbookResults || []
        }
      }
      setLogbookEntries(logbookData)

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Gegevens laden...</span>
        </div>
      </div>
    )
  }

  const accessibleGardens = getAccessibleGardens()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header with Greeting */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welkom, {user?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline" 
            size="sm"
            className="mb-2"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Verversen...' : 'Ververs'}
          </Button>
        </div>
        {/* Current Garden Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <TreePine className="w-5 h-5" />
            <span className="font-medium">
              {gardenNames.length === 0 ? (
                accessibleGardens.length === 0 ? (
                  <span className="text-gray-500">Geen tuinen toegewezen</span>
                ) : (
                  <span className="text-gray-500">Laden...</span>
                )
              ) : gardenNames.length === 1 ? (
                <span>Werkt in: <strong>{gardenNames[0]}</strong></span>
              ) : (
                <span>Werkt in: <strong>{gardenNames.join(', ')}</strong></span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tasks Section - Same layout as admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Taken ({tasks.length})
            </CardTitle>
            <CardDescription>Deze week + verlopen taken voor jouw tuinen</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Geen openstaande taken</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed
                  const isCompleted = task.completed
                  
                  return (
                    <div key={task.id} className={`p-3 border rounded-lg hover:bg-gray-50 ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : isOverdue 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <h4 className={`font-medium ${isCompleted ? 'line-through text-green-700' : ''}`}>
                          {task.title}
                        </h4>
                        {isCompleted && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                            ✅ Voltooid
                          </Badge>
                        )}
                        {isOverdue && !isCompleted && (
                          <Badge variant="destructive" className="text-xs">
                            Verlopen
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                        {task.plants?.name} - {task.plants?.plant_beds?.gardens?.name}
                      </p>
                      {task.due_date && (
                        <p className={`text-xs mt-1 ${
                          isCompleted 
                            ? 'text-green-600' 
                            : isOverdue 
                              ? 'text-red-600 font-medium' 
                              : 'text-orange-600'
                        }`}>
                          {isCompleted ? 'Voltooid op: ' : 'Deadline: '}
                          {new Date(isCompleted ? task.updated_at : task.due_date).toLocaleDateString('nl-NL')}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 pt-4 border-t space-y-2">
              <Button asChild className="w-full">
                <Link href="/tasks">
                  Alle Taken Bekijken
                </Link>
              </Button>
              <Button 
                onClick={celebrate}
                variant="outline" 
                size="sm"
                className="w-full text-xs"
              >
                🎉 Test Viering (demo)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logbook Section - Same layout as admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Logboek ({logbookEntries.length})
            </CardTitle>
            <CardDescription>Recente logboek entries (geen afgeronde taken) van jouw tuinen</CardDescription>
          </CardHeader>
          <CardContent>
            {logbookEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Geen logboek entries</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logbookEntries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">{entry.notes}</h4>
                    <p className="text-sm text-gray-600">{entry.plant_beds?.gardens?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.entry_date).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t space-y-2">
              <Button asChild className="w-full">
                <Link href="/logbook/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe Logboek Entry
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/logbook">
                  Volledig Logboek Bekijken
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Celebration Animation Overlay */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Falling Flowers */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                fontSize: `${20 + Math.random() * 20}px`
              }}
            >
              {['🌸', '🌺', '🌻', '🌷', '🌹', '🌼'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
          
          {/* Sparkles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              ✨
            </div>
          ))}
          
          {/* Central celebration text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-8 shadow-lg animate-pulse">
              <div className="text-6xl">🎉</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


