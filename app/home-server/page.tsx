// SERVER COMPONENT - No "use client" directive!
// This completely avoids connection leak issues

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getGardensWithDetails } from '@/lib/services/server/garden.service'
import { GardenGridClient } from './garden-grid-client'
import { SearchBarClient } from './search-bar-client'

export default async function HomeServerPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  
  // SERVER-SIDE data fetching - NO connection leaks!
  const response = await getGardensWithDetails({
    page,
    search,
    limit: 12
  })
  
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      {/* Performance Banner */}
      <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-200">
          🚀 Server-side rendering actief - Geen connection leaks meer!
        </p>
      </div>
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
            Mijn Tuinen
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Beheer uw tuinen en bekijk de status van uw planten
          </p>
        </div>
        
        <Button asChild className="w-full sm:w-auto">
          <Link href="/gardens/new">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe tuin
          </Link>
        </Button>
      </div>

      {/* Search - Client Component for interactivity */}
      <SearchBarClient defaultValue={search} />

      {/* Error handling */}
      {response.error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            Er ging iets mis: {response.error}
          </p>
        </div>
      ) : (
        /* Gardens Grid - Client Component for interactions */
        <GardenGridClient 
          initialGardens={response.gardens}
          currentPage={response.page}
          totalPages={response.total_pages}
        />
      )}
    </div>
  )
}