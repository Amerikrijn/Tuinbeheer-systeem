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
import { useAuth } from "@/hooks/use-supabase-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getUserFriendlyErrorMessage } from "@/lib/errors"
import { Skeleton } from "@/components/ui/skeleton"

interface Garden {
  id: string
  name: string
}

interface PlantBed {
  id: string
  name: string
  garden_id: string
}

interface Plant {
  id: string
  name: string
  plant_bed_id: string
}

interface NewTaskFormData {
  title: string
  description: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  garden_id: string
  plant_bed_id: string
  plant_id: string
}

function NewTaskPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [plantBeds, setPlantBeds] = React.useState<PlantBed[]>([])
  const [plants, setPlants] = React.useState<Plant[]>([])
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState<NewTaskFormData>({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    garden_id: "",
    plant_bed_id: "",
    plant_id: ""
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
          setFormData(prev => ({ ...prev, plant_bed_id: "", plant_id: "" }))
        }
      } catch (error) {
        console.error('Error loading plant beds:', error)
      }
    }

    loadPlantBeds()
  }, [formData.garden_id])

  // Load plants when plant bed changes
  React.useEffect(() => {
    if (!formData.plant_bed_id) return

    const loadPlants = async () => {
      try {
        const { data: plantsData, error } = await supabase
          .from('plants')
          .select('id, name, plant_bed_id')
          .eq('plant_bed_id', formData.plant_bed_id)
          .order('name')

        if (error) throw error

        setPlants(plantsData || [])
        // Reset plant selection if current selection is not in new list
        if (formData.plant_id && !plantsData?.find(p => p.id === formData.plant_id)) {
          setFormData(prev => ({ ...prev, plant_id: "" }))
        }
      } catch (error) {
        console.error('Error loading plants:', error)
      }
    }

    loadPlants()
  }, [formData.plant_bed_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.garden_id) {
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
        .from('tasks')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          due_date: formData.due_date || null,
          priority: formData.priority,
          garden_id: formData.garden_id,
          plant_bed_id: formData.plant_bed_id || null,
          plant_id: formData.plant_id || null,
          user_id: user?.id,
          status: 'pending'
        })

      if (error) throw error

      toast({
        title: "Taak toegevoegd",
        description: `${formData.title} is succesvol toegevoegd aan je taken`,
      })

      // Redirect to tasks overview
      router.push('/tasks')
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      setError(errorMessage)
      toast({
        title: "Fout bij toevoegen taak",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof NewTaskFormData, value: string) => {
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
            Je moet eerst een tuin aanmaken voordat je taken kunt toevoegen.
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
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar taken
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nieuwe taak toevoegen</h1>
          <p className="text-muted-foreground">Voeg een nieuwe taak toe aan je tuin</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Taakgegevens</CardTitle>
          <CardDescription>
            Vul de gegevens van je nieuwe taak in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Bijv. Water geven aan tomaten"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Beschrijf wat er moet gebeuren..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Deadline</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioriteit</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Laag</SelectItem>
                    <SelectItem value="medium">Gemiddeld</SelectItem>
                    <SelectItem value="high">Hoog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garden">Tuin</Label>
                <Select
                  value={formData.garden_id}
                  onValueChange={(value) => handleInputChange('garden_id', value)}
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
                <Label htmlFor="plant_bed">Plantvak</Label>
                <Select
                  value={formData.plant_bed_id}
                  onValueChange={(value) => handleInputChange('plant_bed_id', value)}
                  disabled={!formData.garden_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.garden_id 
                        ? "Selecteer eerst een tuin" 
                        : "Selecteer een plantvak"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle plantvakken</SelectItem>
                    {plantBeds.map((plantBed) => (
                      <SelectItem key={plantBed.id} value={plantBed.id}>
                        {plantBed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant">Plant</Label>
                <Select
                  value={formData.plant_id}
                  onValueChange={(value) => handleInputChange('plant_id', value)}
                  disabled={!formData.plant_bed_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.plant_bed_id 
                        ? "Selecteer eerst een plantvak" 
                        : "Selecteer een plant"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle planten</SelectItem>
                    {plants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    Taak toevoegen
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/tasks">Annuleren</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewTaskPage() {
  return (
    <ProtectedRoute>
      <NewTaskPageContent />
    </ProtectedRoute>
  )
}