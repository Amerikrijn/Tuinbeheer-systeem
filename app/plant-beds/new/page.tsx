"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Leaf,
  TreePine,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { getGarden, createPlantBed } from "@/lib/database"
import type { Garden } from "@/lib/supabase"

export default function NewPlantBedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { goBack } = useNavigationHistory()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")

  const gardenId = searchParams.get("garden_id")

  useEffect(() => {
    if (!gardenId) {
      setError("Geen tuin geselecteerd")
      setLoading(false)
      return
    }

    const loadGarden = async () => {
      try {
        const gardenData = await getGarden(gardenId)
        setGarden(gardenData)
      } catch (error) {
        setError("Fout bij het laden van de tuin")
      } finally {
        setLoading(false)
      }
    }

    loadGarden()
  }, [gardenId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!name.trim()) {
      setError("Plantvak naam is verplicht")
      return
    }

    if (!length || !width) {
      setError("Lengte en breedte zijn verplicht")
      return
    }

    const lengthNum = parseFloat(length)
    const widthNum = parseFloat(width)

    if (isNaN(lengthNum) || isNaN(widthNum)) {
      setError("Lengte en breedte moeten geldige getallen zijn")
      return
    }

    if (lengthNum < 0.5 || widthNum < 0.5) {
      setError("Minimale afmetingen: 0.5m × 0.5m")
      return
    }

    if (lengthNum > 50 || widthNum > 50) {
      setError("Maximale afmetingen: 50m × 50m")
      return
    }

    setSaving(true)

    try {
      const size = `${lengthNum}m × ${widthNum}m (${(lengthNum * widthNum).toFixed(1)}m²)`
      
      await createPlantBed({
        garden_id: gardenId!,
        name: name.trim(),
        size,
      })

      setSuccess("Plantvak succesvol toegevoegd!")
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/gardens/${gardenId}`)
      }, 1500)
    } catch (error) {
      setError("Fout bij het toevoegen van het plantvak")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tuin niet gevonden</h3>
          <p className="text-gray-600 mb-4">De tuin die je zoekt bestaat niet of is verwijderd.</p>
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
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-green-700">Nieuw Plantvak</h1>
              <p className="text-gray-600">Tuin: {garden.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="text-sm text-gray-500">
          <span className="text-gray-400">Tuin</span> → <span className="font-medium">Plantvak</span> → Bloem
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Plantvak Toevoegen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bijvoorbeeld: Groentevak A1"
                  required
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Lengte (m) *</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="3.0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Breedte (m) *</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="2.0"
                    required
                  />
                </div>
              </div>

              {/* Calculated Area */}
              {length && width && !isNaN(parseFloat(length)) && !isNaN(parseFloat(width)) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Leaf className="h-4 w-4" />
                    <span className="font-medium">
                      Berekende oppervlakte: {(parseFloat(length) * parseFloat(width)).toFixed(1)} m²
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? "Opslaan..." : "Opslaan"}
                </Button>
                <Link href={`/gardens/${garden.id}`}>
                  <Button type="button" variant="outline">
                    Annuleren
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
