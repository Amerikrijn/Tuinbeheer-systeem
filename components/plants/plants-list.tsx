'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Droplets, Leaf, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

interface Plant {
  id: string
  name: string
  species: string
  planted_date: string
  last_watered?: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
  garden_id?: string
  plant_bed_id?: string
}

export function PlantsList() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // 🚀 PERFORMANCE: Memoized data fetching function
  const fetchPlants = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      setError(null)
      
      const supabase = getSupabaseClient()
      
      // 🚀 PERFORMANCE: Optimized query with pagination and sorting
      const { data, error: fetchError } = await supabase
        .from('plants')
        .select('id, name, species, planted_date, last_watered, health, garden_id, plant_bed_id')
        .order('planted_date', { ascending: false })
        .limit(50) // Limit for better performance
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      setPlants(data || [])
      
    } catch (err) {
      console.error('❌ ERROR: Failed to fetch plants:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het laden van de planten')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // 🚀 PERFORMANCE: Load data on mount
  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  // 🚀 PERFORMANCE: Skeleton loading for better perceived performance
  const PlantsSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // 🚀 PERFORMANCE: Refresh function
  const handleRefresh = () => {
    fetchPlants(true)
  }

  const getHealthColor = (health: Plant['health']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400'
      case 'good': return 'text-blue-600 dark:text-blue-400'
      case 'fair': return 'text-yellow-600 dark:text-yellow-400'
      case 'poor': return 'text-red-600 dark:text-red-400'
      default: return 'text-muted-foreground dark:text-gray-400'
    }
  }

  const getHealthLabel = (health: Plant['health']) => {
    switch (health) {
      case 'excellent': return 'Uitstekend'
      case 'good': return 'Goed'
      case 'fair': return 'Redelijk'
      case 'poor': return 'Slecht'
      default: return 'Onbekend'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">
            Mijn Planten
          </h2>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Plant
          </Button>
        </div>
        <PlantsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">
            Mijn Planten
          </h2>
          <Link href="/plants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Plant
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">
                Fout bij laden
              </h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-4">
                {error}
              </p>
              <Button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Leaf className="w-4 h-4 mr-2" />
                )}
                Opnieuw proberen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground dark:text-white">
          Mijn Planten
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Leaf className="w-4 h-4" />
            )}
          </Button>
          <Link href="/plants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Plant
            </Button>
          </Link>
        </div>
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">
                Geen planten gevonden
              </h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-4">
                Begin met het toevoegen van je eerste plant om je tuin te beheren.
              </p>
              <Link href="/plants/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Plant Toevoegen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{plant.name}</CardTitle>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{plant.species}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    Geplant: {new Date(plant.planted_date).toLocaleDateString('nl-NL')}
                  </div>
                  
                  {plant.last_watered && (
                    <div className="flex items-center text-sm text-muted-foreground dark:text-gray-300">
                      <Droplets className="w-4 h-4 mr-2" />
                      Laatst bewaterd: {new Date(plant.last_watered).toLocaleDateString('nl-NL')}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <span className="mr-2">Gezondheid:</span>
                    <span className={`font-medium ${getHealthColor(plant.health)}`}>
                      {getHealthLabel(plant.health)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href={`/plants/${plant.id}`}>
                    <Button variant="outline" size="sm">
                      Bekijk Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}