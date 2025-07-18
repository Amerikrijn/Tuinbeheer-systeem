"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Leaf, Plus, Search, Eye, Edit, Trash2, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { getGarden, getPlantBed, deletePlant } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function PlantBedPlantsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gardenData, plantBedData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBed(params.bedId as string),
        ])
        setGarden(gardenData)
        setPlantBed(plantBedData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Fout",
          description: "Kon gegevens niet laden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, params.bedId, toast])

  const filteredPlants =
    plantBed?.plants.filter(
      (plant) =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.variety?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const handleDeletePlant = async (plantId: string, plantName: string) => {
    if (!confirm(`Weet je zeker dat je plant "${plantName}" wilt verwijderen?`)) {
      return
    }

    try {
      await deletePlant(plantId)
      if (plantBed) {
        setPlantBed({
          ...plantBed,
          plants: plantBed.plants.filter((plant) => plant.id !== plantId),
        })
      }
      toast({
        title: "Plant verwijderd",
        description: `Plant "${plantName}" is succesvol verwijderd.`,
      })
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de plant.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "needs_attention":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "diseased":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "dead":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      case "harvested":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Gezond"
      case "needs_attention":
        return "Aandacht nodig"
      case "diseased":
        return "Ziek"
      case "dead":
        return "Dood"
      case "harvested":
        return "Geoogst"
      default:
        return "Gezond"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "needs_attention":
        return "bg-yellow-100 text-yellow-800"
      case "diseased":
        return "bg-red-100 text-red-800"
      case "dead":
        return "bg-gray-100 text-gray-800"
      case "harvested":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
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

  if (!garden || !plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <Link href="/gardens">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Tuinen
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/gardens/${garden.id}/plant-beds`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Plantvakken
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              Planten in {plantBed.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Plantvak {plantBed.id} • {garden.name}
            </p>
          </div>
        </div>
        <Link href={`/gardens/${garden.id}/plant-beds/${plantBed.id}/plants/new`}>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Plant
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Zoek planten..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Plants Grid */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Leaf className="h-5 w-5 text-green-600" />
                      {plant.name}
                    </CardTitle>
                    {plant.scientific_name && (
                      <div className="text-sm text-gray-600 italic mt-1">{plant.scientific_name}</div>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(plant.status || 'growing')}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(plant.status || 'growing')}
                      {getStatusText(plant.status || 'growing')}
                    </div>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {plant.variety && (
                    <div>
                      <div className="font-medium">Variëteit</div>
                      <div className="text-gray-600">{plant.variety}</div>
                    </div>
                  )}
                  {plant.color && (
                    <div>
                      <div className="font-medium">Kleur</div>
                      <div className="text-gray-600">{plant.color}</div>
                    </div>
                  )}
                  {plant.height && (
                    <div>
                      <div className="font-medium">Hoogte</div>
                      <div className="text-gray-600">{plant.height}cm</div>
                    </div>
                  )}
                  {plant.watering_frequency && (
                    <div>
                      <div className="font-medium">Water</div>
                      <div className="text-gray-600">{plant.watering_frequency}x/week</div>
                    </div>
                  )}
                </div>

                {plant.planting_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    Geplant: {new Date(plant.planting_date).toLocaleDateString("nl-NL")}
                  </div>
                )}

                {plant.expected_harvest_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    Oogst verwacht: {new Date(plant.expected_harvest_date).toLocaleDateString("nl-NL")}
                  </div>
                )}

                {plant.notes && <p className="text-sm text-gray-600 line-clamp-2">{plant.notes}</p>}

                <div className="flex gap-2 pt-2">
                  <Link href={`/gardens/${garden.id}/plant-beds/${plantBed.id}/plants/${plant.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Eye className="h-3 w-3 mr-1" />
                      Bekijk
                    </Button>
                  </Link>
                  <Link href={`/gardens/${garden.id}/plant-beds/${plantBed.id}/plants/${plant.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Bewerk
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePlant(plant.id, plant.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? "Geen planten gevonden" : "Nog geen planten"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? `Geen planten gevonden voor "${searchTerm}"`
              : `Begin met het toevoegen van planten aan ${plantBed.name}`}
          </p>
          {!searchTerm && (
            <Link href={`/gardens/${garden.id}/plant-beds/${plantBed.id}/plants/new`}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Eerste Plant Toevoegen
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {plantBed.plants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overzicht Planten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{plantBed.plants.length}</div>
                <div className="text-sm text-gray-600">Totaal</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {plantBed.plants.filter((p) => p.status === "healthy").length}
                </div>
                <div className="text-sm text-gray-600">Gezond</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {plantBed.plants.filter((p) => p.status === "needs_attention").length}
                </div>
                <div className="text-sm text-gray-600">Aandacht</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {plantBed.plants.filter((p) => p.status === "diseased").length}
                </div>
                <div className="text-sm text-gray-600">Ziek</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {plantBed.plants.filter((p) => p.status === "harvested").length}
                </div>
                <div className="text-sm text-gray-600">Geoogst</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
