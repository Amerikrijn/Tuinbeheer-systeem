'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface ProvidersWrapperProps {
  children: React.ReactNode
}

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  // Create a new QueryClient instance for each session to avoid SSR issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes - CONSERVATIVE for Supabase Free Tier
        gcTime: 30 * 60 * 1000, // 30 minutes - CONSERVATIVE to reduce database calls
        retry: 1, // Reduced retries for Free Tier
        refetchOnWindowFocus: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        // SUPABASE FREE TIER OPTIMIZATION: Conservative settings
        networkMode: 'online',
        maxRetries: 1,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        // SUPABASE FREE TIER OPTIMIZATION: Conservative settings
        networkMode: 'online',
        throwOnError: false,
      },
    },
  }))

  // SUPABASE FREE TIER OPTIMIZATION: Conservative cache management
  // Removed aggressive cache cleanup to reduce database calls

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show React Query DevTools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}