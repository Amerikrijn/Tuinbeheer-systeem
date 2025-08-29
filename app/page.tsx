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
import { 
  TreePine, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Leaf, 
  AlertCircle, 
  Settings, 
  Loader2, 
  CheckCircle, 
  BookOpen, 
  ClipboardList, 
  User, 
  RefreshCw, 
  TrendingUp, 
  Database, 
  HardDrive,
  Sparkles,
  Eye,
  ChevronRight,
  Garden,
  Flower2,
  Clock,
  Zap
} from "lucide-react"
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
  viewMode: 'grid' | 'list'
}

const ITEMS_PER_PAGE = 12

function HomePageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  
  const [state, setState] = React.useState<HomePageState>({
    searchTerm: "",
    page: 1,
    viewMode: 'grid'
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
          sum + garden.plant_beds?.reduce((bedSum, bed) => bedSum + (bed.plants?.length || 0), 0) || 0, 0
        )

        uiLogger.info('Gardens loaded successfully (OPTIMIZED)', { 
          operationId,
          performance: {
            duration: performanceDuration,
            gardens: data.data.length,
            plantBeds: totalPlantBeds,
            plants: totalPlants,
            page: state.page
          }
        })

        return paginatedData
      } catch (error) {
        uiLogger.error('Failed to load gardens (OPTIMIZED)', error as Error, { operationId })
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchTerm: e.target.value, page: 1 }))
  }

  const handleLoadMore = () => {
    setState(prev => ({ ...prev, page: prev.page + 1 }))
  }

  const handleViewModeToggle = () => {
    setState(prev => ({ 
      ...prev, 
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' 
    }))
  }

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

  // Calculate garden statistics
  const gardenStats = React.useMemo(() => {
    const totalPlantBeds = filteredGardens.reduce((sum, garden) => sum + (garden.plant_beds?.length || 0), 0)
    const totalPlants = filteredGardens.reduce((sum, garden) => 
      sum + garden.plant_beds?.reduce((bedSum, bed) => bedSum + (bed.plants?.length || 0), 0) || 0, 0
    )
    return { totalPlantBeds, totalPlants }
  }, [filteredGardens])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl safe-area-px">
        {/* Enhanced Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <TreePine className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Tuinbeheer Systeem
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Beheer je tuinen, planten en taken op één centrale plek
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push('/logbook')}
                variant="outline"
                className="text-sm shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Logboek
              </Button>
              <Button 
                onClick={() => router.push('/tasks')}
                variant="outline"
                className="text-sm shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Taken
              </Button>
              <Button 
                onClick={() => router.push('/gardens/new')}
                className="text-sm shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Tuin
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Garden className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totaal Tuinen</p>
                  <p className="text-2xl font-bold text-foreground">{filteredGardens.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Leaf className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plantbedden</p>
                  <p className="text-2xl font-bold text-foreground">{gardenStats.totalPlantBeds}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Flower2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planten</p>
                  <p className="text-2xl font-bold text-foreground">{gardenStats.totalPlants}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">Actief</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Zoek tuinen, locaties of beschrijvingen..."
                value={state.searchTerm}
                onChange={handleSearchChange}
                className="pl-10 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleViewModeToggle}
                variant="outline"
                size="sm"
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                {state.viewMode === 'grid' ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Lijst
                  </>
                ) : (
                  <>
                    <Garden className="w-4 h-4 mr-2" />
                    Grid
                  </>
                )}
              </Button>
              
              {gardensLoading && (
                <Button variant="outline" size="sm" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Laden...
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {gardensError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Er is een fout opgetreden</h3>
            </div>
            <p className="text-destructive mb-4">{gardensError.message}</p>
            <Button onClick={() => refetchGardens()} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Opnieuw proberen
            </Button>
          </div>
        )}

        {/* Loading State */}
        {gardensLoading && gardens.length === 0 && (
          <div className={`grid gap-6 ${
            state.viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <GardenCardSkeleton key={index} viewMode={state.viewMode} />
            ))}
          </div>
        )}

        {/* Gardens Display */}
        {!gardensLoading || gardens.length > 0 ? (
          <>
            {filteredGardens.length === 0 && !gardensLoading ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <TreePine className="w-24 h-24 text-muted-foreground/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {state.searchTerm ? 'Geen tuinen gevonden' : 'Nog geen tuinen'}
                </h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                  {state.searchTerm 
                    ? `Geen tuinen gevonden voor "${state.searchTerm}". Probeer een andere zoekterm.`
                    : 'Maak je eerste tuin aan om te beginnen met je tuinbeheer avontuur.'
                  }
                </p>
                {!state.searchTerm && (
                  <Button 
                    onClick={() => router.push('/gardens/new')}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Eerste Tuin Aanmaken
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`grid gap-6 ${
                  state.viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredGardens.map((garden) => (
                    <GardenCard
                      key={garden.id}
                      garden={garden}
                      onDelete={handleDeleteGarden}
                      viewMode={state.viewMode}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && !state.searchTerm && (
                  <div className="text-center pt-6">
                    <Button 
                      onClick={handleLoadMore} 
                      disabled={gardensLoading}
                      variant="outline"
                      size="lg"
                      className="min-w-40 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {gardensLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Laden...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Meer laden
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

// Enhanced Garden Card Component
interface GardenCardProps {
  garden: TuinWithPlantvakken
  onDelete: (gardenId: string, gardenName: string) => void
  viewMode: 'grid' | 'list'
}

function GardenCard({ garden, onDelete, viewMode }: GardenCardProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const plantBeds = React.useMemo(() => garden.plant_beds || [], [garden.plant_beds])
  
  // Helper function to get emoji based on plant name
  const getPlantEmoji = (name?: string, storedEmoji?: string): string => {
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
    
    return '🌸'
  }

  // Get all unique flowers from all plant beds
  const allFlowers = React.useMemo(() => {
    const flowers = plantBeds.flatMap(bed => bed.plants || [])
    const uniqueFlowers = flowers.filter((flower, index, arr) => 
      arr.findIndex(f => f.name.toLowerCase() === flower.name.toLowerCase()) === index
    ).slice(0, 6)
    return uniqueFlowers
  }, [plantBeds])

  const totalPlants = plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)
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

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200 dark:hover:border-green-800 overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-sm">
        <Link href={`/gardens/${garden.id}`} className="block">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4 mb-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {garden.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{garden.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Aangemaakt {formatDate(garden.created_at)}</span>
                      </div>
                    </div>
                    {garden.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {garden.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Plant Preview */}
                <div className="ml-16">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Planten in deze tuin:</span>
                    <Badge variant="secondary" className="text-xs">
                      {totalPlants} planten in {plantBeds.length} bedden
                    </Badge>
                  </div>
                  
                  {allFlowers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {allFlowers.map((flower, index) => (
                        <div
                          key={`${flower.id}-${index}`}
                          className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                          title={flower.name}
                        >
                          <span className="text-lg">
                            {getPlantEmoji(flower.name, flower.emoji)}
                          </span>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            {flower.name}
                          </span>
                        </div>
                      ))}
                      {totalPlants > 6 && (
                        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                          <span className="text-sm text-muted-foreground font-medium">
                            +{totalPlants - 6} meer planten
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Nog geen planten geplant
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <Badge variant="secondary" className="text-xs">
                  Actief
                </Badge>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleDeleteClick}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    Verwijderen
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                  >
                    <Leaf className="w-4 h-4 mr-2" />
                    Beheren
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  // Grid view (enhanced)
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 dark:hover:border-green-800 overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:scale-[1.02] transform">
      <Link href={`/gardens/${garden.id}`} className="block">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TreePine className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="font-bold text-lg text-card-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                  {garden.name}
                </CardTitle>
              </div>
              <div className="flex items-center text-sm text-muted-foreground ml-10">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{garden.location}</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              Actief
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {garden.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
              {garden.description}
            </p>
          )}

          {/* Enhanced Flower Preview Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-card-foreground">Planten:</span>
              <Badge variant="outline" className="text-xs">
                {totalPlants} planten
              </Badge>
            </div>
            
            {allFlowers.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {allFlowers.slice(0, 4).map((flower, index) => (
                  <div
                    key={`${flower.id}-${index}`}
                    className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group-hover:scale-105 transform"
                    title={flower.name}
                  >
                    <span className="text-lg">
                      {getPlantEmoji(flower.name, flower.emoji)}
                    </span>
                    <span className="text-xs font-medium text-green-800 dark:text-green-200 truncate flex-1">
                      {flower.name}
                    </span>
                  </div>
                ))}
                {totalPlants > 4 && (
                  <div className="col-span-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      +{totalPlants - 4} meer planten
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Flower2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <div className="text-xs text-muted-foreground italic">
                  Nog geen planten geplant
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Aangemaakt {formatDate(garden.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Leaf className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Beheren</span>
            </div>
            
            <Button
              onClick={handleDeleteClick}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              Verwijderen
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

// Enhanced Skeleton Component
function GardenCardSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-4 w-1/2 ml-10" />
          </div>
          <Skeleton className="w-16 h-6" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-8 w-20" />
      </CardContent>
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
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
      </div>
    )
  }
}


