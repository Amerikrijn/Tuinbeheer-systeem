"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

// Trigger Vercel preview deployment

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Plus, Search, Calendar, Camera, Leaf, MapPin, Filter, X, ClipboardList, CheckCircle2, ArrowLeft, Sparkles, Eye, FileText } from "lucide-react"
import { LogbookService } from "@/lib/services/database.service"
import { getPlantBeds } from "@/lib/database"
import { uiLogger } from "@/lib/logger"
import type { LogbookEntryWithDetails, Plantvak, PlantvakWithBloemen } from "@/lib/types/index"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserRestrictedRoute } from "@/components/auth/user-restricted-route"
import { useAuth } from "@/hooks/use-supabase-auth"
import { supabase } from "@/lib/supabase"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"

interface LogbookPageState {
  entries: LogbookEntryWithDetails[]
  plantBeds: PlantvakWithBloemen[]
  loading: boolean
  error: string | null
  searchTerm: string
  selectedGarden: string
  selectedPlantBed: string
  selectedYear: string
  page: number
  hasMore: boolean
}

const ITEMS_PER_PAGE = 20

function LogbookPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, getAccessibleGardens, isAdmin, loadGardenAccess } = useAuth()
  
  // Track garden access loading state
  const [gardenAccessLoaded, setGardenAccessLoaded] = React.useState(false)
  
  // Check if we're viewing a specific user's logbook (admin only)
  const viewingUserId = searchParams.get('user_id')
  const [viewingUser, setViewingUser] = React.useState<any>(null)

  // Ensure garden access is loaded for regular users
  React.useEffect(() => {
    async function ensureGardenAccess() {
      if (!user) return
      
      // For users, ensure garden access is loaded
      if (user.role === 'user' && (!user.garden_access || user.garden_access.length === 0)) {
        console.log('🔍 Logbook - Loading garden access for user...')
        try {
          await loadGardenAccess()
          setGardenAccessLoaded(true)
          console.log('✅ Logbook - Garden access loaded')
        } catch (error) {
          console.error('❌ Logbook - Failed to load garden access:', error)
          setGardenAccessLoaded(true) // Still mark as loaded to avoid infinite loop
        }
      } else {
        setGardenAccessLoaded(true)
      }
    }
    
    ensureGardenAccess()
  }, [user?.id, loadGardenAccess])
  
  const [state, setState] = React.useState<LogbookPageState>({
    entries: [],
    plantBeds: [],
    loading: true,
    error: null,
    searchTerm: "",
    selectedGarden: "all",
    selectedPlantBed: "all",
    selectedYear: new Date().getFullYear().toString(),
    page: 1,
    hasMore: false,
  })

  // Load specific user data if viewing for another user (admin only)
  const loadViewingUser = React.useCallback(async () => {
    if (!viewingUserId || !isAdmin()) return

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', viewingUserId)
        .single()

      if (error) {
        console.error('Failed to load viewing user:', error)
        return
      }

      setViewingUser(userData)
    } catch (error) {
      console.error('Error loading viewing user:', error)
    }
  }, [viewingUserId, isAdmin])

  React.useEffect(() => {
    loadViewingUser()
  }, [loadViewingUser])

  // Load plant beds for filtering
  const loadPlantBeds = React.useCallback(async () => {
    try {
      const plantBeds = await getPlantBeds()
      setState(prev => ({ ...prev, plantBeds }))
    } catch (error) {
      console.error('Failed to load plant beds:', error)
    }
  }, [])

  React.useEffect(() => {
    loadPlantBeds()
  }, [loadPlantBeds])

  // Load logbook entries
  const loadLogbookEntries = React.useCallback(async (resetPage = false) => {
    if (!user || !gardenAccessLoaded) return

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      page: resetPage ? 1 : prev.page 
    }))

    try {
      let accessibleGardens = []
      
      if (isAdmin()) {
        // Admin can see all gardens or specific user's gardens
        if (viewingUserId) {
          // Load specific user's garden access
          const { data: userGardenAccess, error: accessError } = await supabase
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', viewingUserId)

          if (accessError) {
            throw new Error(`Failed to load user garden access: ${accessError.message}`)
          }

          accessibleGardens = userGardenAccess.map(access => access.garden_id)
        } else {
          // Admin can see all gardens
          accessibleGardens = []
        }
      } else {
        // Regular users can only see their accessible gardens
        accessibleGardens = user.garden_access || []
      }

      const { data, error } = await LogbookService.getLogbookEntries(
        accessibleGardens,
        state.selectedGarden !== "all" ? [state.selectedGarden] : undefined,
        state.selectedPlantBed !== "all" ? [state.selectedPlantBed] : undefined,
        state.selectedYear,
        state.page,
        ITEMS_PER_PAGE,
        state.searchTerm
      )

      if (error) {
        throw new Error(error)
      }

      setState(prev => ({
        ...prev,
        entries: resetPage ? data.entries : [...prev.entries, ...data.entries],
        hasMore: data.entries.length === ITEMS_PER_PAGE,
        loading: false
      }))

      uiLogger.info('Logbook entries loaded successfully', { 
        count: data.entries.length, 
        page: state.page,
        filters: {
          garden: state.selectedGarden,
          plantBed: state.selectedPlantBed,
          year: state.selectedYear,
          search: state.searchTerm
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }))
      
      uiLogger.error('Failed to load logbook entries', error as Error, { 
        page: state.page,
        filters: {
          garden: state.selectedGarden,
          plantBed: state.selectedPlantBed,
          year: state.selectedYear,
          search: state.searchTerm
        }
      })
    }
  }, [user, gardenAccessLoaded, isAdmin, viewingUserId, state.selectedGarden, state.selectedPlantBed, state.selectedYear, state.page, state.searchTerm])

  React.useEffect(() => {
    loadLogbookEntries(true)
  }, [loadLogbookEntries])

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm }))
  }

  // Handle filter changes
  const handleFilterChange = (filterType: 'garden' | 'plantBed' | 'year', value: string) => {
    setState(prev => ({ ...prev, [filterType]: value }))
  }

  // Load more entries
  const handleLoadMore = () => {
    setState(prev => ({ ...prev, page: prev.page + 1 }))
  }

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Weet u zeker dat u dit logboek item wilt verwijderen?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('logbook_entries')
        .delete()
        .eq('id', entryId)

      if (error) {
        throw error
      }

      // Reload entries
      loadLogbookEntries(true)

      toast({
        title: "Logboek item verwijderd",
        description: "Het logboek item is succesvol verwijderd.",
        variant: "default",
      })

      uiLogger.info('Logbook entry deleted successfully', { entryId })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      toast({
        title: "Fout bij verwijderen",
        description: getUserFriendlyErrorMessage(errorMessage),
        variant: "destructive",
      })

      uiLogger.error('Failed to delete logbook entry', error as Error, { entryId })
    }
  }

  // Get accessible gardens for filtering
  const accessibleGardens = React.useMemo(() => {
    if (isAdmin()) {
      // Admin can see all gardens
      return []
    }
    return user?.garden_access || []
  }, [user, isAdmin])

  // Filter plant beds based on selected garden
  const filteredPlantBeds = React.useMemo(() => {
    if (state.selectedGarden === "all") {
      return state.plantBeds
    }
    return state.plantBeds.filter(bed => bed.garden_id === state.selectedGarden)
  }, [state.plantBeds, state.selectedGarden])

  // Get years for filtering (last 5 years + current year)
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString())
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: nl })
    } catch {
      return 'Onbekende datum'
    }
  }

  // Get user-friendly error message
  const getUserFriendlyErrorMessage = (error: string) => {
    if (error.includes('network') || error.includes('fetch')) {
      return 'Netwerkfout. Controleer je internetverbinding en probeer het opnieuw.'
    }
    if (error.includes('permission') || error.includes('access')) {
      return 'Je hebt geen toegang tot deze functionaliteit.'
    }
    if (error.includes('not found')) {
      return 'De gevraagde gegevens zijn niet gevonden.'
    }
    return error
  }

  // Loading state
  if (!gardenAccessLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Laden...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {/* Mobile-First Header */}
        <div className="mb-6">
          {/* Top Bar - Mobile First */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="p-2 h-10 w-10 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Logboek
              </h1>
              {viewingUser && (
                <p className="text-xs text-muted-foreground mt-1">
                  {viewingUser.full_name || viewingUser.email}
                </p>
              )}
            </div>
            
            <Button
              onClick={() => router.push('/logbook/new')}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-10 w-10 p-0"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Enhanced Description - Mobile First */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Tuinactiviteiten
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Bekijk en beheer je tuinactiviteiten en notities
            </p>
          </div>

          {/* Mobile-First Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Zoek in logboek..."
                value={state.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Mobile-First Filters */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {/* Garden Filter */}
            <Select value={state.selectedGarden} onValueChange={(value) => handleFilterChange('garden', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400">
                <SelectValue placeholder="Selecteer tuin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle tuinen</SelectItem>
                {accessibleGardens.map((gardenId) => {
                  const garden = state.plantBeds.find(bed => bed.garden_id === gardenId)?.garden
                  return garden ? (
                    <SelectItem key={gardenId} value={gardenId}>
                      {garden.name}
                    </SelectItem>
                  ) : null
                })}
              </SelectContent>
            </Select>

            {/* Plant Bed Filter */}
            <Select value={state.selectedPlantBed} onValueChange={(value) => handleFilterChange('plantBed', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400">
                <SelectValue placeholder="Selecteer plantbed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle plantbedden</SelectItem>
                {filteredPlantBeds.map((bed) => (
                  <SelectItem key={bed.id} value={bed.id}>
                    {bed.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={state.selectedYear} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400">
                <SelectValue placeholder="Selecteer jaar" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <X className="h-5 w-5 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">Er is een fout opgetreden</h3>
            </div>
            <p className="text-sm text-destructive mb-3">{state.error}</p>
            <Button 
              onClick={() => loadLogbookEntries(true)} 
              variant="outline" 
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              Opnieuw proberen
            </Button>
          </div>
        )}

        {/* Logbook Entries - Mobile First */}
        <div className="space-y-4">
          {state.loading && state.entries.length === 0 ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : state.entries.length === 0 ? (
            // Empty state
            <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/30">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Geen logboek items gevonden
                </h3>
                <p className="text-muted-foreground mb-4">
                  {state.searchTerm || state.selectedGarden !== "all" || state.selectedPlantBed !== "all" || state.selectedYear !== new Date().getFullYear().toString()
                    ? 'Probeer je filters aan te passen of maak je eerste logboek item aan.'
                    : 'Maak je eerste logboek item aan om te beginnen.'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/logbook/new')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Logbook entries
            <>
              {state.entries.map((entry) => (
                <LogbookEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                  formatDate={formatDate}
                />
              ))}

              {/* Load More Button */}
              {state.hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    onClick={handleLoadMore} 
                    disabled={state.loading}
                    variant="outline"
                    size="lg"
                    className="min-w-40 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {state.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                        Laden...
                      </>
                    ) : (
                      'Meer laden'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile-First Logbook Entry Card
interface LogbookEntryCardProps {
  entry: LogbookEntryWithDetails
  onDelete: (entryId: string) => void
  formatDate: (dateString: string) => string
}

function LogbookEntryCard({ entry, onDelete, formatDate }: LogbookEntryCardProps) {
  const [showFullContent, setShowFullContent] = React.useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(entry.id)
  }

  return (
    <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/30 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {entry.title || 'Geen titel'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(entry.created_at)}</span>
                {entry.garden && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{entry.garden.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleDeleteClick}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {entry.content && (
            <div className="text-sm text-foreground leading-relaxed">
              {showFullContent ? (
                <p>{entry.content}</p>
              ) : (
                <p className="line-clamp-3">{entry.content}</p>
              )}
              
              {entry.content.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-green-600 hover:text-green-700 p-0 h-auto text-xs mt-2"
                >
                  {showFullContent ? 'Minder tonen' : 'Meer tonen'}
                </Button>
              )}
            </div>
          )}

          {/* Plant Bed Info */}
          {entry.plant_bed && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Leaf className="w-3 h-3" />
              <span>{entry.plant_bed.name}</span>
            </div>
          )}

          {/* Photos */}
          {entry.photos && entry.photos.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Camera className="w-3 h-3" />
              <span>{entry.photos.length} foto{entry.photos.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main logbook page component
export default function LogbookPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <LogbookPageContent />
      </ErrorBoundary>
    </ProtectedRoute>
  )
}