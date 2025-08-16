'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-supabase-auth'
import { LogbookService } from '@/lib/services/database.service'

interface LogbookEntry {
  id: string
  title: string
  content: string
  createdAt: string
  gardenId?: string
  plant_bed_name?: string
  plant_name?: string
  entry_date: string
  notes: string
}

export function LogbookList() {
  const { user, getAccessibleGardens } = useAuth()
  const [entries, setEntries] = useState<LogbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLogbookEntries = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get accessible gardens for the user
        const accessibleGardens = getAccessibleGardens()
        
        // For admin users, we'll fetch all entries (empty array means access to all)
        // For regular users, we need to filter by their accessible gardens
        const filters: any = {}
        
        if (accessibleGardens.length > 0) {
          // User has specific garden access
          filters.garden_id = accessibleGardens
        }
        // If admin (empty array), no garden filter is applied (access to all)

        const response = await LogbookService.getAll(filters)
        
        if (response.error) {
          setError(response.error)
          return
        }

        if (response.data) {
          // Transform the data to match our interface
          const transformedEntries = response.data.map(entry => ({
            id: entry.id,
            title: entry.plant_name ? `${entry.plant_name} - ${entry.plant_bed_name}` : entry.plant_bed_name || 'Algemene Entry',
            content: entry.notes,
            createdAt: entry.created_at,
            gardenId: entry.garden_id,
            plant_bed_name: entry.plant_bed_name,
            plant_name: entry.plant_name,
            entry_date: entry.entry_date,
            notes: entry.notes
          }))
          
          setEntries(transformedEntries)
        }
      } catch (err) {
        setError('Er ging iets mis bij het laden van de logboek entries')
      } finally {
        setLoading(false)
      }
    }

    loadLogbookEntries()
  }, [user, getAccessibleGardens])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Fout bij laden
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recente Logboek Entries
        </h2>
        <Link href="/logbook/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Entry
          </Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Geen logboek entries gevonden
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Begin met het maken van je eerste logboek entry om bij te houden wat er gebeurt in je tuin.
              </p>
              <Link href="/logbook/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Entry Maken
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{entry.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(entry.entry_date).toLocaleDateString('nl-NL')}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                  {entry.content}
                </p>
                <div className="mt-4">
                  <Link href={`/logbook/${entry.id}`}>
                    <Button variant="outline" size="sm">
                      Bekijk Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}