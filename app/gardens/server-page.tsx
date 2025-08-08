/**
 * SECURE SERVER COMPONENT - GARDENS OVERZICHT
 * 
 * Dit is een voorbeeld van hoe we client components kunnen vervangen
 * met server components voor betere security en performance.
 * 
 * Security benefits:
 * - Geen client-side data exposure
 * - Server-side auth validation
 * - RLS policies enforced
 * - Geen hydration vulnerabilities
 */

import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/config-secure'
import { validateGardenAccess } from '@/lib/security/garden-access'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/error-boundary'
import { headers } from 'next/headers'

// ===========================================
// SERVER-SIDE DATA FETCHING
// ===========================================

async function getAuthenticatedUser() {
  const headersList = headers()
  const userId = headersList.get('X-User-ID')
  const userEmail = headersList.get('X-User-Email')
  
  if (!userId || !userEmail) {
    throw new Error('User not authenticated')
  }
  
  return { id: userId, email: userEmail }
}

async function getUserGardens(userId: string) {
  try {
    const config = getSupabaseConfig()
    const supabase = createClient(config.url, config.anonKey)
    
    // Server-side query with RLS enforcement
    const { data: gardens, error } = await supabase
      .from('user_gardens_view')
      .select(`
        id,
        name,
        description,
        location,
        total_area,
        garden_type,
        established_date,
        canvas_width,
        canvas_height,
        background_color,
        user_role,
        created_at,
        updated_at
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      logger.error('Failed to fetch gardens', error, {
        userId,
        code: error.code,
      })
      throw new Error('Failed to fetch gardens')
    }
    
    logger.info('Gardens fetched successfully', {
      userId,
      count: gardens?.length || 0,
    })
    
    return gardens || []
    
  } catch (error) {
    logger.error('Server-side garden fetch error', error instanceof Error ? error : undefined, {
      userId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

// ===========================================
// SERVER COMPONENTS
// ===========================================

async function GardensList({ userId }: { userId: string }) {
  const gardens = await getUserGardens(userId)
  
  if (gardens.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen tuinen</h3>
        <p className="text-gray-600 mb-6">Maak je eerste tuin aan om te beginnen met tuinbeheer.</p>
        <a
          href="/gardens/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Nieuwe tuin
        </a>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gardens.map((garden) => (
        <Card key={garden.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌱 {garden.name}
            </CardTitle>
            <CardDescription>
              {garden.description || 'Geen beschrijving'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                📍 {garden.location}
              </p>
              {garden.total_area && (
                <p className="text-sm text-gray-600">
                  📏 {garden.total_area}
                </p>
              )}
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500">
                  {garden.user_role === 'admin' ? '👑 Admin' : '👤 Gebruiker'}
                </span>
                <a
                  href={`/gardens/${garden.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Bekijken →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GardensHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mijn Tuinen</h1>
        <p className="text-gray-600 mt-2">
          Beheer je tuinen en bekijk hun voortgang
        </p>
      </div>
      <div className="flex gap-3">
        <a
          href="/gardens/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuwe Tuin
        </a>
      </div>
    </div>
  )
}

// ===========================================
// MAIN PAGE COMPONENT
// ===========================================

export default async function GardensServerPage() {
  try {
    // Server-side authentication check
    const user = await getAuthenticatedUser()
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <GardensHeader />
        
        <ErrorBoundary
          fallback={
            <div className="text-center py-12">
              <p className="text-red-600">Er is een fout opgetreden bij het laden van je tuinen.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Probeer opnieuw
              </button>
            </div>
          }
        >
          <Suspense fallback={<GardensSkeleton />}>
            <GardensList userId={user.id} />
          </Suspense>
        </ErrorBoundary>
      </div>
    )
    
  } catch (error) {
    logger.error('Gardens page error', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    
    // In production, redirect to login
    // redirect('/auth/login')
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authenticatie vereist</h1>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om je tuinen te bekijken.</p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Inloggen
          </a>
        </div>
      </div>
    )
  }
}

// ===========================================
// SKELETON COMPONENT
// ===========================================

function GardensSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ===========================================
// METADATA & SEO
// ===========================================

export const metadata = {
  title: 'Mijn Tuinen | Tuinbeheer Systeem',
  description: 'Beheer je tuinen en bekijk hun voortgang in het Tuinbeheer Systeem.',
  robots: 'noindex, nofollow', // Private content
}

// Performance optimizations
export const dynamic = 'force-dynamic' // Always server-render for fresh data
export const revalidate = 0 // No caching for user-specific data