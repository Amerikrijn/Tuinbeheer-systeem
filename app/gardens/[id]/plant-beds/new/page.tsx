"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getSupabaseClient } from '@/lib/supabase'
import { TuinService } from '@/lib/services/database.service'
import { uiLogger } from '@/lib/logger'
import type { Tuin } from '@/lib/types'

export default function NewPlantBedPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const gardenId = params.id as string
  
  const [garden, setGarden] = useState<Tuin | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    width: 200,
    height: 200,
    position_x: 0,
    position_y: 0
  })

  useEffect(() => {
    loadGarden()
  }, [gardenId])

  const loadGarden = async () => {
    try {
      const result = await TuinService.getById(gardenId)
      if (result.success && result.data) {
        setGarden(result.data)
      } else {
        toast({
          title: "Fout",
          description: "Kon tuin niet laden",
          variant: "destructive"
        })
        router.push('/gardens')
      }
    } catch (error) {
      uiLogger.error('Error loading garden:', error)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het laden",
        variant: "destructive"
      })
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
      
      // Get the next letter for this garden
      const { data: existingBeds } = await supabase
        .from('plant_beds')
        .select('letter')
        .eq('garden_id', gardenId)
        .order('letter', { ascending: false })
        .limit(1)
      
      let nextLetter = 'A'
      if (existingBeds && existingBeds.length > 0) {
        const lastLetter = existingBeds[0].letter
        nextLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1)
      }
      
      const { data, error } = await supabase
        .from('plant_beds')
        .insert({
          garden_id: gardenId,
          name: formData.name,
          description: formData.description,
          letter: nextLetter,
          width: formData.width,
          height: formData.height,
          position_x: formData.position_x,
          position_y: formData.position_y
        })
        .select()
        .single()
      
      if (error) throw error
      
      toast({
        title: "Succes",
        description: "Plantvak is aangemaakt"
      })
      
      router.push(`/gardens/${gardenId}/plantvak-view/${data.id}`)
    } catch (error) {
      uiLogger.error('Error creating plant bed:', error)
      toast({
        title: "Fout",
        description: "Kon plantvak niet aanmaken",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/gardens/${gardenId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar tuin
        </Button>
        
        <h1 className="text-3xl font-bold">Nieuw Plantvak</h1>
        {garden && (
          <p className="text-muted-foreground mt-2">
            Voor tuin: {garden.name}
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/gardens/${gardenId}`)}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aanmaken...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Plantvak Aanmaken
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}