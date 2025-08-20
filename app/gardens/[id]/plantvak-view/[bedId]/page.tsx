"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Flower2, 
  Calendar,
  Droplets,
  Sun,
  MapPin,
  Ruler,
  Grid3X3,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getSupabaseClient } from '@/lib/supabase'
import { uiLogger } from '@/lib/logger'
import { PlantVisualization } from '@/components/plant-visualization'

interface Plant {
  id: string
  name: string
  variety: string | null
  position_x: number
  position_y: number
  size: number
  color: string
  planted_at: string | null
  expected_harvest: string | null
  notes: string | null
}

interface PlantBed {
  id: string
  name: string
  description: string | null
  letter: string
  width: number
  height: number
  position_x: number
  position_y: number
  garden_id: string
  plants?: Plant[]
  gardens?: {
    id: string
    name: string
  }
}

export default function PlantvakViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const gardenId = params.id as string
  const bedId = params.bedId as string
  
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadPlantBed()
  }, [bedId, refreshKey])

  const loadPlantBed = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Load plant bed with plants
      const { data: bedData, error: bedError } = await supabase
        .from('plant_beds')
        .select(`
          *,
          gardens (
            id,
            name
          ),
          plants (
            id,
            name,
            variety,
            position_x,
            position_y,
            size,
            color,
            planted_at,
            expected_harvest,
            notes
          )
        `)
        .eq('id', bedId)
        .single()
      
      if (bedError) {
        uiLogger.error('Error loading plant bed:', bedError)
        throw bedError
      }
      
      if (bedData) {
        setPlantBed(bedData as PlantBed)
      }
    } catch (error) {
      uiLogger.error('Failed to load plant bed:', error)
      toast({
        title: "Fout",
        description: "Kon plantvak niet laden",
        variant: "destructive"
      })
      router.push(`/gardens/${gardenId}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePlantClick = (plant: Plant) => {
    router.push(`/gardens/${gardenId}/plant-beds/${bedId}/plants/${plant.id}/edit`)
  }

  const handleAddPlant = () => {
    router.push(`/gardens/${gardenId}/plant-beds/${bedId}/plants/new`)
  }

  const handleEditBed = () => {
    router.push(`/gardens/${gardenId}/plant-beds/${bedId}/edit`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-6 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!plantBed) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Plantvak niet gevonden</h1>
          <p className="text-muted-foreground mb-6">
            Het opgevraagde plantvak bestaat niet of is verwijderd.
          </p>
          <Button onClick={() => router.push(`/gardens/${gardenId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar tuin
          </Button>
        </div>
      </div>
    )
  }

  const plantCount = plantBed.plants?.length || 0

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/gardens/${gardenId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar {plantBed.gardens?.name || 'tuin'}
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {plantBed.name}
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Vak {plantBed.letter}
              </Badge>
            </h1>
            {plantBed.description && (
              <p className="text-muted-foreground mt-2">
                {plantBed.description}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleEditBed} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Bewerken
            </Button>
            <Button onClick={handleAddPlant} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Plant Toevoegen
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flower2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Planten</p>
                <p className="text-2xl font-bold">{plantCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Afmetingen</p>
                <p className="text-lg font-semibold">{plantBed.width} × {plantBed.height} cm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Positie</p>
                <p className="text-lg font-semibold">X: {plantBed.position_x}, Y: {plantBed.position_y}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Oppervlakte</p>
                <p className="text-lg font-semibold">
                  {((plantBed.width * plantBed.height) / 10000).toFixed(2)} m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plant Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Plantvak Overzicht</span>
            {plantCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                Klik op een plant om te bewerken
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
            <PlantVisualization
              plants={plantBed.plants || []}
              bedWidth={plantBed.width}
              bedHeight={plantBed.height}
              onPlantClick={handlePlantClick}
              isInteractive={true}
            />
          </div>
          
          {plantCount === 0 && (
            <div className="text-center py-12">
              <Flower2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nog geen planten</h3>
              <p className="text-muted-foreground mb-4">
                Dit plantvak heeft nog geen planten. Voeg je eerste plant toe!
              </p>
              <Button onClick={handleAddPlant} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Eerste Plant Toevoegen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plant List */}
      {plantCount > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Planten in dit vak ({plantCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantBed.plants?.map((plant) => (
                <Card 
                  key={plant.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePlantClick(plant)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{plant.name}</h4>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: plant.color }}
                      />
                    </div>
                    
                    {plant.variety && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Variëteit: {plant.variety}
                      </p>
                    )}
                    
                    <div className="space-y-1 text-sm">
                      {plant.planted_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Geplant: {new Date(plant.planted_at).toLocaleDateString('nl-NL')}</span>
                        </div>
                      )}
                      {plant.expected_harvest && (
                        <div className="flex items-center gap-2">
                          <Sun className="h-3 w-3" />
                          <span>Oogst: {new Date(plant.expected_harvest).toLocaleDateString('nl-NL')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Positie: ({plant.position_x}, {plant.position_y})</span>
                      </div>
                    </div>
                    
                    {plant.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {plant.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}