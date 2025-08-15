"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Loader2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-supabase-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getUserFriendlyErrorMessage } from "@/lib/errors"

interface Garden {
  id: string
  name: string
}

interface PlantBed {
  id: string
  name: string
  garden_id: string
}

interface NewPlantFormData {
  name: string
  species: string
  variety: string
  planting_date: string
  garden_id: string
  plant_bed_id: string
  notes: string
}

function NewPlantPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [plantBeds, setPlantBeds] = React.useState<PlantBed[]>([])
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState<NewPlantFormData>({
    name: "",
    species: "",
    variety: "",
    planting_date: "",
    garden_id: "",
    plant_bed_id: "",
    notes: ""
  })

  // Load gardens and plant beds
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load gardens
        const { data: gardensData, error: gardensError } = await supabase
          .from('gardens')
          .select('id, name')
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .order('name')

        if (gardensError) throw gardensError

        setGardens(gardensData || [])

        // Load plant beds for the first garden if available
        if (gardensData && gardensData.length > 0) {
          const firstGardenId = gardensData[0].id
          setFormData(prev => ({ ...prev, garden_id: firstGardenId }))
          
          const { data: plantBedsData, error: plantBedsError } = await supabase
            .from('plant_beds')
            .select('id, name, garden_id')
            .eq('garden_id', firstGardenId)
            .order('name')

          if (plantBedsError) throw plantBedsError
          setPlantBeds(plantBedsData || [])
        }
      } catch (error) {
        const errorMessage = getUserFriendlyErrorMessage(error)
        setError(errorMessage)
        toast({
          title: "Fout bij laden gegevens",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user, toast])

  // Load plant beds when garden changes
  React.useEffect(() => {
    if (!formData.garden_id) return

    const loadPlantBeds = async () => {
      try {
        const { data: plantBedsData, error } = await supabase
          .from('plant_beds')
          .select('id, name, garden_id')
          .eq('garden_id', formData.garden_id)
          .order('name')

        if (error) throw error

        setPlantBeds(plantBedsData || [])
        // Reset plant bed selection if current selection is not in new list
        if (formData.plant_bed_id && !plantBedsData?.find(pb => pb.id === formData.plant_bed_id)) {
          setFormData(prev => ({ ...prev, plant_bed_id: "" }))
        }
      } catch (error) {
        console.error('Error loading plant beds:', error)
      }
    }

    loadPlantBeds()
  }, [formData.garden_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.species.trim() || !formData.garden_id || !formData.plant_bed_id) {
      toast({
        title: "Vereiste velden ontbreken",
        description: "Vul alle verplichte velden in",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const { error } = await supabase
        .from('plants')
        .insert({
          name: formData.name.trim(),
          species: formData.species.trim(),
          variety: formData.variety.trim() || null,
          planting_date: formData.planting_date || null,
          garden_id: formData.garden_id,
          plant_bed_id: formData.plant_bed_id,
          notes: formData.notes.trim() || null,
          user_id: user?.id
        })

      if (error) throw error

      toast({
        title: "Plant toegevoegd",
        description: `${formData.name} is succesvol toegevoegd aan je tuin`,
      })

      // Redirect to plants overview
      router.push('/plants')
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      setError(errorMessage)
      toast({
        title: "Fout bij toevoegen plant",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof NewPlantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Fout bij laden gegevens</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Opnieuw proberen
          </Button>
        </div>
      </div>
    )
  }

  if (gardens.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Geen tuinen gevonden</h1>
          <p className="text-muted-foreground mb-4">
            Je moet eerst een tuin aanmaken voordat je planten kunt toevoegen.
          </p>
          <Button asChild>
            <Link href="/gardens/new">
              <Plus className="h-4 w-4 mr-2" />
              Eerste tuin aanmaken
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/plants">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar planten
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nieuwe plant toevoegen</h1>
          <p className="text-muted-foreground">Voeg een nieuwe plant toe aan je tuin</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plantgegevens</CardTitle>
          <CardDescription>
            Vul de gegevens van je nieuwe plant in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Bijv. Tomaat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">Soort *</Label>
                <Input
                  id="species"
                  value={formData.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                  placeholder="Bijv. Solanum lycopersicum"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variety">Variëteit</Label>
                <Input
                  id="variety"
                  value={formData.variety}
                  onChange={(e) => handleInputChange('variety', e.target.value)}
                  placeholder="Bijv. Cherry"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planting_date">Plantdatum</Label>
                <Input
                  id="planting_date"
                  type="date"
                  value={formData.planting_date}
                  onChange={(e) => handleInputChange('planting_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garden">Tuin *</Label>
                <Select
                  value={formData.garden_id}
                  onValueChange={(value) => handleInputChange('garden_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een tuin" />
                  </SelectTrigger>
                  <SelectContent>
                    {gardens.map((garden) => (
                      <SelectItem key={garden.id} value={garden.id}>
                        {garden.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant_bed">Plantvak *</Label>
                <Select
                  value={formData.plant_bed_id}
                  onValueChange={(value) => handleInputChange('plant_bed_id', value)}
                  required
                  disabled={!formData.garden_id || plantBeds.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.garden_id 
                        ? "Selecteer eerst een tuin" 
                        : plantBeds.length === 0 
                        ? "Geen plantvakken beschikbaar" 
                        : "Selecteer een plantvak"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {plantBeds.map((plantBed) => (
                      <SelectItem key={plantBed.id} value={plantBed.id}>
                        {plantBed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notities</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Extra informatie over de plant..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Toevoegen...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Plant toevoegen
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/plants">Annuleren</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewPlantPage() {
  return (
    <ProtectedRoute>
      <NewPlantPageContent />
    </ProtectedRoute>
  )
}