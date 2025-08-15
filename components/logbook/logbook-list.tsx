'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

interface LogbookEntry {
  id: string
  title: string
  content: string
  createdAt: string
  gardenId?: string
}

export function LogbookList() {
  const [entries, setEntries] = useState<LogbookEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implementeer echte data fetching
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
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
                  {new Date(entry.createdAt).toLocaleDateString('nl-NL')}
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