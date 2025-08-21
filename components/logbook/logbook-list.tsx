'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

interface LogbookEntry {
  id: string
  content: string
  created_at: string
  garden_id?: string
  updated_at: string
}

export function LogbookList() {
  const [entries, setEntries] = useState<LogbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // 🚀 PERFORMANCE: Memoized data fetching function
  const fetchLogbookEntries = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      setError(null)
      
      const supabase = getSupabaseClient()
      
      // 🚀 PERFORMANCE: Optimized query with pagination and sorting
      const { data, error: fetchError } = await supabase
        .from('logbook_entries')
        .select('id, content, created_at, garden_id, updated_at')
        .order('created_at', { ascending: false })
        .limit(20) // Limit for better performance
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      setEntries(data || [])
      
    } catch (err) {
      console.error('❌ ERROR: Failed to fetch logbook entries:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het laden van de logboek entries')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // 🚀 PERFORMANCE: Load data on mount
  useEffect(() => {
    fetchLogbookEntries()
  }, [fetchLogbookEntries])

  // 🚀 PERFORMANCE: Skeleton loading for better perceived performance
  const LogbookSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
            <div className="mt-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // 🚀 PERFORMANCE: Refresh function
  const handleRefresh = () => {
    fetchLogbookEntries(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recente Logboek Entries
          </h2>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Entry
          </Button>
        </div>
        <LogbookSkeleton />
      </div>
    )
  }

  if (error) {
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
              <Button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                Opnieuw proberen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recente Logboek Entries
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
          </Button>
          <Link href="/logbook/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Entry
            </Button>
          </Link>
        </div>
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
                <CardTitle className="text-lg">
                  {entry.content.substring(0, 50)}{entry.content.length > 50 ? '...' : ''}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(entry.created_at).toLocaleDateString('nl-NL')}
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