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

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedItems.size === deletedGardens.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(deletedGardens.map(g => g.id)))
    }
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Bulk operations
  const bulkRestore = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Weet je zeker dat je ${selectedItems.size} tuin(en) wilt terughalen?`)) {
      return
    }

    setBulkLoading(true)
    try {
      const { error } = await supabase
        .from('gardens')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedItems))

      if (error) throw error

      toast({
        title: "Tuinen teruggehaald! ✅",
        description: `${selectedItems.size} tuin(en) succesvol teruggehaald`,
      })

      setDeletedGardens(prev => prev.filter(g => !selectedItems.has(g.id)))
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Bulk restore error:', error)
      toast({
        title: "Fout bij terughalen",
        description: "Kon niet alle tuinen terughalen",
        variant: "destructive"
      })
    } finally {
      setBulkLoading(false)
    }
  }

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`⚠️ PERMANENT VERWIJDEREN: Weet je zeker dat je ${selectedItems.size} tuin(en) PERMANENT wilt verwijderen? Dit kan NIET ongedaan worden gemaakt!`)) {
      return
    }

    setBulkLoading(true)
    try {
      const { error } = await supabase
        .from('gardens')
        .delete()
        .in('id', Array.from(selectedItems))

      if (error) throw error

      toast({
        title: "Permanent verwijderd ⚠️",
        description: `${selectedItems.size} tuin(en) permanent verwijderd`,
        variant: "destructive"
      })

      setDeletedGardens(prev => prev.filter(g => !selectedItems.has(g.id)))
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast({
        title: "Fout bij verwijderen",
        description: "Kon niet alle tuinen verwijderen",
        variant: "destructive"
      })
    } finally {
      setBulkLoading(false)
    }
  }

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

  const permanentDeleteGarden = async (garden: DeletedGarden) => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Prullenbak laden...</span>
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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trash2 className="w-8 h-8 text-muted-foreground" />
              Prullenbak
            </h1>
            <p className="text-muted-foreground mt-1">
              Verwijderde tuinen - {deletedGardens.length} item(s)
            </p>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {selectedItems.size} geselecteerd
            </Badge>
            <Button
              onClick={bulkRestore}
              disabled={bulkLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Terughalen ({selectedItems.size})
            </Button>
            <Button
              onClick={bulkDelete}
              disabled={bulkLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Permanent verwijderen ({selectedItems.size})
            </Button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {deletedGardens.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trash2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Prullenbak is leeg
            </h3>
            <p className="text-muted-foreground">
              Er zijn geen verwijderde tuinen om te herstellen
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Warning Notice */}
          <Card className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                    ⚠️ Verwijderde Items Beheer
                  </h3>
                  <p className="text-orange-700 dark:text-orange-400 text-sm">
                    Hier kun je verwijderde tuinen terughalen of permanent verwijderen. 
                    <strong> Permanent verwijderen kan NIET ongedaan worden gemaakt!</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table with bulk selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Verwijderde Tuinen</span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.size === deletedGardens.length && deletedGardens.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecteer alle items"
                  />
                  <span className="text-sm text-muted-foreground">Alles selecteren</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <span className="sr-only">Selecteer</span>
                    </TableHead>
                    <TableHead>Naam</TableHead>
                    <TableHead>Locatie</TableHead>
                    <TableHead>Beschrijving</TableHead>
                    <TableHead>Verwijderd op</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedGardens.map((garden) => (
                    <TableRow 
                      key={garden.id}
                      className={selectedItems.has(garden.id) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(garden.id)}
                          onCheckedChange={() => toggleSelectItem(garden.id)}
                          aria-label={`Selecteer ${garden.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <TreePine className="w-4 h-4 text-muted-foreground" />
                          {garden.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {garden.location || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {garden.description || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(garden.updated_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreGarden(garden)}
                            className="flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Terughalen
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => permanentDeleteGarden(garden)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Permanent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}