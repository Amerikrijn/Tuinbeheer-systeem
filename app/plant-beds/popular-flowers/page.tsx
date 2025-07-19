"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Flower,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Calendar,
  Palette,
  Sparkles,
  Home,
  Plus,
} from "lucide-react"
import { getPopularFlowers, FLOWER_CATEGORIES } from "@/lib/dutch-flowers"
import type { FlowerData } from "@/lib/dutch-flowers"

export default function PopularFlowersPage() {
  const [popularFlowers, setPopularFlowers] = useState<FlowerData[]>([])
  const [filteredFlowers, setFilteredFlowers] = useState<FlowerData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedColor, setSelectedColor] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Colors for filtering
  const colors = ['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Blauw', 'Oranje', 'Groen']

  useEffect(() => {
    const flowers = getPopularFlowers()
    setPopularFlowers(flowers)
    setFilteredFlowers(flowers)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = popularFlowers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(flower =>
        flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flower.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flower.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(flower => flower.category === selectedCategory)
    }

    // Filter by color
    if (selectedColor !== "all") {
      filtered = filtered.filter(flower => flower.kleur.includes(selectedColor))
    }

    setFilteredFlowers(filtered)
  }, [searchTerm, selectedCategory, selectedColor, popularFlowers])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/plant-beds">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Plantvakken
              </Button>
            </Link>
            <Link href="/plant-beds/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Plantvak Toevoegen
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              60 Meest Voorkomende Bloemen
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </h1>
            <p className="text-gray-600 text-lg">
              Ontdek de populairste bloemen voor jouw tuin
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter en Zoek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Zoek bloemen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle categorieën" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  {Object.entries(FLOWER_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Color Filter */}
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle kleuren" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle kleuren</SelectItem>
                  {colors.map(color => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-center bg-green-50 rounded-lg px-4 py-2">
                <span className="text-green-700 font-medium">
                  {filteredFlowers.length} van {popularFlowers.length} bloemen
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flowers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFlowers.map((flower, index) => (
            <Card key={flower.name} className="hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flower className="h-5 w-5 text-green-600" />
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {FLOWER_CATEGORIES[flower.category]}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{flower.name}</CardTitle>
                {flower.scientificName && (
                  <p className="text-sm text-gray-600 italic">{flower.scientificName}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Description */}
                  {flower.description && (
                    <p className="text-sm text-gray-700">{flower.description}</p>
                  )}

                  {/* Colors */}
                  <div className="flex flex-wrap gap-1">
                    <Palette className="h-4 w-4 text-gray-500 mr-1" />
                    {flower.kleur.map((kleur) => (
                      <Badge key={kleur} variant="secondary" className="text-xs">
                        {kleur}
                      </Badge>
                    ))}
                  </div>

                  {/* Bloom Period */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{flower.bloeiperiode}</span>
                  </div>

                  {/* Add to Garden Button */}
                  <Link href={`/plant-beds/add-plant?flower=${encodeURIComponent(flower.name)}`}>
                    <Button className="w-full mt-3" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Toevoegen aan Tuin
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFlowers.length === 0 && (
          <div className="text-center py-12">
            <Flower className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen bloemen gevonden
            </h3>
            <p className="text-gray-600">
              Probeer andere zoekfilters of wis de huidige filters
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedColor("all")
              }}
            >
              Filters Wissen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}