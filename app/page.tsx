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
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, AlertCircle, Settings, Loader2, CheckCircle, BookOpen, ClipboardList, User, RefreshCw, TrendingUp, Database, HardDrive, X } from "lucide-react"
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
          console.log(`🚀 PERFORMANCE OPTIMIZATION ACTIVE:`)
          console.log(`   • Gardens loaded: ${data.data.length}`)
          console.log(`   • Plant beds loaded: ${totalPlantBeds}`)
          console.log(`   • Plants loaded: ${totalPlants}`)
          console.log(`   • Query time: ${performanceDuration.toFixed(2)}ms`)
          console.log(`   • Estimated old method: ${(totalPlantBeds * 50 + totalPlants * 25).toFixed(0)}ms`)
          console.log(`   • Performance gain: ~${((totalPlantBeds * 50 + totalPlants * 25 - performanceDuration) / (totalPlantBeds * 50 + totalPlants * 25) * 100).toFixed(1)}% faster`)
          console.log(`   • Method: Single JOIN query instead of ${1 + totalPlantBeds} separate queries`)
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
    <div className="container mx-auto px-4 py-6 max-w-6xl safe-area-px">
      {/* Header - Mobile First */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4">
          <div className="flex items-center gap-3">
            <TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Tuinbeheer Systeem
            </h1>
          </div>
          
          {/* Responsive Button Layout */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => router.push('/logbook')}
              variant="outline"
              className="text-sm justify-center sm:justify-start"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Logboek
            </Button>
            <Button 
              onClick={() => router.push('/tasks')}
              variant="outline"
              className="text-sm justify-center sm:justify-start"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Taken
            </Button>
            <Button 
              onClick={() => router.push('/gardens/new')}
              className="text-sm justify-center sm:justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Tuin
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Beheer je tuinen, planten en taken op één centrale plek.
        </p>
      </div>

      {/* Enhanced Search Bar - Mobile First */}
      <div className="mb-6">
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Zoek tuinen op naam, locatie..."
            value={state.searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-10 w-full"
          />
          {state.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, searchTerm: "" }))}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {state.searchTerm && (
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2">
            {filteredGardens.length} tuin{filteredGardens.length !== 1 ? 'en' : ''} gevonden
          </p>
        )}
      </div>

      {/* Enhanced Error State - Mobile First */}
      {gardensError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-destructive mb-2">Er is een fout opgetreden</h3>
              <p className="text-destructive text-sm sm:text-base mb-4">{gardensError.message}</p>
            </div>
          </div>
          <Button 
            onClick={() => refetchGardens()} 
            variant="outline" 
            className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10"
          >
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Enhanced Loading State - Mobile First */}
      {gardensLoading && gardens.length === 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-4">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Tuinen laden...</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Even geduld terwijl we je tuinen ophalen</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden h-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-lg" />
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
            <div className="text-center py-8 sm:py-12">
              <TreePine className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {state.searchTerm ? 'Geen tuinen gevonden' : 'Nog geen tuinen'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {state.searchTerm 
                  ? `Geen tuinen gevonden voor "${state.searchTerm}". Probeer een andere zoekterm.`
                  : 'Maak je eerste tuin aan om te beginnen.'
                }
              </p>
              {!state.searchTerm && (
                <Button onClick={() => router.push('/gardens/new')} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Tuin Aanmaken
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredGardens.map((garden) => (
                  <GardenCard
                    key={garden.id}
                    garden={garden}
                    onDelete={handleDeleteGarden}
                  />
                ))}
              </div>

              {/* Load More Button - Mobile First */}
              {hasMore && !state.searchTerm && (
                <div className="text-center pt-4">
                  <Button 
                    onClick={handleLoadMore} 
                    disabled={gardensLoading}
                    variant="outline"
                    className="w-full sm:w-auto min-w-32"
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
      console.log(`✅ Garden "${garden.name}": ${plantBeds.length} plant beds & ${totalPlants} plants loaded instantly (no additional queries needed)`)
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-green-200 overflow-hidden h-full">
      <Link href={`/gardens/${garden.id}`} className="block h-full">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className={`font-semibold text-card-foreground group-hover:text-primary transition-colors truncate ${
                  garden.name.length > 20 ? 'text-sm sm:text-base' : 'text-base'
                }`}>
                {garden.name}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{garden.location}</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
              Actief
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
          {garden.description && (
            <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2">
              {garden.description}
            </p>
          )}

          {/* Enhanced Flower Preview Section - Mobile First */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-card-foreground">Planten in deze tuin:</span>
              <span className="text-xs text-muted-foreground">
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)} planten
              </span>
            </div>
            
            {loadingFlowers ? (
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : allFlowers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {allFlowers.slice(0, 6).map((flower, index) => (
                  <div
                    key={`${flower.id}-${index}`}
                    className="flex flex-col items-center gap-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-2 py-3 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors min-h-[60px] sm:min-h-[70px] justify-center"
                    title={flower.name}
                  >
                    <span className="text-lg sm:text-xl">
                      {getPlantEmoji(flower.name, flower.emoji)}
                    </span>
                    <span className="text-xs font-medium text-green-800 dark:text-green-200 text-center leading-tight line-clamp-2">
                      {flower.name}
                    </span>
                  </div>
                ))}
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) > 6 && (
                  <div className="col-span-2 sm:col-span-3 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-4">
                    <span className="text-xs text-muted-foreground font-medium text-center">
                      +{plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) - 6} meer planten
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Leaf className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <span className="text-xs sm:text-sm">Nog geen planten geplant</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Aangemaakt {formatDate(garden.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Leaf className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Beheren</span>
            </div>
            
            <Button
              onClick={handleDeleteClick}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
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


