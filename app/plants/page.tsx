"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Leaf, MapPin, Calendar, Search, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-supabase-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getUserFriendlyErrorMessage } from "@/lib/errors"
import { Input } from "@/components/ui/input"

interface Plant {
  id: string
  name: string
  species: string
  variety?: string
  planting_date?: string
  garden_id: string
  plant_bed_id: string
  created_at: string
  updated_at: string
  gardens?: {
    id: string
    name: string
  }
  plant_beds?: {
    id: string
    name: string
  }
}

interface PlantsPageState {
  plants: Plant[]
  filteredPlants: Plant[]
  loading: boolean
  error: string | null
  searchTerm: string
}

function PlantsPageContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [state, setState] = React.useState<PlantsPageState>({
    plants: [],
    filteredPlants: [],
    loading: true,
    error: null,
    searchTerm: "",
  })

  const loadPlants = React.useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data: plants, error } = await supabase
        .from('plants')
        .select(`
          *,
          gardens:garden_id(id, name),
          plant_beds:plant_bed_id(id, name)
        `)
        .eq('user_id', user?.id)
        .order('name', { ascending: true })
      
      if (error) throw error

      setState(prev => ({
        ...prev,
        plants: plants || [],
        filteredPlants: plants || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast({
        title: "Fout bij laden planten",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [user?.id, toast])

  React.useEffect(() => {
    if (user) {
      loadPlants()
    }
  }, [user, loadPlants])

  // Filter plants based on search term
  React.useEffect(() => {
    if (!state.searchTerm.trim()) {
      setState(prev => ({ ...prev, filteredPlants: prev.plants }))
      return
    }

    const filtered = state.plants.filter(plant => 
      plant.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      plant.species.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (plant.variety && plant.variety.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
      (plant.gardens && plant.gardens.name.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
      (plant.plant_beds && plant.plant_beds.name.toLowerCase().includes(state.searchTerm.toLowerCase()))
    )
    
    setState(prev => ({ ...prev, filteredPlants: filtered }))
  }, [state.searchTerm, state.plants])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Onbekend'
    return new Date(dateString).toLocaleDateString('nl-NL')
  }

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Planten</h1>
            <p className="text-muted-foreground">Beheer al je planten</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-10 w-full max-w-md mb-6" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Fout bij laden planten</h1>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <Button onClick={loadPlants} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Opnieuw proberen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Planten</h1>
          <p className="text-muted-foreground">Beheer al je planten</p>
        </div>
        <Button asChild>
          <Link href="/plants/new">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe plant
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek planten..."
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          className="pl-10"
        />
      </div>

      {state.filteredPlants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {state.searchTerm ? 'Geen planten gevonden' : 'Geen planten gevonden'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {state.searchTerm 
                ? `Geen planten gevonden voor "${state.searchTerm}". Probeer een andere zoekterm.`
                : 'Je hebt nog geen planten aangemaakt. Voeg je eerste plant toe om te beginnen.'
              }
            </p>
            {!state.searchTerm && (
              <Button asChild>
                <Link href="/plants/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Eerste plant toevoegen
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.filteredPlants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{plant.name}</CardTitle>
                </div>
                <CardDescription>
                  {plant.species}
                  {plant.variety && (
                    <span className="text-xs text-muted-foreground block mt-1">
                      Variëteit: {plant.variety}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plant.planting_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Geplant: {formatDate(plant.planting_date)}</span>
                    </div>
                  )}

                  {plant.gardens && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{plant.gardens.name}</span>
                    </div>
                  )}

                  {plant.plant_beds && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      <span>Plantvak: {plant.plant_beds.name}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/plants/${plant.id}`}>
                        Bekijken
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/plants/${plant.id}/edit`}>
                        Bewerken
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {state.searchTerm && state.filteredPlants.length > 0 && (
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {state.filteredPlants.length} van {state.plants.length} planten gevonden
        </div>
      )}
    </div>
  )
}

export default function PlantsPage() {
  return (
    <ProtectedRoute>
      <PlantsPageContent />
    </ProtectedRoute>
  )
}