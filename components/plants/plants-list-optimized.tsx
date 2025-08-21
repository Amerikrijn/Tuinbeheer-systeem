'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Droplets, Leaf, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

interface Plant {
  id: string
  name: string
  species: string
  planted_date: string
  last_watered?: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
  garden_id?: string
  plant_bed_id?: string
}

// 🚀 PERFORMANCE: Fetch function separated for React Query
async function fetchPlants(): Promise<Plant[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('plants')
    .select('id, name, species, planted_date, last_watered, health, garden_id, plant_bed_id')
    .order('planted_date', { ascending: false })
    .limit(50)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export function PlantsListOptimized() {
  // �� PERFORMANCE: Use React Query for intelligent caching
  const { 
    data: plants = [], 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['plants'],
    queryFn: fetchPlants,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h2>Plants: {plants.length}</h2>
      <Button onClick={() => refetch()}>Refresh</Button>
    </div>
  )
}
