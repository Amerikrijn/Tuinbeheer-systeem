'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Leaf, Calendar, Droplets } from 'lucide-react'
import Link from 'next/link'

interface Plant {
  id: string
  name: string
  species: string
  plantedDate: string
  lastWatered?: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
}

export function PlantsList() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implementeer echte data fetching
    setLoading(false)
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Mijn Planten
        </h2>
        <Link href="/plants/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Plant
          </Button>
        </Link>
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                <CardTitle className="text-lg">{plant.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">{plant.species}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    Geplant: {new Date(plant.plantedDate).toLocaleDateString('nl-NL')}
                  </div>
                  
                  {plant.lastWatered && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Droplets className="w-4 h-4 mr-2" />
                      Laatst bewaterd: {new Date(plant.lastWatered).toLocaleDateString('nl-NL')}
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