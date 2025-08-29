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
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, AlertCircle, Settings, Loader2, CheckCircle, BookOpen, ClipboardList, User, RefreshCw, TrendingUp, Database, HardDrive } from "lucide-react"
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
    <div className="min-h-screen garden-gradient">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/60 to-green-100/40"></div>
        <div className="relative container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-6 shadow-lg">
              <TreePine className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Tuinbeheer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Beheer je tuinen, plantbedden en planten op een efficiënte manier
            </p>
          </div>

          {/* Enhanced Search and Actions */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Zoek naar tuinen, locaties of beschrijvingen..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
                className="input-garden w-full pl-12 pr-4 py-4 text-lg"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Button
                onClick={() => router.push('/gardens/new')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nieuwe Tuin
              </Button>
              
              <Button
                onClick={() => router.push('/plants')}
                variant="outline"
                className="btn-outline-green"
              >
                <Leaf className="w-5 h-5 mr-2" />
                Planten Beheren
              </Button>
              
              <Button
                onClick={() => router.push('/tasks')}
                variant="outline"
                className="btn-outline-blue"
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                Taken Bekijken
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        {/* Performance Status */}
        {gardensData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TreePine className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{gardensData.total}</div>
                <div className="text-sm text-gray-600">Totaal Tuinen</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {gardensData.data.reduce((sum, garden) => sum + (garden.plant_beds?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Plantbedden</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {gardensData.data.reduce((sum, garden) => 
                    sum + (garden.plant_beds?.reduce((bedSum, bed) => bedSum + (bed.plants?.length || 0), 0) || 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Planten</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {gardensData.data.filter(garden => garden.plant_beds && garden.plant_beds.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Actieve Tuinen</div>
              </div>
            </div>
          </div>
        )}

        {/* Gardens Grid */}
        {gardensLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : gardensError ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Er is iets misgegaan</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {getUserFriendlyErrorMessage(gardensError)}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => refetchGardens()}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Opnieuw Proberen
              </Button>
              <Button
                onClick={() => router.push('/debug')}
                variant="outline"
                className="text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Debug
              </Button>
            </div>
          </div>
        ) : gardensData && gardensData.data.length > 0 ? (
          <>
            {/* Enhanced Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Je Tuinen
                </h2>
                <p className="text-gray-600">
                  {state.searchTerm ? `Zoekresultaten voor "${state.searchTerm}"` : 'Alle tuinen'}
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <Button
                  onClick={() => refetchGardens()}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Vernieuwen
                </Button>
                
                <Button
                  onClick={() => router.push('/debug')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Database Status
                </Button>
              </div>
            </div>

            {/* Enhanced Gardens Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gardensData.data.map((garden) => (
                <GardenCard
                  key={garden.id}
                  garden={garden}
                  onDelete={handleDeleteGarden}
                />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {gardensData.total > ITEMS_PER_PAGE && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-100">
                  <Button
                    onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={state.page === 1}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    Vorige
                  </Button>
                  
                  <span className="text-gray-600 px-4">
                    Pagina {state.page} van {Math.ceil(gardensData.total / ITEMS_PER_PAGE)}
                  </span>
                  
                  <Button
                    onClick={() => setState(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={state.page >= Math.ceil(gardensData.total / ITEMS_PER_PAGE)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    Volgende
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TreePine className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {state.searchTerm ? 'Geen resultaten gevonden' : 'Nog geen tuinen'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {state.searchTerm 
                ? `Geen tuinen gevonden die overeenkomen met "${state.searchTerm}"`
                : 'Maak je eerste tuin aan om te beginnen met tuinbeheer'
              }
            </p>
            <Button
              onClick={() => router.push('/gardens/new')}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              {state.searchTerm ? 'Nieuwe Tuin Aanmaken' : 'Eerste Tuin Aanmaken'}
            </Button>
          </div>
        )}
      </div>
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
    <Card className="card-garden card-garden-hover">
      <Link href={`/gardens/${garden.id}`} className="block">
        {/* Enhanced Header with gradient background */}
        <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100 p-6 border-b border-green-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <CardTitle className={`font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-200 truncate ${
                  garden.name.length > 20 ? 'text-lg' : 'text-xl'
                }`}>
                {garden.name}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-2 text-green-500" />
                <span className="truncate font-medium">{garden.location}</span>
              </div>
            </div>
            <Badge variant="secondary" className="badge-garden ml-3 flex-shrink-0">
              Actief
            </Badge>
          </div>
          
          {/* Garden Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-white/60 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600">{plantBeds.length}</div>
              <div className="text-xs text-gray-600 font-medium">Plantbedden</div>
            </div>
            <div className="text-center bg-white/60 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600">
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Planten</div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {garden.description && (
            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
              {garden.description}
            </p>
          )}

          {/* Enhanced Flower Preview Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800 flex items-center">
                <Leaf className="h-4 w-4 mr-2 text-green-500" />
                Planten in deze tuin
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0)} planten
              </span>
            </div>
            
            {loadingFlowers ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : allFlowers.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {allFlowers.slice(0, 6).map((flower, index) => (
                  <div
                    key={`${flower.id}-${index}`}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl px-4 py-3 hover:from-green-100 hover:to-blue-100 hover:border-green-300 transition-all duration-200 group/plant"
                    title={flower.name}
                  >
                    <span className="text-xl group-hover/plant:scale-110 transition-transform duration-200">
                      {getPlantEmoji(flower.name, flower.emoji)}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 truncate flex-1">
                      {flower.name}
                    </span>
                  </div>
                ))}
                {plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) > 6 && (
                  <div className="col-span-2 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl px-4 py-3">
                    <span className="text-xs text-gray-600 font-semibold">
                      +{plantBeds.reduce((total, bed) => total + (bed.plants?.length || 0), 0) - 6} meer planten
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
                <Leaf className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500 font-medium">Nog geen planten geplant</span>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                <span>Aangemaakt {formatDate(garden.created_at)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600 font-semibold">
                <Leaf className="h-4 w-4 mr-2" />
                <span className="text-sm">Beheren</span>
              </div>
              
              <Button
                onClick={handleDeleteClick}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"
              >
                Verwijderen
              </Button>
            </div>
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
      <div className="min-h-screen garden-gradient">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/60 to-green-100/40"></div>
          <div className="relative container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-6 shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Mijn Taken
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Bekijk en beheer je tuintaken per week. Zie welke planten aandacht nodig hebben.
              </p>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button 
                onClick={() => router.push('/logbook')}
                variant="outline"
                className="btn-outline-green"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Logboek
              </Button>
              
              <Button
                onClick={() => router.push('/gardens')}
                variant="outline"
                className="btn-outline-blue"
              >
                <TreePine className="w-5 h-5 mr-2" />
                Mijn Tuinen
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-16 max-w-4xl">
          {/* Use the same WeeklyTaskList component as admin */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <WeeklyTaskList />
          </div>
        </div>
      </div>
    )
  }
}


