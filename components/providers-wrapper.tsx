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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 2,
        refetchOnWindowFocus: false,
        // Disable retries on the server to avoid infinite loops
        retryOnMount: false,
        // Disable refetching on window focus to improve performance
        refetchOnWindowFocus: false,
        // Disable refetching on reconnect to avoid unnecessary requests
        refetchOnReconnect: false,
      },
      mutations: {
        // Disable retries for mutations to avoid unexpected behavior
        retry: false,
      },
    },
  }))

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