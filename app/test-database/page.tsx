'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react'

export default function TestDatabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      setStatus('loading')
      setMessage('Testing database connection...')
      
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        setStatus('error')
        setMessage('This test must run in the browser')
        return
      }

      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        setStatus('error')
        setMessage('Missing Supabase environment variables')
        setDetails({
          supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
          supabaseKey: supabaseKey ? 'Set' : 'Missing'
        })
        return
      }

      setMessage('Environment variables found, testing connection...')
      
      // Try to import and use Supabase
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        setMessage('Supabase client created, testing database access...')
        
        // Test basic connection
        const { data, error } = await supabase
          .from('gardens')
          .select('count')
          .limit(1)
        
        if (error) {
          throw new Error(error.message)
        }
        
        setStatus('success')
        setMessage('Database connection successful!')
        setDetails({
          supabaseUrl: supabaseUrl.substring(0, 30) + '...',
          connection: 'OK',
          timestamp: new Date().toISOString()
        })
        
      } catch (importError) {
        throw new Error(`Failed to import Supabase: ${importError}`)
      }
      
    } catch (error) {
      setStatus('error')
      setMessage(`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDetails({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-6 h-6 animate-spin" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="w-8 h-8" />
          Database Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Test de database verbinding en zie wat er beschikbaar is
        </p>
      </div>

      <Card className={getStatusColor()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon()}
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium mb-4">{message}</p>
          
          {details && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Details:</h3>
              <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-4">
            <Button 
              onClick={testDatabaseConnection}
              disabled={status === 'loading'}
              variant="outline"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Again'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}