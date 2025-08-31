// SERVER COMPONENT - No "use client" directive!
// This runs on the server, not in the browser

import { Metadata } from 'next'
import Link from 'next/link'
import { GardenGrid } from '@/components/garden/garden-grid'
import { SearchBar } from '@/components/search/search-bar'
import { getGardensWithDetails } from '@/lib/services/server/garden.service'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tuinbeheer Systeem - Dashboard',
  description: 'Beheer uw tuinen en planten',
}

// This is now a SERVER component - data fetching happens on server
export default async function HomePage({
  searchParams
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  
  // SERVER-SIDE data fetching - no client-side loading states needed
  const response = await getGardensWithDetails({
    page,
    search,
    limit: 12
  })

  if (response.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-200 font-semibold">Er ging iets mis</h2>
          <p className="text-red-600 dark:text-red-300">{response.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
            Mijn Tuinen
          </h1>
          <p className="text-muted-foreground">
            Beheer uw tuinen en bekijk de status van uw planten
          </p>
        </div>
        
        <Button asChild>
          <Link href="/gardens/new">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe tuin
          </Link>
        </Button>
      </div>

      {/* Search - Client Component for interactivity */}
      <SearchBar defaultValue={search} />

      {/* Gardens Grid - Client Component for interactions */}
      <GardenGrid 
        initialGardens={response.gardens}
        currentPage={response.page}
        totalPages={response.total_pages}
      />
    </div>
  )
}