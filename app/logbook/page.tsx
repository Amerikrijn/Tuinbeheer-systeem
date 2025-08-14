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
import { BookOpen, Plus, Search, Calendar, Camera, Leaf, MapPin, Filter, X, ClipboardList, CheckCircle2 } from "lucide-react"
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
        .select('id, email, full_name')
        .eq('id', viewingUserId)
        .single()
      
      if (error) throw error
      setViewingUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
      toast({
        title: "Fout bij laden gebruiker",
        description: "Kon gebruikersgegevens niet laden",
        variant: "destructive"
      })
    }
  }, [viewingUserId, isAdmin, toast])

  // Load logbook entries (filtered by accessible gardens or specific user)
  const loadEntries = React.useCallback(async (page = 1, append = false) => {
    const operationId = `loadLogbookEntries-${Date.now()}`
    
    try {
      setState(prev => ({ ...prev, loading: !append, error: null }))
      
      // Wait for garden access to be loaded for regular users
      if (user?.role === 'user' && !gardenAccessLoaded) {
        console.log('🔍 Logbook - Waiting for garden access to be loaded...')
        return
      }
      
      // Get accessible gardens for filtering
      let accessibleGardens: string[]
      let hasGardenRestriction: boolean
      
      if (viewingUser && isAdmin()) {
        // Admin viewing specific user - get that user's garden access from database
        try {
          const { data: gardenAccess, error } = await supabase
            .from('user_garden_access')
            .select('garden_id')
            .eq('user_id', viewingUser.id)
          
          if (error) {
            console.error('Error fetching user garden access:', error)
            accessibleGardens = []
          } else {
            accessibleGardens = gardenAccess?.map(access => access.garden_id) || []
          }
        } catch (error) {
          console.error('Exception fetching user garden access:', error)
          accessibleGardens = []
        }
        
        hasGardenRestriction = accessibleGardens.length > 0
        console.log('🔍 Admin viewing user logbook:', { user: viewingUser.email, gardens: accessibleGardens })
      } else {
        // Regular user or admin viewing own logbook
        accessibleGardens = getAccessibleGardens()
        hasGardenRestriction = !isAdmin() && accessibleGardens.length > 0
        console.log('🔍 Logbook viewing own:', { 
          isAdmin: isAdmin(), 
          gardens: accessibleGardens, 
          restricted: hasGardenRestriction,
          gardenCount: accessibleGardens.length 
        })
      }

              const filters: Record<string, any> = {
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE
      }

      // SECURITY: Apply strict garden access filtering
      if (!isAdmin()) {
        // NON-ADMIN USERS: ALWAYS filter by accessible gardens - NEVER allow cross-garden access
        if (accessibleGardens.length === 0) {
          throw new Error('Geen toegang tot tuinen')
        }
        
        if (state.selectedGarden && state.selectedGarden !== "all") {
          // SECURITY CHECK: Verify user has access to selected garden
          if (!accessibleGardens.includes(state.selectedGarden)) {
            throw new Error('SECURITY VIOLATION: Geen toegang tot geselecteerde tuin')
          }
          filters.garden_id = state.selectedGarden
        } else {
          // SECURITY: Always filter to only accessible gardens
          filters.garden_ids = accessibleGardens
        }
      } else {
        // ADMIN USERS: Can access all gardens
        if (state.selectedGarden && state.selectedGarden !== "all") {
          filters.garden_id = state.selectedGarden
        }
        // Don't pass garden_ids for admin when they have access to all gardens
        // This prevents the security warning in LogbookService.getAll
      }

      if (state.selectedPlantBed && state.selectedPlantBed !== "all") {
        filters.plant_bed_id = state.selectedPlantBed
      }

      // Load regular logbook entries with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout - verbinding te traag')), 30000) // 30 second timeout
      })
      
      let response
      try {
        response = await Promise.race([
          LogbookService.getAll(filters),
          timeoutPromise
        ]) as any
      } catch (error) {
        console.error('🔥 Logbook query error:', error)
        throw new Error(`Logbook query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      if (!response || !response.success) {
        console.error('🔥 Logbook response invalid:', response)
        // Handle the case where response is valid but indicates an error
        if (response && response.error) {
          throw new Error(response.error)
        } else {
          throw new Error('Failed to fetch logbook entries')
        }
      }
      
      // Handle successful response with no data (empty logbook)
      const logbookData = response.data || []

      // Also load completed tasks as logbook entries
      let completedTasksData: unknown[] = []
      try {
        let tasksQuery = supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            due_date,
            updated_at,
            completed,
            plants!inner(
              id,
              name,
              plant_beds!inner(
                id,
                name,
                garden_id,
                gardens!inner(name)
              )
            )
          `)
          .eq('completed', true)

        // Apply same garden filtering as logbook entries
        if (!isAdmin()) {
          if (accessibleGardens.length === 0) {
            console.log('🔍 Logbook - No garden access, skipping tasks query')
            completedTasksData = []
          } else {
            if (filters.garden_id) {
              tasksQuery = tasksQuery.eq('plants.plant_beds.garden_id', filters.garden_id)
            } else if (filters.garden_ids && filters.garden_ids.length > 0) {
              tasksQuery = tasksQuery.in('plants.plant_beds.garden_id', filters.garden_ids)
            } else {
              tasksQuery = tasksQuery.in('plants.plant_beds.garden_id', accessibleGardens)
            }
          }
        } else {
          // Admin can see all, apply same filters as logbook
          if (filters.garden_id) {
            tasksQuery = tasksQuery.eq('plants.plant_beds.garden_id', filters.garden_id)
          }
        }

        const { data: tasksResults } = await tasksQuery.order('updated_at', { ascending: false })
        
        if (tasksResults) {
          // Transform completed tasks to look like logbook entries
                      completedTasksData = tasksResults.map((task: unknown) => {
              const typedTask = task as any;
              return {
                id: `task-${typedTask.id}`,
                entry_date: typedTask.updated_at,
                notes: `✅ Taak voltooid: ${typedTask.title}${typedTask.description ? ` - ${typedTask.description}` : ''}`,
                plant_bed_name: typedTask.plants?.[0]?.plant_beds?.[0]?.name || 'Onbekend plantvak',
                plant_name: typedTask.plants?.[0]?.name || 'Onbekende plant',
                garden_name: typedTask.plants?.[0]?.plant_beds?.[0]?.gardens?.[0]?.name || 'Onbekende tuin',
                photo_url: null,
                is_completed_task: true, // Flag to identify this as a completed task
                original_task: task
              };
            })
        }
      } catch (error) {
        console.warn('Failed to load completed tasks for logbook:', error)
        completedTasksData = []
      }

      // Combine logbook entries and completed tasks with safety checks
      const logbookEntries = Array.isArray(logbookData) ? logbookData : []
      const completedTasks = Array.isArray(completedTasksData) ? completedTasksData : []
      const allEntries = [...logbookEntries, ...completedTasks]

      console.log('🔍 Logbook - Combined entries:', {
        logbookCount: logbookEntries.length,
        tasksCount: completedTasks.length,
        totalCount: allEntries.length
      })

      // Sort by entry_date descending FIRST (most recent first - chronological order)
      allEntries.sort((a, b) => {
        const aDate = a?.entry_date ? new Date(a.entry_date) : new Date(0)
        const bDate = b?.entry_date ? new Date(b.entry_date) : new Date(0)
        return bDate.getTime() - aDate.getTime()
      })

      // Filter by year first
      const yearFilteredEntries = allEntries.filter(entry => {
        const entryYear = new Date(entry.entry_date).getFullYear()
        return entryYear.toString() === state.selectedYear
      })

      // Then apply search filter (maintain chronological order)
      const filteredEntries = state.searchTerm 
        ? yearFilteredEntries.filter(entry => 
            entry.notes.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            entry.plant_bed_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            (entry.plant_name && entry.plant_name.toLowerCase().includes(state.searchTerm.toLowerCase()))
          )
        : yearFilteredEntries

      setState(prev => ({
        ...prev,
        entries: append ? [...prev.entries, ...filteredEntries] : filteredEntries,
        loading: false,
        page,
        hasMore: filteredEntries.length === ITEMS_PER_PAGE
      }))

      uiLogger.debug('Logbook entries loaded successfully', { 
        count: filteredEntries.length, 
        page, 
        operationId 
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      uiLogger.error('Failed to load logbook entries', error as Error, { page, operationId })
      
      // More user-friendly error messages
      let userMessage = errorMessage
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        userMessage = 'Verbinding verbroken. Probeer de pagina te vernieuwen.'
      } else if (errorMessage.includes('SECURITY VIOLATION')) {
        userMessage = 'Geen toegang tot deze gegevens.'
      } else if (errorMessage.includes('Failed to fetch')) {
        userMessage = 'Kan gegevens niet laden. Controleer je internetverbinding.'
      }
      
      toast({
        title: "Fout bij laden logboek",
        description: userMessage,
        variant: "destructive",
        action: (
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm underline"
          >
            Pagina vernieuwen
          </button>
        )
      })
    }
  }, [state.searchTerm, state.selectedGarden, state.selectedPlantBed, state.selectedYear, toast, getAccessibleGardens, isAdmin, viewingUser, user, gardenAccessLoaded]);;

  // Load plant beds for filtering
  const loadPlantBeds = React.useCallback(async () => {
    try {
      const plantBeds = await getPlantBeds()
      setState(prev => ({ ...prev, plantBeds: (plantBeds || []) as PlantvakWithBloemen[] }))
    } catch (error) {
      uiLogger.error('Failed to load plant beds for filtering', error as Error)
    }
  }, [])

  // Load viewing user data when user_id parameter changes
  React.useEffect(() => {
    loadViewingUser()
  }, [loadViewingUser])

  // Initial load
  React.useEffect(() => {
    if (viewingUserId && !viewingUser && isAdmin()) {
      // Wait for viewing user to load first
      return
    }
    loadEntries()
    loadPlantBeds()
  }, [loadEntries, loadPlantBeds, viewingUserId, viewingUser, isAdmin])

  // Reload when filters change
  React.useEffect(() => {
    if (state.selectedGarden !== "all" || state.selectedPlantBed !== "all" || state.searchTerm !== "" || state.selectedYear !== new Date().getFullYear().toString()) {
      loadEntries(1, false)
    }
  }, [state.selectedGarden, state.selectedPlantBed, state.searchTerm, state.selectedYear, loadEntries])

  // Reload when garden access becomes available
  React.useEffect(() => {
    if (gardenAccessLoaded && user) {
      loadEntries(1, false)
    }
  }, [gardenAccessLoaded, user, loadEntries])

  // Handle search
  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchTerm: value, page: 1 }))
  }

  // Handle filter changes
  const handleGardenChange = (value: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedGarden: value, 
      selectedPlantBed: "all", // Reset plant bed when garden changes
      page: 1 
    }))
  }

  const handlePlantBedChange = (value: string) => {
    setState(prev => ({ ...prev, selectedPlantBed: value, page: 1 }))
  }

  const handleYearChange = (value: string) => {
    setState(prev => ({ ...prev, selectedYear: value, page: 1 }))
  }

  // Clear filters
  const clearFilters = () => {
    setState(prev => ({ 
      ...prev, 
      searchTerm: "", 
      selectedGarden: "all", 
      selectedPlantBed: "all",
      selectedYear: new Date().getFullYear().toString(),
      page: 1 
    }))
    loadEntries(1, false)
  }

  // Load more entries
  const loadMore = () => {
    if (!state.loading && state.hasMore) {
      loadEntries(state.page + 1, true)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: nl })
    } catch {
      return dateString
    }
  }

  // Get available years for filtering
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year)
    }
    return years
  }

  // Get unique gardens from logbook entries (which have garden names)
  const gardens = React.useMemo(() => {
    const uniqueGardens = new Map()
    state.entries.forEach(entry => {
      if (!uniqueGardens.has(entry.garden_id)) {
        uniqueGardens.set(entry.garden_id, entry.garden_name)
      }
    })
    return Array.from(uniqueGardens.entries()).map(([id, name]) => ({ id, name }))
  }, [state.entries])

  // Filter plant beds by selected garden
  const filteredPlantBeds = React.useMemo(() => {
    return state.selectedGarden && state.selectedGarden !== "all"
      ? state.plantBeds.filter(bed => bed.garden_id === state.selectedGarden)
      : state.plantBeds
  }, [state.plantBeds, state.selectedGarden])

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Fout bij laden logboek</h2>
          </div>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <Button onClick={() => loadEntries()} variant="outline">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 safe-area-px">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            {viewingUser ? `Logboek van ${viewingUser.full_name || viewingUser.email}` : 'Logboek'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {viewingUser 
              ? `Logboek entries van ${viewingUser.full_name || viewingUser.email}`
              : 'Overzicht van alle logboek entries voor je tuinen'
            }
          </p>
          {viewingUser && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Bekijkt logboek van: {viewingUser.full_name || viewingUser.email}
              </Badge>
            </div>
          )}
        </div>

        {/* Tasks button for users */}
        {!isAdmin() && (
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Taken
          </Button>
        )}
        
        <Button asChild>
          <Link href="/logbook/new">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe entry
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Zoek in opmerkingen, plantvakken of planten..."
                  value={state.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Garden filter */}
            <Select value={state.selectedGarden} onValueChange={handleGardenChange}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Alle tuinen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle tuinen</SelectItem>
                {gardens.map((garden) => (
                  <SelectItem key={garden.id} value={garden.id}>
                    {garden.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Plant bed filter */}
            <Select value={state.selectedPlantBed} onValueChange={handlePlantBedChange}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Alle plantvakken" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle plantvakken</SelectItem>
                {filteredPlantBeds.map((bed) => (
                  <SelectItem key={bed.id} value={bed.id}>
                    {bed.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year filter */}
            <Select value={state.selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Jaar" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableYears().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear filters */}
            {(state.searchTerm || state.selectedGarden !== "all" || state.selectedPlantBed !== "all" || state.selectedYear !== new Date().getFullYear().toString()) && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Wissen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {state.loading && state.entries.length === 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!state.loading && state.entries.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Geen logboek entries gevonden
          </h3>
          <p className="text-muted-foreground mb-6">
            {state.searchTerm || state.selectedGarden !== "all" || state.selectedPlantBed !== "all" || state.selectedYear !== new Date().getFullYear().toString()
              ? "Probeer je filters aan te passen of maak een nieuwe entry aan."
              : "Begin met het maken van je eerste logboek entry."}
          </p>
          <Button asChild>
            <Link href="/logbook/new">
              <Plus className="h-4 w-4 mr-2" />
              Eerste entry maken
            </Link>
          </Button>
        </div>
      )}

      {/* Logbook entries - redesigned for better emphasis */}
      {state.entries.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            💡 Klik op een entry om de details te bekijken
          </p>
          
          {/* Modern card-based layout instead of table */}
          <div className="space-y-4">
            {state.entries.map((entry) => (
              <Card 
                key={entry.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  entry.is_completed_task ? 'bg-green-50 dark:bg-green-950/20 border-l-4 border-l-green-500' : 'hover:bg-muted/50'
                }`}
                onClick={() => entry.is_completed_task ? null : router.push(`/logbook/${entry.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Photo section - prominent display */}
                    <div className="flex-shrink-0">
                      {entry.photo_url ? (
                        <div className="relative">
                          <img 
                            src={entry.photo_url} 
                            alt="Logboek foto"
                            className="w-32 h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Camera className="w-8 h-8 mx-auto mb-1" />
                            <span className="text-xs">Geen foto</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content section - emphasis on description */}
                    <div className="flex-1 min-w-0">
                      {/* Main description - large text like tasks */}
                      <div className="mb-3">
                        {entry.is_completed_task ? (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-medium text-green-800 dark:text-green-400 leading-relaxed">
                                {entry.notes}
                              </p>
                              <Badge variant="secondary" className="mt-2 text-xs bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                                📋 Voltooide taak
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-medium text-foreground leading-relaxed">
                                {entry.notes}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                📝 Logboek entry
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Metadata - smaller and smarter layout */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {/* Date - prominent but smaller */}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(entry.entry_date)}</span>
                        </div>
                        
                        {/* Location info - compact */}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{entry.plant_bed_name}</span>
                        </div>
                        
                        {/* Garden - as small badge */}
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {entry.garden_name}
                        </Badge>
                        
                        {/* Plant info - when available */}
                        {entry.plant_name && (
                          <div className="flex items-center gap-1.5">
                            <Leaf className="w-4 h-4 text-green-500" />
                            <span className="text-sm">
                              {entry.plant_name}
                              {entry.plant_variety && (
                                <span className="text-gray-500 ml-1">({entry.plant_variety})</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Load more button */}
      {state.hasMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={loadMore} 
            disabled={state.loading}
            variant="outline"
          >
            {state.loading ? 'Laden...' : 'Meer laden'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function LogbookPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <LogbookPageContent />
        </React.Suspense>
      </ErrorBoundary>
    </ProtectedRoute>
  )
}