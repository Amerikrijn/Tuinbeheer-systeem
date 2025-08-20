"use client"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  Flower2, 
  Sun, 
  Droplets, 
  Calendar,
  MapPin,
  Info,
  Plus,
  Check
} from 'lucide-react'
import { useNavigation } from '@/hooks/use-navigation'
import { 
  FLOWER_DATABASE, 
  searchFlowers, 
  getFlowersByCategory,
  flowerToPlantData,
  DUTCH_MONTHS,
  type FlowerTemplate 
} from '@/lib/flowers-database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'

export default function FlowersPage() {
  const { goBack } = useNavigation()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFlower, setSelectedFlower] = useState<FlowerTemplate | null>(null)
  const [showPlantDialog, setShowPlantDialog] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(FLOWER_DATABASE.map(f => f.category))
    return Array.from(cats).sort()
  }, [])

  const filteredFlowers = useMemo(() => {
    let flowers = FLOWER_DATABASE
    
    if (selectedCategory !== 'all') {
      flowers = getFlowersByCategory(selectedCategory)
    }
    
    if (searchTerm) {
      const searchResults = searchFlowers(searchTerm)
      flowers = flowers.filter(f => searchResults.includes(f))
    }
    
    return flowers
  }, [searchTerm, selectedCategory])

  const getSunIcon = (pref: string) => {
    switch(pref) {
      case 'full-sun': return '☀️☀️☀️'
      case 'partial-sun': return '☀️☀️'
      case 'shade': return '☀️'
      default: return pref
    }
  }

  const getWaterIcon = (days: number) => {
    if (days <= 2) return '💧💧💧'
    if (days <= 5) return '💧💧'
    return '💧'
  }

  const handleSelectFlower = (flower: FlowerTemplate) => {
    setSelectedFlower(flower)
    setShowPlantDialog(true)
  }

  const handleAddToGarden = () => {
    if (selectedFlower) {
      // Store the selected flower data in sessionStorage
      const plantData = flowerToPlantData(selectedFlower)
      sessionStorage.setItem('selectedFlowerData', JSON.stringify(plantData))
      
      toast({
        title: "Bloem geselecteerd",
        description: `${selectedFlower.name} is klaar om toe te voegen aan je tuin`,
      })
      
      // Navigate to gardens page or plant add page
      router.push('/gardens')
    }
    setShowPlantDialog(false)
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
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
          Selecteer een bloem om automatisch alle gegevens in te vullen bij het toevoegen aan je tuin
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
            Alle ({FLOWER_DATABASE.length})
          </Button>
          {categories.map((cat) => {
            const count = getFlowersByCategory(cat).length
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFlowers.map((flower) => (
          <Card 
            key={flower.name}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => handleSelectFlower(flower)}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={flower.imageUrl} 
                alt={flower.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-black">
                  {flower.emoji} {flower.category}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <h3 className="text-white font-bold text-lg">{flower.name}</h3>
                <p className="text-white/80 text-sm italic">{flower.scientific_name}</p>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              {/* Quick info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: flower.color }}
                  />
                  <span>{flower.plant_color}</span>
                </div>
                <span className="font-medium">{flower.height} cm</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Sun className="h-3 w-3" />
                  <span>{getSunIcon(flower.sun_preference)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span>{getWaterIcon(flower.watering_frequency)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{flower.bloom_period}</span>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {flower.description}
              </p>
              
              <Button 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectFlower(flower)
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Selecteer voor tuin
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selection Dialog */}
      <Dialog open={showPlantDialog} onOpenChange={setShowPlantDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFlower?.emoji} {selectedFlower?.name} geselecteerd
            </DialogTitle>
            <DialogDescription>
              Deze bloem toevoegen aan je tuin? Alle gegevens worden automatisch ingevuld.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlower && (
            <div className="space-y-4">
              <img 
                src={selectedFlower.imageUrl} 
                alt={selectedFlower.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Eigenschappen</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Latijnse naam:</dt>
                      <dd>{selectedFlower.scientific_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Hoogte:</dt>
                      <dd>{selectedFlower.height} cm</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Kleur:</dt>
                      <dd className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: selectedFlower.color }}
                        />
                        {selectedFlower.plant_color}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Per m²:</dt>
                      <dd>{selectedFlower.plants_per_sqm} planten</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Verzorging</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Zon:</dt>
                      <dd>{getSunIcon(selectedFlower.sun_preference)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Water:</dt>
                      <dd>Om de {selectedFlower.watering_frequency} dagen</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Grond:</dt>
                      <dd>{selectedFlower.soilType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Bloeitijd:</dt>
                      <dd>{selectedFlower.bloom_period}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-semibold mb-1 text-sm">Verzorgingstips</h4>
                <p className="text-sm">{selectedFlower.care_instructions}</p>
              </div>
              
              {selectedFlower.companionPlants && selectedFlower.companionPlants.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Combineert goed met</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlower.companionPlants.map((plant) => (
                      <Badge key={plant} variant="secondary">
                        {plant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2 text-sm">Plant maanden</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFlower.planting_months.map((month) => (
                    <Badge 
                      key={month} 
                      variant="outline"
                      className="bg-green-50"
                    >
                      {DUTCH_MONTHS[month - 1]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlantDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={handleAddToGarden}>
              <Check className="h-4 w-4 mr-2" />
              Gebruik deze gegevens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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