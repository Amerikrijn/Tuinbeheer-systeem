"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Camera, Upload, X, Loader2 } from "lucide-react"
import { LogbookService } from "@/lib/services/database.service"
import { getPlantBeds, getPlantBed } from "@/lib/database"
import { uiLogger } from "@/lib/logger"
import type { LogbookEntryFormData, Plantvak, Bloem } from "@/lib/types/index"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface NewLogbookPageState {
  plantBeds: Plantvak[]
  plants: Bloem[]
  loading: boolean
  submitting: boolean
  error: string | null
  formData: LogbookEntryFormData
  photoPreview: string | null
}

function NewLogbookPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [state, setState] = React.useState<NewLogbookPageState>({
    plantBeds: [],
    plants: [],
    loading: true,
    submitting: false,
    error: null,
    formData: {
      plant_bed_id: searchParams.get('plant_bed_id') || '',
      plant_id: searchParams.get('plant_id') || '',
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
    photoPreview: null,
  })

  // Load plant beds and plants
  const loadData = React.useCallback(async () => {
    const operationId = `loadNewLogbookData-${Date.now()}`
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Load plant beds
      const plantBedsResponse = await getPlantBeds()
      if (!plantBedsResponse.success) {
        throw new Error(plantBedsResponse.error || 'Failed to load plant beds')
      }

      // Load plants if a plant bed is selected
      let plants: Bloem[] = []
      if (state.formData.plant_bed_id) {
        const plantBedWithPlants = await getPlantBed(state.formData.plant_bed_id)
        if (plantBedWithPlants && plantBedWithPlants.plants) {
          plants = plantBedWithPlants.plants
        }
      }

      setState(prev => ({
        ...prev,
        plantBeds: plantBedsResponse.data || [],
        plants,
        loading: false
      }))

      uiLogger.debug('New logbook data loaded successfully', { 
        plantBedsCount: plantBedsResponse.data?.length || 0,
        plantsCount: plants.length,
        operationId 
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      uiLogger.error('Failed to load new logbook data', error as Error, { operationId })
      
      toast({
        title: "Fout bij laden gegevens",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [state.formData.plant_bed_id, toast])

  // Load plants when plant bed changes
  const loadPlantsForBed = React.useCallback(async (plantBedId: string) => {
    if (!plantBedId) {
      setState(prev => ({ ...prev, plants: [] }))
      return
    }

    try {
      const plantBedWithPlants = await getPlantBed(plantBedId)
      if (plantBedWithPlants && plantBedWithPlants.plants) {
        setState(prev => ({ ...prev, plants: plantBedWithPlants.plants }))
      }
    } catch (error) {
      uiLogger.error('Failed to load plants for bed', error as Error, { plantBedId })
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    loadData()
  }, [])

  // Load plants when plant bed ID changes
  React.useEffect(() => {
    if (state.formData.plant_bed_id) {
      loadPlantsForBed(state.formData.plant_bed_id)
    }
  }, [state.formData.plant_bed_id, loadPlantsForBed])

  // Handle form field changes
  const handleFieldChange = (field: keyof LogbookEntryFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      }
    }))

    // Reset plant selection when plant bed changes
    if (field === 'plant_bed_id') {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          plant_id: ''
        }
      }))
    }
  }

  // Handle photo upload
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Alleen afbeeldingen zijn toegestaan.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "De afbeelding mag maximaal 5MB groot zijn.",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          photo: file
        },
        photoPreview: e.target?.result as string
      }))
    }
    reader.readAsDataURL(file)
  }

  // Remove photo
  const removePhoto = () => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        photo: undefined
      },
      photoPreview: null
    }))
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    const operationId = `createLogbookEntry-${Date.now()}`
    
    try {
      setState(prev => ({ ...prev, submitting: true }))
      
      // Validate required fields
      if (!state.formData.plant_bed_id) {
        throw new Error('Selecteer een plantvak')
      }
      if (!state.formData.notes.trim()) {
        throw new Error('Voer opmerkingen in')
      }
      if (!state.formData.entry_date) {
        throw new Error('Selecteer een datum')
      }

      const response = await LogbookService.create(state.formData)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create logbook entry')
      }

      // TODO: Handle photo upload if present
      // For now, we'll implement this in the photo upload todo

      toast({
        title: "Logboek entry aangemaakt",
        description: "De entry is succesvol toegevoegd aan het logboek.",
      })

      uiLogger.info('Logbook entry created successfully', { 
        id: response.data.id,
        operationId 
      })

      router.push(`/logbook/${response.data.id}`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden'
      setState(prev => ({ ...prev, submitting: false }))
      uiLogger.error('Failed to create logbook entry', error as Error, { formData: state.formData, operationId })
      
      toast({
        title: "Fout bij aanmaken entry",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Get selected plant bed name
  const selectedPlantBed = state.plantBeds.find(bed => bed.id === state.formData.plant_bed_id)
  const selectedPlant = state.plants.find(plant => plant.id === state.formData.plant_id)

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <Card>
            <CardHeader>
              <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-red-600 mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Fout bij laden gegevens</h2>
          </div>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadData} variant="outline">
              Opnieuw proberen
            </Button>
            <Button asChild variant="ghost">
              <Link href="/logbook">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar logboek
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/logbook">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar logboek
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nieuwe Logboek Entry
          </h1>
          <p className="text-gray-600">
            Voeg een nieuwe entry toe aan het logboek voor je tuin.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plant bed selection */}
              <div className="space-y-2">
                <Label htmlFor="plant_bed_id">
                  Plantvak <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={state.formData.plant_bed_id} 
                  onValueChange={(value) => handleFieldChange('plant_bed_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een plantvak" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.plantBeds.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        {bed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Plant selection (optional) */}
              {state.formData.plant_bed_id && state.plants.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="plant_id">Plant (optioneel)</Label>
                  <Select 
                    value={state.formData.plant_id || ''} 
                    onValueChange={(value) => handleFieldChange('plant_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een plant (optioneel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Geen specifieke plant</SelectItem>
                      {state.plants.map((plant) => (
                        <SelectItem key={plant.id} value={plant.id}>
                          {plant.name}
                          {plant.variety && ` (${plant.variety})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="entry_date">
                  Datum <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={state.formData.entry_date}
                  onChange={(e) => handleFieldChange('entry_date', e.target.value)}
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Opmerkingen <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Beschrijf wat je hebt waargenomen, gedaan of opgemerkt..."
                  value={state.formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500">
                  {state.formData.notes.length} karakters
                </p>
              </div>

              {/* Photo upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Foto (optioneel)</Label>
                
                {state.photoPreview ? (
                  <div className="relative">
                    <img 
                      src={state.photoPreview} 
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Klik om een foto toe te voegen
                    </p>
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
                      onClick={() => document.getElementById('photo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Foto selecteren
                    </Button>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Ondersteunde formaten: JPG, PNG, GIF. Maximaal 5MB.
                </p>
              </div>

              {/* Preview */}
              {selectedPlantBed && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Plantvak:</strong> {selectedPlantBed.name}</p>
                    {selectedPlant && (
                      <p><strong>Plant:</strong> {selectedPlant.name}
                        {selectedPlant.variety && ` (${selectedPlant.variety})`}
                      </p>
                    )}
                    <p><strong>Datum:</strong> {state.formData.entry_date}</p>
                    {state.formData.notes && (
                      <p><strong>Opmerkingen:</strong> {state.formData.notes.substring(0, 100)}
                        {state.formData.notes.length > 100 && '...'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={state.submitting || !state.formData.plant_bed_id || !state.formData.notes.trim()}
                  className="flex-1"
                >
                  {state.submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    'Entry opslaan'
                  )}
                </Button>
                
                <Button asChild type="button" variant="outline">
                  <Link href="/logbook">
                    Annuleren
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewLogbookPage() {
  return (
    <ErrorBoundary>
      <NewLogbookPageContent />
    </ErrorBoundary>
  )
}