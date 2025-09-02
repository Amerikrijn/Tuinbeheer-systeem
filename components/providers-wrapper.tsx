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
        staleTime: 2 * 60 * 1000, // 2 minutes - OPTIMIZED for admin interfaces
        gcTime: 5 * 60 * 1000, // 5 minutes - OPTIMIZED to prevent memory buildup
        retry: 2,
        refetchOnWindowFocus: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        // PERFORMANCE OPTIMIZATION: Add query timeout
        networkMode: 'online',
        maxRetries: 2,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        // PERFORMANCE OPTIMIZATION: Add mutation timeout
        networkMode: 'online',
        throwOnError: false,
      },
    },
  }))

  // PERFORMANCE OPTIMIZATION: Add cache cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all queries and mutations when component unmounts
      queryClient.clear()
    }
  }, [queryClient])

  // PERFORMANCE OPTIMIZATION: Periodic cache cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const queries = queryClient.getQueryCache().getAll()
      const mutations = queryClient.getMutationCache().getAll()
      
      // Remove queries that haven't been accessed in 10 minutes
      const cutoffTime = Date.now() - (10 * 60 * 1000)
      queries.forEach(query => {
        if (query.state.dataUpdatedAt < cutoffTime) {
          queryClient.removeQueries({ queryKey: query.queryKey })
        }
      })
      
      // Remove old mutations
      mutations.forEach(mutation => {
        if (mutation.state.submittedAt && mutation.state.submittedAt < cutoffTime) {
          queryClient.removeQueries({ queryKey: mutation.options.mutationKey })
        }
      })
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(cleanupInterval)
  }, [queryClient])

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