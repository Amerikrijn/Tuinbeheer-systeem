"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  MapPin,
  Users,
  Sprout,
  Calendar,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getGardens } from "@/lib/database"
import type { Garden } from "@/lib/types"

export default function GardensPage() {
  const { t } = useLanguage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    async function loadGardens() {
      try {
        const gardensData = await getGardens()
        setGardens(gardensData)
      } catch (error) {
        console.error("Error loading gardens:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGardens()
  }, [])

  const filteredGardens = gardens.filter((garden) => {
    const matchesSearch =
      garden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      garden.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || garden.garden_type === filterType
    return matchesSearch && matchesFilter
  })

  const gardenTypes = [...new Set(gardens.map((g) => g.garden_type))]

  const stats = {
    total: gardens.length,
    active: gardens.filter((g) => g.is_active).length,
    totalArea: gardens.reduce((sum, g) => sum + (g.total_area || 0), 0),
    totalPlantBeds: gardens.reduce((sum, g) => sum + (g.plant_beds?.length || 0), 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t("gardens")}</h1>
                  <p className="text-sm text-gray-500">{t("manageAllGardens")}</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/gardens/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addGarden")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("totalGardens")}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("activeGardens")}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("totalArea")}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalArea}m²</p>
                </div>
                <Sprout className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("plantBeds")}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPlantBeds}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t("searchGardens")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">{t("allTypes")}</option>
                  {gardenTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gardens Grid/List */}
        {filteredGardens.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? t("noGardensFound") : t("noGardensYet")}
              </h3>
              <p className="text-gray-600 mb-6">{searchTerm ? t("tryDifferentSearch") : t("createFirstGarden")}</p>
              {!searchTerm && (
                <Link href="/gardens/new">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addFirstGarden")}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredGardens.map((garden) => (
              <Card key={garden.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{garden.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {garden.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={garden.is_active ? "default" : "secondary"}>
                        {garden.is_active ? t("active") : t("inactive")}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{garden.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Sprout className="h-4 w-4 mr-1" />
                        {garden.plant_beds?.length || 0} {t("plantBeds")}
                      </span>
                      <span>{garden.total_area}m²</span>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {garden.garden_type}
                    </Badge>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link href={`/gardens/${garden.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            {t("view")}
                          </Button>
                        </Link>
                        <Link href={`/gardens/${garden.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            {t("edit")}
                          </Button>
                        </Link>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
