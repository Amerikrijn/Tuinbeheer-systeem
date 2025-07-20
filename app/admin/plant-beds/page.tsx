"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Home,
  TreePine,
  Flower,
  Sparkles,
} from "lucide-react"
import { getMockPlantBeds, getMockGarden, type PlantBed, type Garden } from "@/lib/mock-data"
import { useLanguage } from "@/hooks/use-language"
import { t } from "@/lib/translations"

export default function PlantBedsPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [plantBeds, setPlantBeds] = useState<PlantBed[]>([])
  const [garden, setGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadPlantBeds = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setPlantBeds(getMockPlantBeds())
        setGarden(getMockGarden())
      } catch (error) {
        console.error("Error loading plant beds:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlantBeds()
  }, [])

  const filteredPlantBeds = plantBeds.filter(
    (bed) =>
      bed.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return <Sun className="h-4 w-4 text-yellow-500" />
      case "partial-sun":
        return <CloudSun className="h-4 w-4 text-orange-500" />
      case "shade":
        return <Cloud className="h-4 w-4 text-gray-500" />
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSunExposureText = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return language === "nl" ? "Volle zon" : "Full sun"
      case "partial-sun":
        return language === "nl" ? "Gedeeltelijke zon" : "Partial sun"
      case "shade":
        return language === "nl" ? "Schaduw" : "Shade"
      default:
        return language === "nl" ? "Onbekend" : "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalPlants = plantBeds.reduce((sum, bed) => sum + bed.plants.length, 0)
  const totalBeds = plantBeds.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-green-50 to-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-pink-200 opacity-10">
          <Flower className="h-32 w-32 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-green-200 opacity-10">
          <TreePine className="h-40 w-40 animate-bounce" />
        </div>
        <div className="absolute bottom-40 left-40 text-blue-200 opacity-10">
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
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 hover:bg-white/50"
            >
              <Home className="h-4 w-4" />
              {t("garden.management.screen", language)}
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <Leaf className="h-10 w-10 text-green-600" />
                {t("plant.bed.management", language)}
              </h1>
              <p className="text-gray-600 mt-2">
                {language === "nl"
                  ? "Beheer alle plantvakken en hun inhoud"
                  : "Manage all plant beds and their contents"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/garden">
              <Button
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-green-300 text-green-700 hover:bg-green-50"
              >
                <TreePine className="h-4 w-4 mr-2" />
                {language === "nl" ? "Tuin Instellingen" : "Garden Settings"}
              </Button>
            </Link>
            <Link href="/admin/plant-beds/layout">
              <Button
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {language === "nl" ? "Visuele Layout Designer" : "Visual Layout Designer"}
              </Button>
            </Link>
            <Link href="/admin/plant-beds/configure">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t("new.plant.bed", language)}
              </Button>
            </Link>
          </div>
        </div>

        {/* Garden Overview Card */}
        {garden && (
          <Card className="border-0 bg-gradient-to-r from-green-100 to-blue-100 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-green-800 text-2xl">
                  <TreePine className="h-8 w-8" />
                  {garden.name}
                </CardTitle>
                <Link href="/admin/garden">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/80 backdrop-blur-sm border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {language === "nl" ? "Tuin Bewerken" : "Edit Garden"}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">
                    {language === "nl" ? "Totale oppervlakte:" : "Total area:"}
                  </span>
                  <div className="text-green-900 font-bold">{garden.totalArea}</div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">
                    {language === "nl" ? "Afmetingen:" : "Dimensions:"}
                  </span>
                  <div className="text-green-900 font-bold">
                    {garden.length}m × {garden.width}m
                  </div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">
                    {language === "nl" ? "Aantal plantvakken:" : "Number of plant beds:"}
                  </span>
                  <div className="text-green-900 font-bold">{totalBeds}</div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">
                    {language === "nl" ? "Totaal planten:" : "Total plants:"}
                  </span>
                  <div className="text-green-900 font-bold">{totalPlants}</div>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{language === "nl" ? "Tuintype:" : "Garden type:"}</span>
                  <div className="text-green-900 font-bold">{garden.gardenType}</div>
                </div>
              </div>
              <div className="text-sm text-green-700">
                <strong>{language === "nl" ? "Locatie:" : "Location:"}</strong> {garden.location}
              </div>
              <div className="text-sm text-green-700">{garden.description}</div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={
                  language === "nl"
                    ? "Zoek plantvakken op ID, naam of locatie..."
                    : "Search plant beds by ID, name, or location..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{plantBeds.length}</div>
              <div className="text-sm text-gray-600">
                {language === "nl" ? "Totaal Plantvakken" : "Total Plant Beds"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalPlants}</div>
              <div className="text-sm text-gray-600">{language === "nl" ? "Totaal Planten" : "Total Plants"}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {plantBeds.filter((bed) => bed.plants.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">{language === "nl" ? "Bezette Vakken" : "Occupied Beds"}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((plantBeds.filter((bed) => bed.plants.length > 0).length / plantBeds.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">{language === "nl" ? "Bezettingsgraad" : "Occupancy Rate"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Plant Beds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantBeds.map((bed) => (
            <Card
              key={bed.id}
              className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-lg font-bold px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100"
                    >
                      {bed.id}
                    </Badge>
                    <div>
                      <CardTitle className="text-lg">{bed.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="h-3 w-3" />
                        {bed.location}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getSunExposureIcon(bed.sunExposure)}
                    <span className="text-gray-600">{getSunExposureText(bed.sunExposure)}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">{bed.plants.length}</span> {language === "nl" ? "planten" : "plants"}
                  </div>
                  <div className="text-gray-600 col-span-2">
                    <span className="font-medium">{language === "nl" ? "Grootte:" : "Size:"}</span> {bed.size}
                  </div>
                </div>

                {bed.description && <p className="text-sm text-gray-600 line-clamp-2">{bed.description}</p>}

                {/* Plant Preview */}
                {bed.plants.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      {language === "nl" ? "Recente Planten:" : "Recent Plants:"}
                    </div>
                    <div className="space-y-1">
                      {bed.plants.slice(0, 2).map((plant) => (
                        <div key={plant.id} className="flex items-center justify-between text-xs">
                          <span className="truncate">{plant.name}</span>
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {plant.status}
                          </Badge>
                        </div>
                      ))}
                      {bed.plants.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{bed.plants.length - 2} {language === "nl" ? "meer planten" : "more plants"}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/plant-beds/${bed.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full bg-white/80 backdrop-blur-sm border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === "nl" ? "Bekijk" : "View"}
                    </Button>
                  </Link>
                  <Link href={`/admin/plant-beds/${bed.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/80 backdrop-blur-sm border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlantBeds.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              {searchTerm
                ? language === "nl"
                  ? "Geen plantvakken gevonden"
                  : "No plant beds found"
                : language === "nl"
                  ? "Nog geen plantvakken"
                  : "No plant beds yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? language === "nl"
                  ? "Probeer andere zoektermen"
                  : "Try adjusting your search terms"
                : language === "nl"
                  ? "Begin met het maken van je eerste plantvak"
                  : "Start by creating your first plant bed"}
            </p>
            {!searchTerm && (
              <Link href="/admin/plant-beds/configure">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "nl" ? "Eerste Plantvak Maken" : "Create First Plant Bed"}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
