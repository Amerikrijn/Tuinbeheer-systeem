'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    url: string
    hasKey: boolean
    error?: string
  }>({
    connected: false,
    url: 'Unknown',
    hasKey: false
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if we can access the Supabase client
      
        const url = supabase.supabaseUrl
        const hasKey = !!supabase.supabaseKey
        
        // Try a simple operation to test connection
        const { data, error } = await supabase.auth.getSession()
        
        setStatus({
          connected: !error,
          url: url || 'Unknown',
          hasKey,
          error: error?.message
        })
      } catch (error) {
        setStatus({
          connected: false,
          url: 'Error',
          hasKey: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkStatus()
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">🔧 Supabase Status</h3>
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Connection: {status.connected ? 'Connected' : 'Failed'}</span>
        </div>
        <div>URL: {status.url}</div>
        <div>API Key: {status.hasKey ? '✅ Present' : '❌ Missing'}</div>
        {status.error && (
          <div className="text-red-600">Error: {status.error}</div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        This debug component only shows in development mode.
      </div>
    </div>
  )
}