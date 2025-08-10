"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Trash2, RotateCcw, Calendar, MapPin, TreePine, AlertTriangle, CheckCircle2 } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { TuinService } from '@/lib/services/database.service'

interface DeletedGarden {
  id: string
  name: string
  description?: string
  location?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export default function TrashPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deletedGardens, setDeletedGardens] = useState<DeletedGarden[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    loadDeletedGardens()
  }, [])

  const loadDeletedGardens = async () => {
    try {
      setLoading(true)
      
      // Debug: Check ALL gardens first
      const { data: allGardens, error: allError } = await supabase
        .from('gardens')
        .select('*')
        .order('updated_at', { ascending: false })

      console.log('🔍 DEBUG: ALL gardens in database:', allGardens?.map(g => ({
        name: g.name,
        is_active: g.is_active,
        id: g.id,
        updated_at: g.updated_at
      })))
      
      // Query for soft-deleted gardens (is_active = false)
      const { data, error } = await supabase
        .from('gardens')
        .select('*')
        .eq('is_active', false)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading deleted gardens:', error)
        toast({
          title: "Fout bij laden",
          description: "Kan verwijderde tuinen niet laden: " + error.message,
          variant: "destructive"
        })
        return
      }

      console.log('🔍 DEBUG: Deleted gardens found:', data)
      setDeletedGardens(data || [])
      
    } catch (error) {
      console.error('Unexpected error loading deleted gardens:', error)
      toast({
        title: "Onverwachte fout",
        description: "Er is iets misgegaan bij het laden van de prullenbak",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const restoreGarden = async (garden: DeletedGarden) => {
    if (!confirm(`Weet je zeker dat je "${garden.name}" wilt terughalen uit de prullenbak?`)) {
      return
    }

    try {
      // Restore garden by setting is_active back to true
      const { error } = await supabase
        .from('gardens')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', garden.id)

      if (error) {
        console.error('Error restoring garden:', error)
        toast({
          title: "Fout bij terughalen",
          description: "Kan tuin niet terughalen: " + error.message,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Tuin teruggehaald! ✅",
        description: `"${garden.name}" is succesvol teruggehaald uit de prullenbak`,
      })

      // Remove from deleted gardens list
      setDeletedGardens(prev => prev.filter(g => g.id !== garden.id))

    } catch (error) {
      console.error('Unexpected error restoring garden:', error)
      toast({
        title: "Onverwachte fout",
        description: "Er is iets misgegaan bij het terughalen",
        variant: "destructive"
      })
    }
  }

  const permanentDelete = async (garden: DeletedGarden) => {
    const confirmText = `VERWIJDER ${garden.name.toUpperCase()}`
    const userInput = prompt(
      `⚠️ WAARSCHUWING: Dit verwijdert "${garden.name}" PERMANENT uit de database!\n\n` +
      `Alle plantbedden, planten, taken en logboek entries worden ook verwijderd.\n` +
      `Dit kan NIET ongedaan worden gemaakt!\n\n` +
      `Type "${confirmText}" om te bevestigen:`
    )

    if (userInput !== confirmText) {
      if (userInput !== null) { // User didn't cancel
        toast({
          title: "Permanente verwijdering geannuleerd",
          description: "De tekst kwam niet overeen",
        })
      }
      return
    }

    try {
      // Permanently delete from database
      const { error } = await supabase
        .from('gardens')
        .delete()
        .eq('id', garden.id)

      if (error) {
        console.error('Error permanently deleting garden:', error)
        toast({
          title: "Fout bij permanent verwijderen",
          description: "Kan tuin niet permanent verwijderen: " + error.message,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Permanent verwijderd ⚠️",
        description: `"${garden.name}" is permanent verwijderd uit de database`,
        variant: "destructive"
      })

      // Remove from deleted gardens list
      setDeletedGardens(prev => prev.filter(g => g.id !== garden.id))

    } catch (error) {
      console.error('Unexpected error permanently deleting garden:', error)
      toast({
        title: "Onverwachte fout",
        description: "Er is iets misgegaan bij het permanent verwijderen",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Onbekende datum'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Prullenbak laden...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Trash2 className="w-8 h-8 text-gray-600" />
              Prullenbak
            </h1>
            <p className="text-gray-600 mt-1">
              Verwijderde tuinen - {deletedGardens.length} item(s)
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {deletedGardens.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Prullenbak is leeg
            </h3>
            <p className="text-gray-600">
              Er zijn geen verwijderde tuinen om te herstellen
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Warning Notice */}
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">
                    Let op: Soft Delete Systeem
                  </h4>
                  <p className="text-sm text-orange-800">
                    Deze tuinen zijn "soft deleted" - ze staan nog in de database maar zijn verborgen. 
                    Je kunt ze terughalen of permanent verwijderen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deleted Gardens Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deletedGardens.map((garden) => (
              <Card key={garden.id} className="border-red-200 bg-red-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                        <TreePine className="w-5 h-5 text-gray-600" />
                        {garden.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="truncate">{garden.location || 'Geen locatie'}</span>
                      </div>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      Verwijderd
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {garden.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {garden.description}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Verwijderd: {formatDate(garden.updated_at)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => restoreGarden(garden)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Terughalen
                    </Button>
                    <Button
                      onClick={() => permanentDelete(garden)}
                      variant="destructive"
                      size="sm"
                      className="px-3"
                      title="Permanent verwijderen (kan niet ongedaan worden gemaakt)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}