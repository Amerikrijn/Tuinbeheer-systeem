import { QueryClient } from '@tanstack/react-query'

// Create a client with optimized settings for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 1 minute
      staleTime: 60 * 1000,
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (but not if data is fresh)
      refetchOnWindowFocus: 'always',
      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: 'always',
      // Keep previous data while fetching new data
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

// Query keys for consistent caching
export const queryKeys = {
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    weekly: (weekStart: Date) => ['tasks', 'weekly', weekStart.toISOString()] as const,
    calendar: (weekStart: Date) => ['tasks', 'calendar', weekStart.toISOString()] as const,
    byPlant: (plantId: string) => ['tasks', 'plant', plantId] as const,
    byPlantBed: (plantBedId: string) => ['tasks', 'plantBed', plantBedId] as const,
    summary: ['tasks', 'summary'] as const,
  },
  
  // Gardens
  gardens: {
    all: ['gardens'] as const,
    detail: (id: string) => ['gardens', id] as const,
    withPlantBeds: (id: string) => ['gardens', id, 'plantBeds'] as const,
    accessible: (userId: string) => ['gardens', 'accessible', userId] as const,
  },
  
  // Plant beds
  plantBeds: {
    all: ['plantBeds'] as const,
    byGarden: (gardenId: string) => ['plantBeds', 'garden', gardenId] as const,
    detail: (id: string) => ['plantBeds', id] as const,
    withPlants: (id: string) => ['plantBeds', id, 'plants'] as const,
  },
  
  // Plants
  plants: {
    all: ['plants'] as const,
    byPlantBed: (plantBedId: string) => ['plants', 'plantBed', plantBedId] as const,
    detail: (id: string) => ['plants', id] as const,
  },
  
  // Logbook
  logbook: {
    all: ['logbook'] as const,
    byGarden: (gardenId: string) => ['logbook', 'garden', gardenId] as const,
    byPlantBed: (plantBedId: string) => ['logbook', 'plantBed', plantBedId] as const,
    byPlant: (plantId: string) => ['logbook', 'plant', plantId] as const,
    detail: (id: string) => ['logbook', id] as const,
  },
  
  // User
  user: {
    current: ['user', 'current'] as const,
    gardenAccess: (userId: string) => ['user', userId, 'gardenAccess'] as const,
  },
}

// Helper function to invalidate related queries
export const invalidateRelatedQueries = async (queryClient: QueryClient, type: 'task' | 'garden' | 'plantBed' | 'plant' | 'logbook') => {
  switch (type) {
    case 'task':
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      break
    case 'garden':
      await queryClient.invalidateQueries({ queryKey: queryKeys.gardens.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.plantBeds.all })
      break
    case 'plantBed':
      await queryClient.invalidateQueries({ queryKey: queryKeys.plantBeds.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.plants.all })
      break
    case 'plant':
      await queryClient.invalidateQueries({ queryKey: queryKeys.plants.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      break
    case 'logbook':
      await queryClient.invalidateQueries({ queryKey: queryKeys.logbook.all })
      break
  }
}

// Performance monitoring helper
export const logQueryPerformance = (queryKey: readonly unknown[], startTime: number) => {
  const endTime = performance.now()
  const duration = endTime - startTime
  
  if (duration > 1000) {
    console.warn(`⚠️ Slow query (${duration.toFixed(0)}ms):`, queryKey)
  } else if (process.env.NODE_ENV === 'development' && duration > 500) {
    console.log(`📊 Query performance (${duration.toFixed(0)}ms):`, queryKey)
  }
}