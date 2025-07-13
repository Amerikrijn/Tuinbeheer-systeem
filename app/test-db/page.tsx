"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TestResult {
  success: boolean
  message: string
  data?: any
}

export default function TestDatabasePage() {
  const [connectionTest, setConnectionTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [gardensTest, setGardensTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [plantBedsTest, setPlantBedsTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [plantsTest, setPlantsTest] = useState<TestResult>({ success: false, message: "Testing..." })

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      // Test 1: Basic connection
      console.log("Testing Supabase connection...")
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("API Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      setConnectionTest({ 
        success: true, 
        message: `✅ Connection configured. URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...` 
      })

      // Test 2: Gardens table
      console.log("Testing gardens table...")
      const { data: gardens, error: gardensError } = await supabase
        .from("gardens")
        .select("*")
        .limit(5)

      if (gardensError) {
        setGardensTest({ 
          success: false, 
          message: `❌ Gardens Error: ${gardensError.message}` 
        })
      } else {
        setGardensTest({ 
          success: true, 
          message: `✅ Gardens loaded: ${gardens?.length || 0} found`,
          data: gardens 
        })
      }

      // Test 3: Plant beds table
      console.log("Testing plant_beds table...")
      const { data: plantBeds, error: plantBedsError } = await supabase
        .from("plant_beds")
        .select("*")
        .limit(5)

      if (plantBedsError) {
        setPlantBedsTest({ 
          success: false, 
          message: `❌ Plant Beds Error: ${plantBedsError.message}` 
        })
      } else {
        setPlantBedsTest({ 
          success: true, 
          message: `✅ Plant beds loaded: ${plantBeds?.length || 0} found`,
          data: plantBeds 
        })
      }

      // Test 4: Plants table
      console.log("Testing plants table...")
      const { data: plants, error: plantsError } = await supabase
        .from("plants")
        .select("*")
        .limit(5)

      if (plantsError) {
        setPlantsTest({ 
          success: false, 
          message: `❌ Plants Error: ${plantsError.message}` 
        })
      } else {
        setPlantsTest({ 
          success: true, 
          message: `✅ Plants loaded: ${plants?.length || 0} found`,
          data: plants 
        })
      }

    } catch (error) {
      console.error("Database test error:", error)
      setConnectionTest({ 
        success: false, 
        message: `❌ Connection failed: ${error}` 
      })
    }
  }

  const TestCard = ({ title, result }: { title: string; result: TestResult }) => (
    <Card className={`border-2 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{result.message}</p>
        {result.data && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔍 Database Connection Test</h1>
        <p className="text-gray-600">Testing Supabase connection and data retrieval</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TestCard title="📡 Supabase Connection" result={connectionTest} />
        <TestCard title="🌳 Gardens Table" result={gardensTest} />
        <TestCard title="🌱 Plant Beds Table" result={plantBedsTest} />
        <TestCard title="🌿 Plants Table" result={plantsTest} />
      </div>

      <div className="text-center">
        <button
          onClick={testDatabaseConnection}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          🔄 Re-test Connection
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>✅ If all tests pass: Your database is working!</p>
          <p>❌ If tests fail: Check environment variables in Vercel</p>
          <p>🔧 Environment variables needed:</p>
          <ul className="list-disc ml-6 text-sm">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}