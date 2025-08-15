"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, BookOpen, Calendar, MapPin, Leaf, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-supabase-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getUserFriendlyErrorMessage } from "@/lib/errors"

interface LogbookEntry {
  id: string
  title: string
  content: string
  entry_date: string
  garden_id: string
  plant_bed_id?: string
  plant_id?: string
  created_at: string
  updated_at: string
  gardens?: {
    id: string
    name: string
  }
  plant_beds?: {
    id: string
    name: string
  }
  plants?: {
    id: string
    name: string
  }
}

interface LogbookPageState {
  entries: LogbookEntry[]
  loading: boolean
  error: string | null
}

function LogbookPageContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [state, setState] = React.useState<LogbookPageState>({
    entries: [],
    loading: true,
    error: null,
  })

  const loadEntries = React.useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data: entries, error } = await supabase
        .from('logbook_entries')
        .select(`
          *,
          gardens:garden_id(id, name),
          plant_beds:plant_bed_id(id, name),
          plants:plant_id(id, name)
        `)
        .eq('user_id', user?.id)
        .order('entry_date', { ascending: false })
      
      if (error) throw error

      setState(prev => ({
        ...prev,
        entries: entries || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast({
        title: "Fout bij laden logboek",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [user?.id, toast])

  React.useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user, loadEntries])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Logboek</h1>
            <p className="text-muted-foreground">Bekijk je tuinnotities en observaties</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Fout bij laden logboek</h1>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <Button onClick={loadEntries} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Opnieuw proberen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Logboek</h1>
          <p className="text-muted-foreground">Bekijk je tuinnotities en observaties</p>
        </div>
        <Button asChild>
          <Link href="/logbook/new">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe entry
          </Link>
        </Button>
      </div>

      {state.entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen logboek entries gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Je hebt nog geen logboek entries aangemaakt. Begin met het bijhouden van je tuinobservaties.
            </p>
            <Button asChild>
              <Link href="/logbook/new">
                <Plus className="h-4 w-4 mr-2" />
                Eerste entry aanmaken
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-3">
                  {truncateContent(entry.content)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(entry.entry_date)}</span>
                  </div>

                  {entry.gardens && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{entry.gardens.name}</span>
                    </div>
                  )}

                  {entry.plant_beds && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      <span>Plantvak: {entry.plant_beds.name}</span>
                    </div>
                  )}

                  {entry.plants && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      <span>Plant: {entry.plants.name}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/logbook/${entry.id}`}>
                        Bekijken
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/logbook/${entry.id}/edit`}>
                        Bewerken
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LogbookPage() {
  return (
    <ProtectedRoute>
      <LogbookPageContent />
    </ProtectedRoute>
  )
}