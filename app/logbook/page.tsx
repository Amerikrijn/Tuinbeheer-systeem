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
import { BookOpen, Plus, Search, Calendar, Camera, Leaf, MapPin, Filter, X } from "lucide-react"
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
  const { getAccessibleGardens, isAdmin } = useAuth()
  
  // Check if we're viewing a specific user's logbook (admin only)
  const viewingUserId = searchParams.get('user_id')
  const [viewingUser, setViewingUser] = React.useState<any>(null)
  
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
        .select('id, email, full_name, garden_access')
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
      
      // Get accessible gardens for filtering
      let accessibleGardens: string[]
      let hasGardenRestriction: boolean
      
      if (viewingUser && isAdmin()) {
        // Admin viewing specific user - use that user's garden access
        accessibleGardens = viewingUser.garden_access || []
        hasGardenRestriction = accessibleGardens.length > 0
        // console.log('🔍 Admin viewing user logbook:', { user: viewingUser.email, gardens: accessibleGardens })
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

      const filters: any = {
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
      }

      if (state.selectedPlantBed && state.selectedPlantBed !== "all") {
        filters.plant_bed_id = state.selectedPlantBed
      }

      const response = await LogbookService.getAll(filters)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load logbook entries')
      }

      // Filter by year first
      const yearFilteredEntries = response.data.filter(entry => {
        const entryYear = new Date(entry.entry_date).getFullYear()
        return entryYear.toString() === state.selectedYear
      })

      // Then apply search filter
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
      
      toast({
        title: "Fout bij laden logboek",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [state.searchTerm, state.selectedGarden, state.selectedPlantBed, state.selectedYear, toast, getAccessibleGardens, isAdmin, viewingUser])

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
          <p className="text-gray-600 mb-4">{state.error}</p>
          <Button onClick={() => loadEntries()} variant="outline">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            {viewingUser ? `Logboek van ${viewingUser.full_name || viewingUser.email}` : 'Logboek'}
          </h1>
          <p className="text-gray-600 mt-1">
            {viewingUser 
              ? `Logboek entries van ${viewingUser.full_name || viewingUser.email}`
              : 'Overzicht van alle logboek entries voor je tuinen'
            }
          </p>
          {viewingUser && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Toegang tot: {viewingUser.garden_access?.length || 0} tuin(en)
              </Badge>
            </div>
          )}
        </div>
        
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen logboek entries gevonden
          </h3>
          <p className="text-gray-600 mb-6">
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

      {/* Logbook entries table */}
      {state.entries.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            💡 Dubbelklik op een rij om de details te bekijken
          </p>
          <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tuin</TableHead>
                <TableHead>Plantvak</TableHead>
                <TableHead>Plant</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Opmerkingen</TableHead>
                <TableHead className="text-center">Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.entries.map((entry) => (
                <TableRow 
                  key={entry.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onDoubleClick={() => router.push(`/logbook/${entry.id}`)}
                >
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {entry.garden_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{entry.plant_bed_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.plant_name ? (
                      <div className="flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-green-600" />
                        <span>{entry.plant_name}</span>
                        {entry.plant_variety && (
                          <span className="text-gray-500 text-sm">({entry.plant_variety})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Geen specifieke plant</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {formatDate(entry.entry_date)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-gray-700 truncate">
                      {entry.notes.length > 100 
                        ? `${entry.notes.substring(0, 100)}...` 
                        : entry.notes}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {entry.photo_url ? (
                      <div className="flex justify-center">
                        <img 
                          src={entry.photo_url} 
                          alt="Logboek foto"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Geen foto</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
                     </Table>
         </Card>
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

// SECURITY: Logbook overview only for admins
export default function LogbookPage() {
  return (
    <ProtectedRoute>
      <UserRestrictedRoute>
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <LogbookPageContent />
          </React.Suspense>
        </ErrorBoundary>
      </UserRestrictedRoute>
    </ProtectedRoute>
  )
}