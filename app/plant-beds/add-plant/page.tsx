"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Leaf,
  ArrowLeft,
  Upload,
  Camera,
  Ruler,
  Calendar,
  Palette,
  Search,
  CheckCircle,
  AlertCircle,
  Home,
} from "lucide-react"
import { getPlantBeds, createPlant } from "@/lib/database"
import { DUTCH_FLOWERS } from "@/lib/dutch-flowers"
import type { PlantBed } from "@/lib/supabase"

export default function AddPlantPage() {
  const searchParams = useSearchParams()
  const [plantBeds, setPlantBeds] = useState<PlantBed[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [selectedPlantBed, setSelectedPlantBed] = useState<string>("")
  const [selectedFlower, setSelectedFlower] = useState<string>("")
  const [stemLength, setStemLength] = useState<string>("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Pre-select flower from URL parameter
  useEffect(() => {
    const flowerParam = searchParams.get('flower')
    if (flowerParam) {
      setSelectedFlower(flowerParam)
      setSearchTerm(flowerParam) // Also set search term to show the flower
    }
  }, [searchParams])

  // Filter flowers to only show eenjarig (1-jarige)
  const eenjarigFlowers = DUTCH_FLOWERS.filter(flower => flower.category === 'eenjarig')
  
  // Filter flowers based on search term
  const filteredFlowers = eenjarigFlowers.filter(flower =>
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flower.scientificName && flower.scientificName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedFlowerData = eenjarigFlowers.find(flower => flower.name === selectedFlower)

  useEffect(() => {
    const loadPlantBeds = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPlantBeds()
        setPlantBeds(data)
      } catch (err) {
        console.error("Error loading plant beds:", err)
        setError("Fout bij het laden van plantvakken")
      } finally {
        setLoading(false)
      }
    }

    loadPlantBeds()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Foto mag maximaal 5MB zijn")
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Alleen afbeeldingen zijn toegestaan")
        return
      }
      
      setPhotoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPlantBed || !selectedFlower || !stemLength) {
      setError("Vul alle verplichte velden in")
      return
    }

    if (parseFloat(stemLength) <= 0) {
      setError("Steellengte moet groter zijn dan 0")
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      // Prepare plant data for database
      const plantData = {
        plant_bed_id: selectedPlantBed,
        name: selectedFlower,
        scientific_name: selectedFlowerData?.scientificName || "",
        category: 'eenjarig',
        bloom_period: selectedFlowerData?.bloeiperiode || "",
        stem_length: parseFloat(stemLength),
        photo_url: photoFile ? "uploaded-photo-url" : undefined, // TODO: Implement photo upload
        planting_date: new Date().toISOString().split('T')[0],
        status: 'healthy' as const,
        notes: notes || undefined,
        color: selectedFlowerData?.kleur.join(', ') || "",
      }

      console.log("Plant data to save:", plantData)
      
      // Save to database
      const result = await createPlant(plantData)
      
      if (result) {
        setSuccess("Bloem succesvol geregistreerd!")
        
        // Reset form
        setSelectedPlantBed("")
        setSelectedFlower("")
        setStemLength("")
        setPhotoFile(null)
        setPhotoPreview(null)
        setNotes("")
        setSearchTerm("")
      } else {
        setError("Fout bij het opslaan van de bloem")
      }
      
    } catch (err) {
      console.error("Error saving plant:", err)
      setError("Fout bij het opslaan van de bloem")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/plant-beds">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
            </Link>
            <Link href="/plant-beds/popular-flowers">
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-2" />
                60 Populaire Bloemen
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <Leaf className="h-8 w-8 text-green-600" />
                Bloemen Registreren
              </h1>
              <p className="text-gray-600 mt-1">Voeg eenjarige bloemen toe aan je plantvakken</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bloemen Selectie */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                Bloemen Selectie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Zoek een bloem</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Zoek op naam..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Flower Selection */}
              <div className="space-y-2">
                <Label>Beschikbare eenjarige bloemen ({filteredFlowers.length})</Label>
                <div className="max-h-96 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {filteredFlowers.map((flower) => (
                    <div
                      key={flower.name}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedFlower === flower.name
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                      }`}
                      onClick={() => setSelectedFlower(flower.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{flower.name}</h3>
                          {flower.scientificName && (
                            <p className="text-sm text-gray-600 italic">{flower.scientificName}</p>
                          )}
                        </div>
                        {selectedFlower === flower.name && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {flower.kleur.map((kleur) => (
                          <Badge key={kleur} variant="secondary" className="text-xs">
                            {kleur}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {flower.bloeiperiode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registratie Formulier */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                Bloem Registreren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plant Bed Selection */}
                <div className="space-y-2">
                  <Label htmlFor="plantbed">Plantvak *</Label>
                  <Select value={selectedPlantBed} onValueChange={setSelectedPlantBed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een plantvak" />
                    </SelectTrigger>
                    <SelectContent>
                      {plantBeds.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          {bed.name} ({bed.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Flower Info */}
                {selectedFlowerData && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">{selectedFlowerData.name}</h4>
                    {selectedFlowerData.scientificName && (
                      <p className="text-sm text-green-700 italic">{selectedFlowerData.scientificName}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedFlowerData.kleur.map((kleur) => (
                        <Badge key={kleur} variant="secondary" className="text-xs">
                          {kleur}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {selectedFlowerData.bloeiperiode}
                    </p>
                  </div>
                )}

                {/* Stem Length */}
                <div className="space-y-2">
                  <Label htmlFor="stemLength">Steellengte (cm) *</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="stemLength"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Bijv. 15.5"
                      value={stemLength}
                      onChange={(e) => setStemLength(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Foto van de plant</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {photoPreview ? (
                      <div className="space-y-2">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoFile(null)
                            setPhotoPreview(null)
                          }}
                        >
                          Verwijder foto
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">Klik om een foto te uploaden</p>
                        <p className="text-xs text-gray-500">PNG, JPG tot 5MB</p>
                      </div>
                    )}
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('photo')?.click()}
                      className="mt-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Foto selecteren
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notities</Label>
                  <Textarea
                    id="notes"
                    placeholder="Optionele notities over de plant..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saving || !selectedPlantBed || !selectedFlower || !stemLength}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bloem Registreren
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}