// ✅ CORRECT: Server Component (geen "use client")
// Dit is hoe ALLE pages zouden moeten zijn voor optimale performance

import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/config'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

// ===========================================
// SERVER-SIDE DATA FETCHING
// ===========================================

async function getAuthenticatedUser() {
  const config = getSupabaseConfig()
  const supabase = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }
  
  return user
}

async function getUserGardens(userId: string) {
  const config = getSupabaseConfig()
  const supabase = createClient(config.url, config.anonKey)

  // Server-side query met RLS policies
  const { data: gardens, error } = await supabase
    .from('gardens')
    .select(`
      *,
      user_garden_access!inner(user_id)
    `)
    .or(`created_by.eq.${userId},user_garden_access.user_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching gardens:', error)
    return []
  }

  return gardens || []
}

// ===========================================
// SERVER COMPONENTS
// ===========================================

async function GardensHeader() {
  const user = await getAuthenticatedUser()
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tuinen</h1>
        <p className="text-gray-600 mt-2">
          Welkom terug, {user.email}
        </p>
      </div>
      {/* Interactive elements need Client Component wrapper */}
      <CreateGardenButton />
    </div>
  )
}

async function GardensList() {
  const user = await getAuthenticatedUser()
  const gardens = await getUserGardens(user.id)

  if (gardens.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Geen tuinen gevonden
        </h3>
        <p className="text-gray-600 mb-6">
          Begin met het aanmaken van je eerste tuin
        </p>
        <CreateGardenButton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gardens.map((garden) => (
        <GardenCard key={garden.id} garden={garden} />
      ))}
    </div>
  )
}

// Server Component voor individuele garden card
function GardenCard({ garden }: { garden: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{garden.name}</h3>
      <p className="text-gray-600 mb-4">{garden.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {garden.location}
        </span>
        {/* Interactive elements need Client Component */}
        <GardenActions gardenId={garden.id} />
      </div>
    </div>
  )
}

// Loading components
function GardensSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ===========================================
// CLIENT COMPONENTS (MINIMAL)
// ===========================================

'use client' // Only for interactive elements!

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function CreateGardenButton() {
  const router = useRouter()
  
  return (
    <button
      onClick={() => router.push('/gardens/new')}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
    >
      Nieuwe Tuin
    </button>
  )
}

function GardenActions({ gardenId }: { gardenId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze tuin wilt verwijderen?')) return
    
    setIsDeleting(true)
    // Delete logic here
    router.refresh() // Refresh server component
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.push(`/gardens/${gardenId}`)}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        Bekijken
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
      >
        {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
      </button>
    </div>
  )
}

// ===========================================
// MAIN PAGE COMPONENT (SERVER)
// ===========================================

export default async function GardensServerPage() {
  // ✅ Server Component - geen "use client" needed
  // ✅ Server-side data fetching
  // ✅ SEO-friendly
  // ✅ Smaller bundle size
  // ✅ Better performance

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading header...</div>}>
        <GardensHeader />
      </Suspense>
      
      <Suspense fallback={<GardensSkeleton />}>
        <GardensList />
      </Suspense>
    </div>
  )
}

// ===========================================
// METADATA (SERVER ONLY)
// ===========================================

export const metadata: Metadata = {
  title: 'Tuinen - Tuinbeheer Systeem',
  description: 'Beheer je tuinen en plantvakken',
}

// ===========================================
// PERFORMANCE OPTIMIZATIONS
// ===========================================

// ✅ Server Component = smaller bundle
// ✅ Server-side rendering = faster initial load
// ✅ Suspense boundaries = progressive loading
// ✅ Minimal client-side JS = better performance
// ✅ SEO-friendly = better search rankings

// ===========================================
// MIGRATION GUIDE
// ===========================================

/*
HOE EEN CLIENT COMPONENT CONVERTEREN:

1. VERWIJDER "use client" van de top
2. VERPLAATS interactieve logic naar aparte Client Components
3. GEBRUIK server-side data fetching (geen useEffect)
4. GEBRUIK Suspense voor loading states
5. GEBRUIK metadata export voor SEO

VOOR:
```tsx
"use client"
export default function Page() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  
  return <div>{data.map(...)}</div>
}
```

NA:
```tsx
async function getData() {
  const data = await fetchDataServerSide()
  return data
}

export default async function Page() {
  const data = await getData()
  
  return <div>{data.map(...)}</div>
}
```
*/