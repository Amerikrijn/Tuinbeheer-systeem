"use client"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Flower2, Sun, Droplets, Calendar } from 'lucide-react'
import { useNavigation } from '@/hooks/use-navigation'
import { DUTCH_FLOWERS, FLOWER_CATEGORIES, searchFlowers, getFlowersByCategory } from '@/lib/dutch-flowers'
import type { FlowerData } from '@/lib/dutch-flowers'

export default function FlowersPage() {
  const { goBack } = useNavigation()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedFlower, setExpandedFlower] = useState<string | null>(null)

  const filteredFlowers = useMemo(() => {
    let flowers = DUTCH_FLOWERS
    
    if (selectedCategory !== 'all') {
      flowers = getFlowersByCategory(selectedCategory)
    }
    
    if (searchTerm) {
      flowers = searchFlowers(searchTerm).filter(f => 
        selectedCategory === 'all' || f.category === selectedCategory
      )
    }
    
    return flowers
  }, [searchTerm, selectedCategory])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'eenjarig': 'bg-pink-100 text-pink-800',
      'tweejarig': 'bg-purple-100 text-purple-800',
      'vaste plant': 'bg-green-100 text-green-800',
      'bol': 'bg-yellow-100 text-yellow-800',
      'knol': 'bg-orange-100 text-orange-800',
      'struik': 'bg-blue-100 text-blue-800',
      'klimplant': 'bg-indigo-100 text-indigo-800',
      'wilde bloem': 'bg-teal-100 text-teal-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getSunRequirement = (sun: string) => {
    const icons: Record<string, string> = {
      'volle zon': '☀️☀️☀️',
      'halfschaduw': '☀️☀️',
      'schaduw': '☀️'
    }
    return icons[sun] || sun
  }

  const getWaterRequirement = (water: string) => {
    const icons: Record<string, string> = {
      'weinig': '💧',
      'matig': '💧💧',
      'veel': '💧💧💧'
    }
    return icons[water] || water
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Terug
          </Button>
          
          <div className="flex items-center gap-3">
            <Flower2 className="w-7 h-7 text-pink-600" />
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Bloemen Encyclopedie
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Ontdek {DUTCH_FLOWERS.length} populaire bloemen voor Nederlandse tuinen
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Zoek bloemen op naam, kleur of eigenschap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Alle ({DUTCH_FLOWERS.length})
          </Button>
          {Object.entries(FLOWER_CATEGORIES).map(([key, label]) => {
            const count = getFlowersByCategory(key).length
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {label} ({count})
              </Button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredFlowers.length} bloemen gevonden
      </div>

      {/* Flowers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlowers.map((flower) => (
          <Card 
            key={flower.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setExpandedFlower(
              expandedFlower === flower.id ? null : flower.id
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{flower.name}</CardTitle>
                <Badge className={getCategoryColor(flower.category)}>
                  {FLOWER_CATEGORIES[flower.category]}
                </Badge>
              </div>
              {flower.latinName && (
                <p className="text-sm text-muted-foreground italic">
                  {flower.latinName}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Basic info always visible */}
              <div className="flex flex-wrap gap-2">
                {flower.colors.map((color, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {color}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{flower.bloomingPeriod}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">Hoogte: {flower.height}</span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedFlower === flower.id && (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {flower.description}
                  </p>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Sun className="h-3 w-3" />
                      <span>Zon: {getSunRequirement(flower.sunRequirement)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-3 w-3" />
                      <span>Water: {getWaterRequirement(flower.waterRequirement)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Grond:</span> {flower.soilType}
                    </div>
                    {flower.spacing && (
                      <div>
                        <span className="font-medium">Plantafstand:</span> {flower.spacing}
                      </div>
                    )}
                  </div>

                  {flower.careTips && (
                    <div className="pt-2">
                      <p className="font-medium text-sm mb-1">Verzorgingstips:</p>
                      <p className="text-sm text-muted-foreground">
                        {flower.careTips}
                      </p>
                    </div>
                  )}

                  {flower.companionPlants && flower.companionPlants.length > 0 && (
                    <div className="pt-2">
                      <p className="font-medium text-sm mb-1">Combineert goed met:</p>
                      <div className="flex flex-wrap gap-1">
                        {flower.companionPlants.map((plant, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {plant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Click hint */}
              <p className="text-xs text-center text-muted-foreground pt-2">
                {expandedFlower === flower.id ? 'Klik om te sluiten' : 'Klik voor meer details'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredFlowers.length === 0 && (
        <Card className="p-8 text-center">
          <Flower2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Geen bloemen gevonden</h3>
          <p className="text-muted-foreground">
            Probeer een andere zoekterm of categorie
          </p>
        </Card>
      )}
    </div>
  )
}