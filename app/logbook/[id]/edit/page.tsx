"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Save, Upload, X, Image as ImageIcon } from "lucide-react"
import { LogbookService } from "@/lib/services/database.service"
import { getPlantBeds } from "@/lib/database"
import { uploadImage, type UploadResult } from "@/lib/storage"
import type { LogbookEntryWithDetails, PlantvakWithBloemen } from "@/lib/types/index"
import { format } from "date-fns"

interface EditLogbookState {
  entry: LogbookEntryWithDetails | null
  plantBeds: PlantvakWithBloemen[]
  loading: boolean
  saving: boolean
  error: string | null
  uploadingPhoto: boolean
}

interface EditFormData {
  plant_bed_id: string
  plant_id: string | null
  entry_date: string
  notes: string
  photo_url: string | null
}

export default function EditLogbookPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [state, setState] = React.useState<EditLogbookState>({
    entry: null,
    plantBeds: [],
    loading: true,
    saving: false,
    error: null,
    uploadingPhoto: false,
  })

  const [formData, setFormData] = React.useState<EditFormData>({
    plant_bed_id: '',
    plant_id: null,
    entry_date: '',
    notes: '',
    photo_url: null,
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Load logbook entry and plant beds
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        // Load logbook entry
        const entryResponse = await LogbookService.getById(params.id as string)
        if (!entryResponse.success || !entryResponse.data) {
          throw new Error(entryResponse.error || 'Failed to load logbook entry')
        }

        const entry = entryResponse.data
        
        // Load plant beds
        const plantBeds = await getPlantBeds(entry.garden_id)

        // Set form data
        setFormData({
          plant_bed_id: entry.plant_bed_id,
          plant_id: entry.plant_id || null,
          entry_date: entry.entry_date,
          notes: entry.notes,
          photo_url: entry.photo_url || null,
        })

        setState(prev => ({
          ...prev,
          entry,
          plantBeds: plantBeds as PlantvakWithBloemen[],
          loading: false,
        }))

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }))
      }
    }

    loadData()
  }, [params.id])

  // Get plants for selected plant bed
  const availablePlants = React.useMemo(() => {
    const selectedBed = state.plantBeds.find(bed => bed.id === formData.plant_bed_id)
    return selectedBed?.plants || []
  }, [state.plantBeds, formData.plant_bed_id])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!state.entry) return

    setState(prev => ({ ...prev, saving: true }))

    try {
      const updateData = {
        plant_bed_id: formData.plant_bed_id,
        plant_id: formData.plant_id || undefined,
        entry_date: formData.entry_date,
        notes: formData.notes.trim(),
        photo_url: formData.photo_url || undefined,
      }

      const response = await LogbookService.update(state.entry.id, updateData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update logbook entry')
      }

      toast({
        title: "Logboek entry bijgewerkt",
        description: "De entry is succesvol bijgewerkt.",
      })

      router.push(`/logbook/${state.entry.id}`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update entry'
      toast({
        title: "Fout bij bijwerken",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setState(prev => ({ ...prev, saving: false }))
    }
  }

  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    // Validate file before upload
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Alleen afbeeldingen zijn toegestaan (JPEG, PNG, WebP, GIF).",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Bestand te groot",
        description: "De afbeelding mag maximaal 5MB groot zijn.",
        variant: "destructive",
      })
      return
    }

    setState(prev => ({ ...prev, uploadingPhoto: true }))

    try {
      const result: UploadResult = await uploadImage(file, 'logbook')
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload photo')
      }

      setFormData(prev => ({ ...prev, photo_url: result.url as string }))

      toast({
        title: "Foto geüpload",
        description: "De foto is succesvol geüpload.",
      })

    } catch (error) {
      // Console logging removed for banking standards.error('Photo upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo'
      toast({
        title: "Fout bij uploaden",
        description: `${errorMessage}. Controleer of de storage bucket correct is geconfigureerd.`,
        variant: "destructive",
      })
    } finally {
      setState(prev => ({ ...prev, uploadingPhoto: false }))
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoUpload(file)
    }
  }

  // Remove photo
  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo_url: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8 safe-area-px">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Logboek entry laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (state.error || !state.entry) {
    return (
      <div className="container mx-auto px-4 py-8 safe-area-px">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Entry niet gevonden
          </h2>
          <p className="text-gray-600 mb-6">
            {state.error || 'De opgevraagde logboek entry bestaat niet of is verwijderd.'}
          </p>
          <Button asChild>
            <Link href="/logbook">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar logboek
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 safe-area-px">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/logbook/${state.entry.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar entry
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Logboek Entry Bewerken
          </h1>
          <p className="text-gray-600">
            Bewerk de details van deze logboek entry
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
                <Label htmlFor="plant_bed">Plantvak *</Label>
                <Select 
                  value={formData.plant_bed_id} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      plant_bed_id: value,
                      plant_id: null // Reset plant selection when bed changes
                    }))
                  }}
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

              {/* Plant selection */}
              <div className="space-y-2">
                <Label htmlFor="plant">Plant (optioneel)</Label>
                <Select 
                  value={formData.plant_id || 'none'} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      plant_id: value === 'none' ? null : value
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een plant (optioneel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geen specifieke plant</SelectItem>
                    {availablePlants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                        {plant.variety && ` (${plant.variety})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Entry date */}
              <div className="space-y-2">
                <Label htmlFor="entry_date">Datum *</Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                  required
                />
              </div>

              {/* Photo */}
              <div className="space-y-2">
                <Label>Foto (optioneel)</Label>
                <div className="space-y-3">
                  {formData.photo_url ? (
                    <div className="relative group">
                      <img 
                        src={formData.photo_url} 
                        alt="Logboek foto"
                        className="w-full max-h-64 object-cover rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => formData.photo_url && window.open(formData.photo_url, '_blank')}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                          Klik om te vergroten
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Geen foto geselecteerd</p>
                      <p className="text-xs text-gray-500">Klik op 'Foto uploaden' om een afbeelding toe te voegen</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={state.uploadingPhoto}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {state.uploadingPhoto ? 'Uploaden...' : formData.photo_url ? 'Foto vervangen' : 'Foto uploaden'}
                    </Button>
                    {formData.photo_url && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Verwijderen
                      </Button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Opmerkingen *</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Beschrijf wat je hebt gedaan, waargenomen of wat er aandacht behoeft..."
                  rows={6}
                  required
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  disabled={state.saving || !formData.notes.trim()}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {state.saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/logbook/${state.entry.id}`}>
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