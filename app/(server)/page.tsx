// SERVER COMPONENT - No "use client" directive!
// This runs on the server, not in the browser

import { Metadata } from 'next'
import { GardenGrid } from '@/components/garden/garden-grid'
import { SearchBar } from '@/components/search/search-bar'
import { getGardensWithDetails } from '@/lib/services/server/garden.service'

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
  const { gardens, totalPages, error } = await getGardensWithDetails({
    page,
    search,
    limit: 12
  })

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Er ging iets mis</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
          Mijn Tuinen
        </h1>
        <p className="text-muted-foreground">
          Beheer uw tuinen en bekijk de status van uw planten
        </p>
      </div>

      {/* Search - Client Component for interactivity */}
      <SearchBar defaultValue={search} />

      {/* Gardens Grid - Client Component for interactions */}
      <GardenGrid 
        initialGardens={gardens}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}