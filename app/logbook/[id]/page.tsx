"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, Camera, Leaf, MapPin, Edit, Trash2, BookOpen } from "lucide-react"
import { LogbookService } from "@/lib/services/database.service"
import { uiLogger } from "@/lib/logger"
import type { LogbookEntryWithDetails } from "@/lib/types/index"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"

interface LogbookDetailPageState {
  entry: LogbookEntryWithDetails | null
  loading: boolean
  error: string | null
  deleting: boolean
}

function LogbookDetailPageContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [state, setState] = React.useState<LogbookDetailPageState>({
    entry: null,
    loading: true,
    error: null,
    deleting: false,
  })

  // Load logbook entry
  const loadEntry = React.useCallback(async () => {
    const operationId = `loadLogbookEntry-${Date.now()}`
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await LogbookService.getById(params.id)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load logbook entry')
      }

      setState(prev => ({
        ...prev,
        entry: response.data,
        loading: false
      }))

      uiLogger.debug('Logbook entry loaded successfully', { 
        id: params.id, 
        operationId 
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      uiLogger.error('Failed to load logbook entry', error as Error, { id: params.id, operationId })
      
      toast({
        title: "Fout bij laden logboek entry",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [params.id, toast])

  // Delete logbook entry
  const handleDelete = async () => {
    if (!state.entry || !confirm('Weet je zeker dat je deze logboek entry wilt verwijderen?')) {
      return
    }

    const operationId = `deleteLogbookEntry-${Date.now()}`
    
    try {
      setState(prev => ({ ...prev, deleting: true }))
      
      const response = await LogbookService.delete(state.entry.id)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete logbook entry')
      }

      toast({
        title: "Logboek entry verwijderd",
        description: "De entry is succesvol verwijderd.",
      })

      uiLogger.info('Logbook entry deleted successfully', { 
        id: state.entry.id, 
        operationId 
      })

      router.push('/logbook')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden'
      setState(prev => ({ ...prev, deleting: false }))
      uiLogger.error('Failed to delete logbook entry', error as Error, { id: state.entry?.id, operationId })
      
      toast({
        title: "Fout bij verwijderen",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Initial load
  React.useEffect(() => {
    loadEntry()
  }, [loadEntry])

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: nl })
    } catch {
      return dateString
    }
  }

  // Format time for display
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy om HH:mm', { locale: nl })
    } catch {
      return dateString
    }
  }

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Content skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Fout bij laden logboek entry</h2>
          </div>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadEntry} variant="outline">
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

  if (!state.entry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Logboek entry niet gevonden
          </h2>
          <p className="text-gray-600 mb-6">
            De opgevraagde logboek entry bestaat niet of is verwijderd.
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
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
            Logboek Entry
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(state.entry.entry_date)}
            </div>
            <Badge variant="outline">
              {state.entry.garden_name}
            </Badge>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Entry details - wider column */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {state.entry.plant_bed_name}
                    </CardTitle>
                    {state.entry.plant_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {state.entry.plant_name}
                          {state.entry.plant_variety && ` (${state.entry.plant_variety})`}
                        </span>
                        {state.entry.plant_scientific_name && (
                          <span className="italic text-sm text-gray-500 ml-2">
                            {state.entry.plant_scientific_name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Photo - improved display */}
                {state.entry.photo_url && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Foto
                    </h3>
                    <div className="relative group">
                      <img 
                        src={state.entry.photo_url} 
                        alt="Logboek foto"
                        className="w-full max-h-[500px] object-cover rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => state.entry?.photo_url && window.open(state.entry.photo_url, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                          Klik om te vergroten
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Opmerkingen</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {state.entry.notes}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Aangemaakt:</span>
                      <br />
                      {formatDateTime(state.entry.created_at)}
                    </div>
                    {state.entry.updated_at !== state.entry.created_at && (
                      <div>
                        <span className="font-medium">Laatst bewerkt:</span>
                        <br />
                        {formatDateTime(state.entry.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - narrower column */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/logbook/${state.entry.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerken
                  </Link>
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDelete}
                  disabled={state.deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {state.deleting ? 'Verwijderen...' : 'Verwijderen'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gerelateerd</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                                  {/* SECURITY: Only show garden link for admins */}
                  {isAdmin() && (
                    <Button asChild variant="outline" className="w-full text-sm">
                      <Link href={`/gardens/${state.entry.garden_id}`}>
                        Bekijk tuin
                      </Link>
                    </Button>
                  )}
                
                <Button asChild variant="outline" className="w-full text-sm">
                  <Link href={`/logbook/new?plant_bed_id=${state.entry.plant_bed_id}`}>
                    Nieuwe entry voor dit plantvak
                  </Link>
                </Button>
                
                {state.entry.plant_id && (
                  <Button asChild variant="outline" className="w-full text-sm">
                    <Link href={`/logbook/new?plant_bed_id=${state.entry.plant_bed_id}&plant_id=${state.entry.plant_id}`}>
                      Nieuwe entry voor deze plant
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Entry Info Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Entry Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tuin:</span>
                  <p className="text-gray-600">{state.entry.garden_name}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Datum:</span>
                  <p className="text-gray-600">{formatDate(state.entry.entry_date)}</p>
                </div>
                
                {!state.entry.photo_url && (
                  <div className="text-center py-4 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    <Camera className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-xs">Geen foto</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LogbookDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <LogbookDetailPageContent params={params} />
    </ErrorBoundary>
  )
}