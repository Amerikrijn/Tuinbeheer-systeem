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
        // 🚀 PERFORMANCE FIX: Reduced stale time to prevent memory accumulation
        staleTime: 2 * 60 * 1000, // 2 minutes (was 5 minutes)
        // 🚀 MEMORY LEAK FIX: Faster garbage collection
        gcTime: 5 * 60 * 1000, // 5 minutes (was 10 minutes)
        retry: 2,
        // 🚀 PERFORMANCE FIX: Disable unnecessary refetches
        refetchOnWindowFocus: false,
        // 🚀 MEMORY LEAK FIX: Disable retries on mount to prevent loops
        retryOnMount: false,
        // 🚀 PERFORMANCE FIX: Disable refetching on reconnect
        refetchOnReconnect: false,
        // 🚀 NEW: Memory management for admin users
        networkMode: 'online',
        // 🚀 NEW: Prevent infinite query accumulation
        maxRetries: 2,
        // 🚀 NEW: Better error handling
        throwOnError: false,
      },
      mutations: {
        // 🚀 PERFORMANCE FIX: Disable retries for mutations
        retry: false,
        // 🚀 NEW: Better mutation error handling
        throwOnError: false,
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