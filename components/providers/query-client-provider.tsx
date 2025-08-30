'use client'

import { QueryClient, QueryClientProvider as BaseQueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface QueryClientProviderProps {
  children: React.ReactNode
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  // Create a new QueryClient instance for each session to avoid SSR issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000, // 30 minutes - increased to reduce refetches
        gcTime: 60 * 60 * 1000, // 60 minutes - keep data longer in cache
        retry: 1, // Reduced retries to prevent hanging
        refetchOnWindowFocus: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        structuralSharing: true, // Enable structural sharing for better performance
        networkMode: 'offlineFirst', // Prioritize cached data
      },
      mutations: { 
        retry: false,
        networkMode: 'offlineFirst', // Prioritize offline operations
      },
    },
  }))

  return (
    <BaseQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </BaseQueryClientProvider>
  )
}