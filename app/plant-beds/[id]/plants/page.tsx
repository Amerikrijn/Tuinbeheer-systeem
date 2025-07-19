"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Leaf,
  MapPin,
  Flower,
  TreePine,
  Sparkles,
} from "lucide-react"
import { getMockPlantBeds, type PlantBed } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function PlantBedPlantsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadPlantBed = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const beds = getMockPlantBeds()
        const bed = beds.find((b) => b.id === params.id)
        setPlantBed(bed || null)
      } catch (error) {
        console.error("Error loading plant bed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlantBed()
  }, [params.id])

  const handleDeletePlant = async (plantId: string) => {
    if (!plantBed) return
    
    // Mock deletion - in real app, this would be an API call
    const updatedPlants = plantBed.plants.filter((plant) => plant.id !== plantId)
    setPlantBed({ ...plantBed, plants: updatedPlants })
    
    toast({
      title: "Plant verwijderd",
      description: "De plant is succesvol verwijderd.",
    })
  }

  const filteredPlants = plantBed?.plants.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.color.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse h-12 bg-gray-200 rounded" />
        <div className="animate-pulse h-96 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Plantvak niet gevonden</h1>
          <p className="text-gray-600 mt-2">Het opgegeven plantvak bestaat niet.</p>
          <Link href="/plant-beds">
            <Button className="mt-4">Terug naar Plantvakken</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-green-200 opacity-10">
          <Flower className="h-32 w-32 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-blue-200 opacity-10">
          <TreePine className="h-40 w-40 animate-bounce" />
        </div>
        <div className="absolute bottom-40 left-40 text-purple-200 opacity-10">
          <Sparkles className="h-24 w-24 animate-spin" />
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/plant-beds/${plantBed.id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar Plantvak
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <Leaf className="h-10 w-10 text-green-600" />
                Planten in {plantBed.name}
              </h1>
              <p className="text-gray-600 mt-2">Beheer alle planten in dit plantvak</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/plant-beds/${plantBed.id}/plants/new`}>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Plant
              </Button>
            </Link>
            <Link href={`/plant-beds/${plantBed.id}/layout`}>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-blue-300 text-blue-700 hover:bg-blue-50">
                <MapPin className="h-4 w-4 mr-2" />
                Visueel Overzicht
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek planten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Plants Grid */}
        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <Card key={plant.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Flower className="h-5 w-5" />
                      {plant.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {plant.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Kleur:</span>
                      <div className="font-medium">{plant.color}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Hoogte:</span>
                      <div className="font-medium">{plant.height}cm</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Geplant:</span>
                      <div className="font-medium">{new Date(plant.plantingDate).toLocaleDateString("nl-NL")}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium">{plant.status}</div>
                    </div>
                  </div>
                  
                  {plant.notes && (
                    <>
                      <Separator />
                      <div className="text-sm text-gray-600">{plant.notes}</div>
                    </>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Link href={`/plant-beds/${plantBed.id}/plants/${plant.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Bekijk Details
                      </Button>
                    </Link>
                    <Link href={`/plant-beds/${plantBed.id}/plants/${plant.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlant(plant.id)}
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
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="text-center py-12">
              <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? "Geen planten gevonden" : "Nog geen planten"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? `Geen planten gevonden voor "${searchTerm}"`
                  : `Begin met het toevoegen van planten aan ${plantBed.name}`}
              </p>
              <Link href={`/plant-beds/${plantBed.id}/plants/new`}>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {searchTerm ? "Nieuwe Plant Toevoegen" : "Eerste Plant Toevoegen"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        {plantBed.plants.length > 0 && (
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Overzicht Planten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{plantBed.plants.length}</div>
                  <div className="text-sm text-gray-600">Totaal</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
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
                  <div className="text-2xl font-bold text-purple-600">
                    {plantBed.plants.filter((p) => p.status === "flowering").length}
                  </div>
                  <div className="text-sm text-gray-600">Bloeiend</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}