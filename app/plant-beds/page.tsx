"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Leaf,
  Plus,
  Search,
  Eye,
  Edit,
  MapPin,
  Sun,
  CloudSun,
  Cloud,
  TreePine,
  Flower,
  Sparkles,
  AlertCircle,
  Filter,
} from "lucide-react"
import { ModernPageWrapper } from "@/components/modern-page-wrapper"

// Mock data for now
const mockPlantBeds = [
  {
    id: "1",
    name: "Voorste Bloemenbed",
    description: "Zonnig bed met seizoensbloemen",
    size_m2: 12,
    position_x: 2,
    position_y: 1,
    sun_exposure: "vol_zon",
    soil_type: "klei",
    plant_count: 8,
    garden_id: "1",
    plants: [
      { id: "1", name: "Rozen", type: "Roos", color: "Rood", bloom_season: "Zomer" },
      { id: "2", name: "Lavendel", type: "Kruid", color: "Paars", bloom_season: "Zomer" }
    ]
  },
  {
    id: "2", 
    name: "Groentevak",
    description: "Groentevak met seizoensgroenten",
    size_m2: 8,
    position_x: 1,
    position_y: 2,
    sun_exposure: "vol_zon",
    soil_type: "leem",
    plant_count: 6,
    garden_id: "1",
    plants: [
      { id: "3", name: "Tomaten", type: "Groente", color: "Rood", bloom_season: "Zomer" },
      { id: "4", name: "Basilicum", type: "Kruid", color: "Groen", bloom_season: "Zomer" }
    ]
  }
]

const mockGarden = {
  id: "1",
  name: "Mijn Tuin",
  description: "Hoofdtuin met diverse plantvakken"
}

export default function PlantBedsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const filteredPlantBeds = mockPlantBeds.filter(bed => 
    bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSunIcon = (exposure: string) => {
    switch (exposure) {
      case "vol_zon": return <Sun className="h-4 w-4 text-yellow-500" />
      case "gedeeltelijk": return <CloudSun className="h-4 w-4 text-yellow-400" />
      case "schaduw": return <Cloud className="h-4 w-4 text-gray-500" />
      default: return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSunLabel = (exposure: string) => {
    switch (exposure) {
      case "vol_zon": return "Volle zon"
      case "gedeeltelijk": return "Gedeeltelijke zon"
      case "schaduw": return "Schaduw"
      default: return "Volle zon"
    }
  }

  return (
    <ModernPageWrapper
      title="Plantvakken"
      subtitle={`${filteredPlantBeds.length} plantvakken in ${mockGarden.name}`}
      maxWidth="xl"
      headerActions={
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
            <Link href="/plant-beds/new">
              <Plus className="h-4 w-4 mr-1" />
              Nieuw Plantvak
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zoek plantvakken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/plant-beds/popular-flowers">
                <Sparkles className="h-4 w-4 mr-1" />
                Populaire Bloemen
              </Link>
            </Button>
          </div>
        </div>

        {/* Plant Beds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantBeds.map((bed) => (
            <Card key={bed.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Flower className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">{bed.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {bed.plant_count} planten
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{bed.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{bed.size_m2} m²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSunIcon(bed.sun_exposure)}
                    <span>{getSunLabel(bed.sun_exposure)}</span>
                  </div>
                </div>

                {bed.plants && bed.plants.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Planten:</h4>
                    <div className="flex flex-wrap gap-1">
                      {bed.plants.slice(0, 3).map((plant) => (
                        <Badge key={plant.id} variant="outline" className="text-xs">
                          {plant.name}
                        </Badge>
                      ))}
                      {bed.plants.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{bed.plants.length - 3} meer
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/plant-beds/${bed.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijk
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/plant-beds/${bed.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Bewerk
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlantBeds.length === 0 && (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen plantvakken gevonden</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Probeer een andere zoekterm" : "Voeg je eerste plantvak toe om te beginnen"}
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/plant-beds/new">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Plantvak
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </ModernPageWrapper>
  )
}
