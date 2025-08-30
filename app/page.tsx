"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, AlertCircle, Settings, Loader2, CheckCircle, BookOpen, ClipboardList, User, RefreshCw, TrendingUp, Database, HardDrive, X, Trash2 } from "lucide-react"
import { TuinService, TuinServiceEnhanced, PlantBedService } from "@/lib/services/database.service"
import { getPlantBeds } from "@/lib/database"
import { getPlantBedsOptimized } from "@/lib/database-optimized"

import { uiLogger, AuditLogger } from "@/lib/logger"
import type { Tuin, PlantBedWithPlants, PlantvakWithBloemen, TuinWithPlantvakken } from "@/lib/types/index"
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
  searchTerm: string
  page: number
}

const ITEMS_PER_PAGE = 12

function HomePageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  
  const [state, setState] = React.useState<HomePageState>({
    searchTerm: "",
    page: 1,
  })

  // React Query for gardens data - PERFORMANCE OPTIMIZATION
  const {
    data: gardensData,
    isLoading: gardensLoading,
    error: gardensError,
    refetch: refetchGardens
  } = useQuery({
    queryKey: ['gardens', state.page, state.searchTerm],
    queryFn: async () => {
      const operationId = `loadGardensOptimized-${Date.now()}`
      const performanceStart = performance.now()
      
      try {
        uiLogger.info('Loading gardens with OPTIMIZED JOIN queries', { 
          page: state.page, 
          searchTerm: state.searchTerm, 
          performance: 'OPTIMIZED' 
        })
        
        // 🚀 USE OPTIMIZED SERVICE - Single query with JOINs instead of N+1 queries
        let paginatedData
        if (state.searchTerm) {
          paginatedData = await TuinServiceEnhanced.getAllWithFullDetails(
            { query: state.searchTerm }, 
            { field: 'created_at', direction: 'desc' as const }, 
            state.page, 
            ITEMS_PER_PAGE
          )
        } else {
          paginatedData = await TuinServiceEnhanced.getAllWithFullDetails(
            undefined, 
            { field: 'created_at', direction: 'desc' as const }, 
            state.page, 
            ITEMS_PER_PAGE
          )
        }
        
        if (!paginatedData.success) {
          throw new Error(paginatedData.error || 'Failed to load gardens')
        }

        const { data } = paginatedData
        if (!data) {
          throw new Error('No data received from server')
        }

        const performanceDuration = performance.now() - performanceStart

        // Calculate performance metrics
        const totalPlantBeds = data.data.reduce((sum, garden) => sum + (garden.plant_beds?.length || 0), 0)
        const totalPlants = data.data.reduce((sum, garden) => 
          sum + (garden.plant_beds?.reduce((bedSum, bed) => bedSum + (bed.plants?.length || 0), 0) || 0), 0)

        // Performance logging with optimization details
        uiLogger.info('🚀 OPTIMIZED Gardens loaded successfully', { 
          count: data.data.length, 
          totalPages: data.total_pages,
          page: data.page,
          totalPlantBeds,
          totalPlants,
          performanceDuration: `${performanceDuration.toFixed(2)}ms`,
          optimization: 'JOIN_QUERY_INSTEAD_OF_N+1',
          estimatedOldDuration: `${(totalPlantBeds * 50 + totalPlants * 25).toFixed(0)}ms (estimated)`,
          performanceGain: `${((totalPlantBeds * 50 + totalPlants * 25 - performanceDuration) / (totalPlantBeds * 50 + totalPlants * 25) * 100).toFixed(1)}% faster`
        })

        // Show performance improvement in console
        if (totalPlantBeds > 0) {

        }

        // Log user action for audit trail
        AuditLogger.logUserAction(
          null, // No user ID available in this context
          'VIEW',
          'gardens',
          undefined,
          { 
            page: state.page, 
            searchTerm: state.searchTerm,
            resultCount: data.data.length,
            optimized: true,
            performanceDuration,
            totalPlantBeds,
            totalPlants
          }
        )

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        const performanceDuration = performance.now() - performanceStart
        
        uiLogger.error('Failed to load gardens (optimized)', error as Error, { 
          page: state.page, 
          searchTerm: state.searchTerm, 
          operationId,
          performanceDuration
        })
        
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  })

  // Search with debouncing
  const debouncedSearch = React.useMemo(
    () => {
      let timeoutId: NodeJS.Timeout
      return (searchTerm: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setState(prev => ({ ...prev, searchTerm, page: 1 }))
        }, 300) // 300ms debounce
      }
    },
    []
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    debouncedSearch(value)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setState(prev => ({ ...prev, page: newPage }))
  }

  // Handle load more
  const handleLoadMore = () => {
    if (gardensData && state.page < gardensData.total_pages) {
      handlePageChange(state.page + 1)
    }
  }

  // Extract data for easier access
  const gardens = gardensData?.data || []
  const totalPages = gardensData?.total_pages || 1
  const hasMore = state.page < totalPages

  // Show error toast if query fails
  React.useEffect(() => {
    if (gardensError) {
      const errorMessage = gardensError instanceof Error ? gardensError.message : 'An unexpected error occurred'
      toast({
        title: "Fout bij laden van tuinen",
        description: getUserFriendlyErrorMessage(errorMessage),
        variant: "destructive",
      })
    }
  }, [gardensError, toast])

  // Delete garden with confirmation - Works with optimized data structure
  const handleDeleteGarden = React.useCallback(async (gardenId: string, gardenName: string) => {
    if (!confirm(`Weet u zeker dat u de tuin "${gardenName}" wilt verwijderen?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('gardens')
        .update({ is_active: false })
        .eq('id', gardenId)

      if (error) {
        throw error
      }

      // This will trigger a refetch of the gardens data
      refetchGardens()

      uiLogger.info('Garden deleted successfully (optimized)', { gardenId, gardenName })
      
      toast({
        title: "Tuin verwijderd",
        description: `De tuin "${gardenName}" is succesvol verwijderd.`,
        variant: "default",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      uiLogger.error('Failed to delete garden', error as Error, { gardenId, gardenName })
      
      toast({
        title: "Fout bij verwijderen van tuin",
        description: getUserFriendlyErrorMessage(errorMessage),
        variant: "destructive",
      })
    }
  }, [toast, refetchGardens])

  // Filter gardens based on search term (client-side filtering for immediate feedback)
  const filteredGardens = React.useMemo(() => {
    if (!state.searchTerm.trim()) {
      return gardens
    }
    
    const searchLower = state.searchTerm.toLowerCase()
    return gardens.filter(garden =>
      garden.name.toLowerCase().includes(searchLower) ||
      garden.description?.toLowerCase().includes(searchLower) ||
      garden.location?.toLowerCase().includes(searchLower)
    )
  }, [gardens, state.searchTerm])

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl safe-area-px">
      {/* Simple Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <TreePine className="w-6 h-6 text-green-700 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-green-800 dark:text-green-200">
            Tuinen
          </h1>
        </div>
        
        <Button
          onClick={() => {

            window.location.href = '/gardens/new'
          }}
          className="h-10 px-4 bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Toevoegen
        </Button>
      </div>

      {/* Simple Search */}
      <div className="mb-4">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-400 w-4 h-4" />
            <Input
              placeholder="🔍 Zoek tuinen..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-9 border-green-300 focus:border-green-500"
            />
          </div>
          {state.searchTerm && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              {filteredGardens.length} tuin{filteredGardens.length !== 1 ? 'en' : ''} gevonden
            </p>
          )}
        </div>
      </div>

      {/* Compact Error State */}
      {gardensError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Fout bij laden tuinen</span>
          </div>
          <p className="text-destructive text-xs mb-2">{gardensError.message}</p>
          <UnifiedButton
            onClick={() => refetchGardens()}
            variant="outline"
            size="compact"
            className="h-8 px-3 text-xs border-destructive text-destructive hover:bg-destructive/10"
          >
            Opnieuw proberen
          </UnifiedButton>
        </div>
      )}

      {/* Compact Loading State */}
      {gardensLoading && gardens.length === 0 && (
        <div className="space-y-4">
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                              <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Tuinen laden...</p>
          </div>
          
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent className="pt-0 pb-3 px-3">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-16 rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gardens Grid */}
      {!gardensLoading || gardens.length > 0 ? (
        <>
          {filteredGardens.length === 0 && !gardensLoading ? (
            <div className="text-center py-4">
              <TreePine className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-sm font-medium text-foreground mb-1">
                {state.searchTerm ? 'Geen tuinen gevonden' : 'Nog geen tuinen'}
              </h3>
              <p className="text-muted-foreground mb-2 text-xs">
                {state.searchTerm 
                  ? `Geen resultaten voor "${state.searchTerm}"`
                  : 'Maak je eerste tuin aan'
                }
              </p>
              {!state.searchTerm && (
                <UnifiedButton
                  onClick={() => router.push('/gardens/new')}
                  variant="primary"
                  size="compact"
                  icon={<Plus className="w-4 h-4" />}
                  className="h-8 px-3 text-xs"
                >
                  Aanmaken
                </UnifiedButton>
              )}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredGardens.map((garden) => (
                <GardenCard
                  key={garden.id}
                  garden={garden}
                  onDelete={handleDeleteGarden}
                />
              ))}
            </div>

              {/* Load More Button */}
              {hasMore && !state.searchTerm && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={gardensLoading}
                    variant="outline"
                    className="w-full sm:w-auto min-w-32 border-green-300 text-green-700 hover:bg-green-50 dark:bg-green-950"
                  >
                    {gardensLoading ? 'Laden...' : 'Meer laden'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

// Garden Card Component - OPTIMIZED VERSION
interface GardenCardProps {
  garden: TuinWithPlantvakken
  onDelete: (gardenId: string, gardenName: string) => void
}

function GardenCard({ garden, onDelete }: GardenCardProps) {
  // 🚀 NO MORE N+1 QUERIES! Plant beds are already loaded via JOIN
  const plantBeds = React.useMemo(() => garden.plant_beds || [], [garden.plant_beds])
  const loadingFlowers = false // Always false since data is pre-loaded

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

  // 🚀 PERFORMANCE OPTIMIZATION: No more individual useEffect calls!
  // Plant beds are now pre-loaded via optimized JOIN query in the parent component
  // This eliminates the N+1 query problem completely
  React.useEffect(() => {
    // Log performance improvement for this garden card
    if (plantBeds.length > 0) {
      const totalPlants = plantBeds.reduce((sum, bed) => sum + (bed.plants?.length || 0), 0)

    }
  }, [garden.name, plantBeds])

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
    <Link href={`/gardens/${garden.id}`} className="block">
      <Card 
        className="group hover:shadow-md transition-colors duration-150 border-2 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 overflow-hidden relative cursor-pointer"
      >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors truncate">
              {garden.name}
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{garden.location}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-green-100 text-green-800 border-green-300">
            {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3 px-3">
        {/* Plant Preview */}
        {allFlowers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {allFlowers.slice(0, 6).map((flower, index) => (
              <div
                key={`${flower.id}-${index}`}
                className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 rounded-lg px-2 py-1.5 text-xs border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-150"
                title={flower.name}
              >
                <span className="text-sm">{getPlantEmoji(flower.name, flower.emoji)}</span>
                <span className="truncate max-w-16 font-medium text-green-800 dark:text-green-200">{flower.name}</span>
              </div>
            ))}
            {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) > 6 && (
              <div className="text-xs text-green-700 dark:text-green-300 px-2 py-1 bg-green-200 dark:bg-green-800/50 rounded-lg border border-green-300 dark:border-green-600 font-medium">
                +{plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) - 6} meer
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic py-2 text-center">
            Geen planten
          </div>
        )}
      </CardContent>
      
      {/* Footer met acties */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:bg-green-950 dark:hover:bg-green-950/30 text-xs flex items-center"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()

            window.location.href = `/gardens/${garden.id}`
          }}
        >
          <Leaf className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Beheren</span>
        </Button>
        
        <Button
          onClick={handleDeleteClick}
          variant="ghost"
          size="sm"
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Verwijderen
        </Button>
      </div>
      </Card>
    </Link>
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

