"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Leaf, Calendar, Palette, Info, Grid3X3, List, Filter } from 'lucide-react'
import { 
  DUTCH_FLOWERS, 
  FlowerData, 
  getPopularFlowers, 
  searchFlowers,
  getFlowersByCategory,
  getFlowersByColor,
  FLOWER_CATEGORIES,
  FLOWER_COLORS
} from '@/lib/dutch-flowers'
import { useViewPreference } from '@/hooks/use-view-preference'

export default function BloemencatalogusPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedColor, setSelectedColor] = useState<string>('all')
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const { isVisualView, toggleView } = useViewPreference()

  // Filter flowers based on all criteria
  const filteredFlowers = useMemo(() => {
    let flowers = DUTCH_FLOWERS

    // Search filter
    if (searchQuery.trim()) {
      flowers = searchFlowers(searchQuery)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      flowers = flowers.filter(flower => flower.category === selectedCategory)
    }

    // Color filter
    if (selectedColor !== 'all') {
      flowers = flowers.filter(flower => flower.kleur.includes(selectedColor))
    }

    // Popular filter
    if (showPopularOnly) {
      flowers = flowers.filter(flower => flower.popular)
    }

    // Sort: popular first, then alphabetically
    return flowers.sort((a, b) => {
      if (a.popular && !b.popular) return -1
      if (!a.popular && b.popular) return 1
      return a.name.localeCompare(b.name)
    })
  }, [searchQuery, selectedCategory, selectedColor, showPopularOnly])

  const popularFlowers = getPopularFlowers()
  const stats = {
    total: DUTCH_FLOWERS.length,
    popular: popularFlowers.length,
    categories: Object.keys(FLOWER_CATEGORIES).length,
    filtered: filteredFlowers.length
  }

  // Helper function to get color hex values
  const getColorHex = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      'Wit': '#ffffff',
      'Geel': '#ffd700',
      'Roze': '#ffc0cb',
      'Rood': '#ff0000',
      'Paars': '#8a2be2',
      'Blauw': '#0000ff',
      'Oranje': '#ffa500',
      'Groen': '#00ff00'
    }
    return colorMap[color] || '#cccccc'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nederlandse Bloemen Catalogus
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ontdek {stats.total} Nederlandse bloemen voor je tuin
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Totaal bloemen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.popular}</div>
              <div className="text-sm text-gray-600">Populaire soorten</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
              <div className="text-sm text-gray-600">Categorieën</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.filtered}</div>
              <div className="text-sm text-gray-600">Gefilterd</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={isVisualView ? "default" : "outline"}
                size="sm"
                onClick={toggleView}
                className="px-2"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                {isVisualView ? "Lijst" : "Kaarten"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek bloemen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Alle categorieën" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {Object.entries(FLOWER_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Color filter */}
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue placeholder="Alle kleuren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle kleuren</SelectItem>
                {FLOWER_COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Popular toggle */}
            <Button
              variant={showPopularOnly ? "default" : "outline"}
              onClick={() => setShowPopularOnly(!showPopularOnly)}
              className="justify-start"
            >
              <Leaf className="h-4 w-4 mr-2" />
              {showPopularOnly ? "Alleen populair" : "Toon populair"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredFlowers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen bloemen gevonden
            </h3>
            <p className="text-gray-600">
              Probeer je filters aan te passen of een andere zoekterm te gebruiken.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={isVisualView 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-4"
        }>
          {filteredFlowers.map((flower) => (
            <FlowerCard 
              key={flower.name} 
              flower={flower} 
              isListView={!isVisualView}
              getColorHex={getColorHex}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Flower Card Component
interface FlowerCardProps {
  flower: FlowerData
  isListView?: boolean
  getColorHex: (color: string) => string
}

function FlowerCard({ flower, isListView = false, getColorHex }: FlowerCardProps) {
  return (
    <Card className={`hover:shadow-md transition-all duration-200 border-2 hover:border-green-200 ${
      isListView ? 'mb-2' : ''
    }`}>
      <CardHeader className={isListView ? "pb-2 py-3" : "pb-3"}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={`font-semibold text-card-foreground flex items-center gap-2 ${
              isListView ? 'text-base' : 'text-lg'
            }`}>
              <Leaf className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="truncate">{flower.name}</span>
              {flower.popular && (
                <Badge variant="secondary" className="px-1 py-0 text-xs bg-green-100 text-green-700 flex-shrink-0">
                  Populair
                </Badge>
              )}
            </CardTitle>
            {flower.scientificName && (
              <p className="text-sm text-muted-foreground italic mt-1">
                {flower.scientificName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Category */}
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            {FLOWER_CATEGORIES[flower.category]}
          </Badge>
        </div>

        {/* Bloom period */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">Bloeiperiode:</span>
          <span className="text-sm font-medium">{flower.bloeiperiode}</span>
        </div>

        {/* Colors */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-gray-600">Kleuren:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {flower.kleur.map((color) => (
              <div key={color} className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <span className="text-xs">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {flower.description && (
          <div className="flex items-start gap-2 mb-4">
            <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{flower.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" className="flex-1">
            <Leaf className="h-3 w-3 mr-1" />
            Toevoegen aan tuin
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}