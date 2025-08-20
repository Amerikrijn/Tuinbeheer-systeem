"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getSupabaseClient } from '@/lib/supabase'
import { uiLogger } from '@/lib/logger'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PlantBed {
  id: string
  name: string
  description: string | null
  letter: string
  width: number
  height: number
  position_x: number
  position_y: number
  garden_id: string
  gardens?: {
    id: string
    name: string
  }
}

export default function EditPlantBedPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const gardenId = params.id as string
  const bedId = params.bedId as string
  
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    width: 200,
    height: 200,
    position_x: 0,
    position_y: 0
  })

  useEffect(() => {
    loadPlantBed()
  }, [bedId])

  const loadPlantBed = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('plant_beds')
        .select(`
          *,
          gardens (
            id,
            name
          )
        `)
        .eq('id', bedId)
        .single()
      
      if (error) throw error
      
      if (data) {
        setPlantBed(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          width: data.width,
          height: data.height,
          position_x: data.position_x,
          position_y: data.position_y
        })
      }
    } catch (error) {
      uiLogger.error('Error loading plant bed:', error)
      toast({
        title: "Fout",
        description: "Kon plantvak niet laden",
        variant: "destructive"
      })
      router.push(`/gardens/${gardenId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Validatiefout",
        description: "Naam is verplicht",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('plant_beds')
        .update({
          name: formData.name,
          description: formData.description || null,
          width: formData.width,
          height: formData.height,
          position_x: formData.position_x,
          position_y: formData.position_y
        })
        .eq('id', bedId)
      
      if (error) throw error
      
      toast({
        title: "Succes",
        description: "Plantvak is bijgewerkt"
      })
      
      router.push(`/gardens/${gardenId}/plantvak-view/${bedId}`)
    } catch (error) {
      uiLogger.error('Error updating plant bed:', error)
      toast({
        title: "Fout",
        description: "Kon plantvak niet bijwerken",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    
    try {
      const supabase = getSupabaseClient()
      
      // First check if there are plants in this bed
      const { data: plants } = await supabase
        .from('plants')
        .select('id')
        .eq('plant_bed_id', bedId)
        .limit(1)
      
      if (plants && plants.length > 0) {
        toast({
          title: "Kan niet verwijderen",
          description: "Dit plantvak bevat nog planten. Verwijder eerst alle planten.",
          variant: "destructive"
        })
        return
      }
      
      const { error } = await supabase
        .from('plant_beds')
        .delete()
        .eq('id', bedId)
      
      if (error) throw error
      
      toast({
        title: "Succes",
        description: "Plantvak is verwijderd"
      })
      
      router.push(`/gardens/${gardenId}`)
    } catch (error) {
      uiLogger.error('Error deleting plant bed:', error)
      toast({
        title: "Fout",
        description: "Kon plantvak niet verwijderen",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!plantBed) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plantvak niet gevonden</h1>
          <Button onClick={() => router.push(`/gardens/${gardenId}`)}>
            Terug naar tuin
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/gardens/${gardenId}/plantvak-view/${bedId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar plantvak
        </Button>
        
        <h1 className="text-3xl font-bold">Plantvak Bewerken</h1>
        {plantBed.gardens && (
          <p className="text-muted-foreground mt-2">
            {plantBed.gardens.name} - Vak {plantBed.letter}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantvak Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Bijv. Groentevak Noord"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optionele beschrijving van het plantvak"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Breedte (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 200 }))}
                  min={50}
                  max={1000}
                />
              </div>
              
              <div>
                <Label htmlFor="height">Hoogte (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 200 }))}
                  min={50}
                  max={1000}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Verwijderen
              </Button>
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/gardens/${gardenId}/plantvak-view/${bedId}`)}
                >
                  Annuleren
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Opslaan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dit verwijdert plantvak "{plantBed.name}" permanent. Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                'Verwijderen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}