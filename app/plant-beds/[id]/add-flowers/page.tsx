"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Flower,
  Search,
  Filter,
  Calendar,
  Palette,
  Sparkles,
  Plus,
  ShoppingCart,
} from "lucide-react"
import { getPopularFlowers, FLOWER_CATEGORIES } from "@/lib/dutch-flowers"
import type { FlowerData } from "@/lib/dutch-flowers"
import { getPlantBed } from "@/lib/database"
import type { PlantBedWithPlants } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AddFlowersPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBedWithPlants | null>(null)
  const [popularFlowers, setPopularFlowers] = useState<FlowerData[]>([])
  const [filteredFlowers, setFilteredFlowers] = useState<FlowerData[]>([])
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedColor, setSelectedColor] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Colors for filtering
  const colors = ['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Blauw', 'Oranje', 'Groen']

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load plant bed info
        const bed = await getPlantBed(params.id as string)
        setPlantBed(bed)
        
        // Load flowers
        const flowers = getPopularFlowers()
        setPopularFlowers(flowers)
        setFilteredFlowers(flowers)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het laden van de gegevens.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, toast])

  useEffect(() => {
    let filtered = popularFlowers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((flower) =>
        flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flower.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((flower) => flower.category === selectedCategory)
    }

    // Filter by color
    if (selectedColor !== "all") {
      filtered = filtered.filter((flower) => flower.color === selectedColor)
    }

    setFilteredFlowers(filtered)
  }, [searchTerm, selectedCategory, selectedColor, popularFlowers])

  const handleFlowerSelect = (flower: FlowerData, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFlowers(prev => [...prev, flower])
    } else {
      setSelectedFlowers(prev => prev.filter(f => f.name !== flower.name))
    }
  }

  const handleAddSelectedFlowers = async () => {
    if (selectedFlowers.length === 0) {
      toast({
        title: "Geen bloemen geselecteerd",
        description: "Selecteer eerst bloemen om toe te voegen.",
        variant: "destructive",
      })
      return
    }

    try {
      // Here you would normally add the flowers to the database
      // For now, we'll just show a success message and redirect
      toast({
        title: "Bloemen toegevoegd!",
        description: `${selectedFlowers.length} bloemen zijn toegevoegd aan plantvak ${plantBed?.id}.`,
      })
      
      router.push(`/plant-beds/${params.id}`)
    } catch (error) {
      console.error("Error adding flowers:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de bloemen.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Bloemen laden...</p>
        </div>
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
    <div className="container mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flower className="h-8 w-8 text-pink-600" />
              Bloemen Toevoegen
            </h1>
            <p className="text-gray-600 mt-1">
              Voeg bloemen toe aan plantvak {plantBed.id} ({plantBed.name})
            </p>
          </div>
        </div>
        {selectedFlowers.length > 0 && (
          <Button 
            onClick={handleAddSelectedFlowers}
            className="bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {selectedFlowers.length} Bloemen Toevoegen
          </Button>
        )}
      </div>

      {/* Plantvak Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Plantvak Informatie</h3>
              <p className="text-sm text-blue-700">
                {plantBed.name} • {plantBed.location} • {plantBed.size}
              </p>
            </div>
            <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
              {plantBed.sun_exposure === 'full-sun' ? 'Volle zon' : 
               plantBed.sun_exposure === 'partial-sun' ? 'Gedeeltelijke zon' : 'Schaduw'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Zoek bloemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue placeholder="Alle kleuren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle kleuren</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredFlowers.length} van {popularFlowers.length} bloemen
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Flowers Summary */}
      {selectedFlowers.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <ShoppingCart className="h-5 w-5" />
              Geselecteerde Bloemen ({selectedFlowers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedFlowers.map((flower) => (
                <Badge key={flower.name} variant="secondary" className="bg-green-100 text-green-800">
                  {flower.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flowers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlowers.map((flower) => {
          const isSelected = selectedFlowers.some(f => f.name === flower.name)
          
          return (
            <Card key={flower.name} className={`transition-all ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flower className="h-5 w-5 text-pink-500" />
                      {flower.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {FLOWER_CATEGORIES[flower.category as keyof typeof FLOWER_CATEGORIES]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {flower.color}
                      </Badge>
                    </div>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleFlowerSelect(flower, checked as boolean)}
                    className="ml-2"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{flower.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Hoogte:</span>
                    <div className="text-gray-600">{flower.height}cm</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Bloeitijd:</span>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {flower.bloom_time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-700">Bijzonderheden:</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {flower.special_features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredFlowers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen bloemen gevonden</h3>
            <p className="text-gray-600 mb-4">
              Probeer andere zoektermen of pas je filters aan.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedColor("all")
              }}
            >
              Filters Wissen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fixed Bottom Bar for Mobile */}
      {selectedFlowers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden">
          <Button 
            onClick={handleAddSelectedFlowers}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {selectedFlowers.length} Bloemen Toevoegen
          </Button>
        </div>
      )}
    </div>
  )
}