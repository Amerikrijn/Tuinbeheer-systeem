'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Droplets, Leaf, Loader2, AlertCircle, Flower2 } from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration - replace with real data when database is working
const MOCK_PLANTS = [
  {
    id: '1',
    name: 'Zonnebloem',
    species: 'Helianthus annuus',
    planted_date: '2024-03-15',
    last_watered: '2024-08-15',
    health: 'excellent' as const,
    emoji: '🌻'
  },
  {
    id: '2',
    name: 'Goudsbloem',
    species: 'Calendula officinalis',
    planted_date: '2024-04-01',
    last_watered: '2024-08-14',
    health: 'good' as const,
    emoji: '🌼'
  },
  {
    id: '3',
    name: 'Lavendel',
    species: 'Lavandula angustifolia',
    planted_date: '2024-03-20',
    last_watered: '2024-08-13',
    health: 'excellent' as const,
    emoji: '💜'
  },
  {
    id: '4',
    name: 'Rozemarijn',
    species: 'Rosmarinus officinalis',
    planted_date: '2024-03-10',
    last_watered: '2024-08-12',
    health: 'good' as const,
    emoji: '🌿'
  },
  {
    id: '5',
    name: 'Basilicum',
    species: 'Ocimum basilicum',
    planted_date: '2024-05-01',
    last_watered: '2024-08-15',
    health: 'fair' as const,
    emoji: '🌱'
  },
  {
    id: '6',
    name: 'Tijm',
    species: 'Thymus vulgaris',
    planted_date: '2024-03-25',
    last_watered: '2024-08-11',
    health: 'excellent' as const,
    emoji: '🌿'
  }
]

interface Plant {
  id: string
  name: string
  species: string
  planted_date: string
  last_watered?: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
  emoji: string
}

export function PlantsList() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  // Load plants with fallback to mock data
  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to load real data first
        // TODO: Replace with actual database call when Supabase is working
        // const supabase = getSupabaseClient()
        // const { data, error } = await supabase.from('plants').select('*')
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate loading
        setPlants(MOCK_PLANTS)
        setUseMockData(true)
        
      } catch (err) {
        console.error('Error loading plants:', err)
        setError('Database connection failed. Using demo data.')
        setPlants(MOCK_PLANTS)
        setUseMockData(true)
      } finally {
        setLoading(false)
      }
    }

    loadPlants()
  }, [])

  const getHealthColor = (health: Plant['health']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400'
      case 'good': return 'text-blue-600 dark:text-blue-400'
      case 'fair': return 'text-yellow-600 dark:text-yellow-400'
      case 'poor': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mijn Planten
          </h2>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Plant
          </Button>
        </div>
        
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mijn Planten
          </h2>
          {useMockData && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              📱 Demo modus - Toont voorbeeld planten
            </p>
          )}
        </div>
        <Link href="/plants/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Plant
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  Database verbinding niet beschikbaar
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {plants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Flower2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Geen planten gevonden
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
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
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{plant.emoji}</span>
                  <div>
                    <CardTitle className="text-lg">{plant.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plant.species}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    Geplant: {new Date(plant.planted_date).toLocaleDateString('nl-NL')}
                  </div>
                  
                  {plant.last_watered && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
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