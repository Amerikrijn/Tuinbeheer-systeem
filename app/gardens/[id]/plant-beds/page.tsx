"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useNavigation } from "@/hooks/use-navigation"
import { useViewPreference } from "@/hooks/use-view-preference"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, TreePine, Plus, Search, Eye, Leaf, Sun, MapPin, Grid3X3, BookOpen, AlertCircle } from "lucide-react"
import { getGarden, getPlantBeds } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"


// Mock data for when database is not available
const MOCK_PLANT_BEDS: PlantBedWithPlants[] = [
  {
    id: '1',
    garden_id: 'demo-garden',
    name: 'Plantvak A',
    letter_code: 'A',
    location: 'Voortuin, links',
    size: '2x3 meter',
    soil_type: 'Kleigrond',
    sun_exposure: 'full-sun',
    description: 'Zonnige plek voor eenjarige bloemen',
    is_active: true,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    plants: [
      {
        id: '1',
        plant_bed_id: '1',
        name: 'Zonnebloem',
        scientific_name: 'Helianthus annuus',
        variety: 'Giant',
        color: 'Geel',
        height: 200,
        sun_preference: 'full-sun',
        planting_date: '2024-04-01',
        status: 'gezond',
        notes: 'Groeit goed, bijna 2 meter hoog',
        created_at: '2024-04-01T10:00:00Z',
        updated_at: '2024-04-01T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    garden_id: 'demo-garden',
    name: 'Plantvak B',
    letter_code: 'B',
    location: 'Voortuin, rechts',
    size: '1.5x2 meter',
    soil_type: 'Zandgrond',
    sun_exposure: 'partial-sun',
    description: 'Gedeeltelijk beschaduwde plek voor kruiden',
    is_active: true,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    plants: [
      {
        id: '2',
        plant_bed_id: '2',
        name: 'Basilicum',
        scientific_name: 'Ocimum basilicum',
        variety: 'Genovese',
        color: 'Groen',
        height: 30,
        sun_preference: 'partial-sun',
        planting_date: '2024-05-01',
        status: 'gezond',
        notes: 'Groeit goed, regelmatig oogsten',
        created_at: '2024-05-01T10:00:00Z',
        updated_at: '2024-05-01T10:00:00Z'
      }
    ]
  },
  {
    id: '3',
    garden_id: 'demo-garden',
    name: 'Plantvak C',
    letter_code: 'C',
    location: 'Achtertuin, centraal',
    size: '3x2 meter',
    soil_type: 'Tuinbouwgrond',
    sun_exposure: 'full-sun',
    description: 'Grote zonnige plek voor groenten',
    is_active: true,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    plants: []
  }
]

export default function PlantBedsPage() {
  const { goBack, navigateTo } = useNavigation()
  const { isVisualView, toggleView } = useViewPreference()
  const params = useParams()
  const { toast } = useToast()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [useMockData, setUseMockData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [gardenData, plantBedsData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBeds(params.id as string),
        ])
        
        if (gardenData) {
          setGarden(gardenData)
        } else {
          // Create mock garden if none exists
          setGarden({
            id: params.id as string,
            name: 'Demo Tuin',
            description: 'Voorbeeld tuin voor demonstratie',
            location: 'Demo Locatie',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Garden)
        }
        
        if (plantBedsData && plantBedsData.length > 0) {
          setPlantBeds(plantBedsData)
        } else {
          // Use mock data if no plant beds found
          setPlantBeds(MOCK_PLANT_BEDS)
          setUseMockData(true)
        }
        
      } catch (error) {
        console.error("Error loading data:", error)
        setError('Database verbinding niet beschikbaar. Toon demo data.')
        
        // Set mock data on error
        setGarden({
          id: params.id as string,
          name: 'Demo Tuin',
          description: 'Voorbeeld tuin voor demonstratie',
          location: 'Demo Locatie',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Garden)
        
        setPlantBeds(MOCK_PLANT_BEDS)
        setUseMockData(true)
        
        toast({
          title: "Demo Modus",
          description: "Database niet beschikbaar, toon demo data.",
          variant: "default",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, toast])

  const filteredPlantBeds = plantBeds.filter(
    (bed) =>
      bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return <Sun className="h-4 w-4 text-yellow-500" />
      case "partial-sun":
        return <Sun className="h-4 w-4 text-orange-500" />
      case "shade":
        return <Sun className="h-4 w-4 text-gray-500" />
      default:
        return <Sun className="h-4 w-4 text-gray-400" />
    }
  }

  const getSunExposureText = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return "Volle zon"
      case "partial-sun":
        return "Gedeeltelijke zon"
      case "shade":
        return "Schaduw"
      default:
        return "Onbekend"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Tuin niet gevonden</h2>
          <p className="text-muted-foreground mb-6">
            De opgevraagde tuin kon niet worden geladen.
          </p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={goBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{garden.name}</h1>
            <p className="text-muted-foreground">Plantvakken beheren</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleView}
            variant="outline"
            size="sm"
          >
            {isVisualView ? (
              <>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Lijst
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Visueel
              </>
            )}
          </Button>
          
          <Button asChild>
            <Link href={`/gardens/${garden.id}/plant-beds/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Plantvak
            </Link>
          </Button>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {useMockData && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Demo Modus</p>
              <p className="text-sm text-amber-700">
                Database verbinding niet beschikbaar. Toon voorbeeld plantvakken.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek plantvakken..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Plant Beds Grid */}
      {filteredPlantBeds.length === 0 ? (
        <div className="text-center py-12">
          <TreePine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Geen plantvakken gevonden</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? `Geen plantvakken gevonden voor "${searchTerm}". Probeer een andere zoekterm.`
              : 'Er zijn nog geen plantvakken aangemaakt in deze tuin.'
            }
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link href={`/gardens/${garden.id}/plant-beds/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Maak je eerste plantvak
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantBeds.map((bed) => (
            <Card key={bed.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bed.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{bed.location}</p>
                  </div>
                  <Badge variant="secondary">{bed.size}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Sun className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{getSunExposureText(bed.sun_exposure || 'unknown')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{bed.soil_type || 'Onbekend'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Leaf className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{bed.plants?.length || 0} planten</span>
                  </div>
                  
                  {bed.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {bed.description}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/gardens/${garden.id}/plant-beds/${bed.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijk
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/gardens/${garden.id}/plant-beds/${bed.id}/plants`}>
                      <Leaf className="h-4 w-4 mr-2" />
                      Planten
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
