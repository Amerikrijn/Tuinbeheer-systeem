// SERVER COMPONENT TEST - No "use client" directive!
// This is a test page to verify server components work

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Server Component Test',
  description: 'Testing server-side rendering',
}

// Simple server component that fetches data server-side
export default async function ServerTestPage() {
  // This runs on the server
  const timestamp = new Date().toISOString()
  
  // Test fetching from Supabase using existing setup
  let testResult = 'Not tested'
  
  try {
    // Import the EXISTING working Supabase client
    const { supabase } = await import('@/lib/supabase')
    
    // Simple test query
    const { data, error } = await supabase
      .from('gardens')
      .select('id, name')
      .limit(1)
    
    if (error) {
      testResult = `Error: ${error.message}`
    } else if (data && data.length > 0) {
      testResult = `Success! Found garden: ${data[0].name}`
    } else {
      testResult = 'No gardens found'
    }
  } catch (e) {
    testResult = `Exception: ${e}`
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Server Component Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p className="font-semibold">Server Time:</p>
          <p>{timestamp}</p>
        </div>
        
        <div className="p-4 bg-blue-100 rounded">
          <p className="font-semibold">Database Test:</p>
          <p>{testResult}</p>
        </div>
        
        <div className="p-4 bg-green-100 rounded">
          <p className="font-semibold">Rendering Location:</p>
          <p>This page was rendered on the SERVER</p>
          <p className="text-sm text-gray-600 mt-2">
            View page source to see the data is already in the HTML
          </p>
        </div>
      </div>
    </div>
  )
}