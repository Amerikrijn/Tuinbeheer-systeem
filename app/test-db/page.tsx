"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: any
  details?: string
}

export default function TestDatabasePage() {
  const [connectionTest, setConnectionTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [authTest, setAuthTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [gardensTest, setGardensTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [plantBedsTest, setPlantBedsTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [plantsTest, setPlantsTest] = useState<TestResult>({ success: false, message: "Testing..." })
  const [rawQueryTest, setRawQueryTest] = useState<TestResult>({ success: false, message: "Testing..." })

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      console.log("=== STARTING DATABASE TESTS ===")

      // Test 1: Environment Variables
      console.log("1. Testing environment variables...")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log("Supabase URL:", supabaseUrl)
      console.log("API Key length:", supabaseKey?.length)
      console.log("API Key starts with:", supabaseKey?.substring(0, 20))

      if (!supabaseUrl || !supabaseKey) {
        setConnectionTest({ 
          success: false, 
          message: `❌ Missing environment variables`,
          details: `URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`
        })
        return
      }

      if (!supabaseUrl.startsWith('https://')) {
        setConnectionTest({ 
          success: false, 
          message: `❌ Invalid Supabase URL format`,
          details: `URL should start with https://`
        })
        return
      }

      setConnectionTest({ 
        success: true, 
        message: `✅ Environment variables OK`,
        details: `URL: ${supabaseUrl.substring(0, 50)}..., Key: ${supabaseKey.length} chars`
      })

      // Test 2: Basic Auth Test
      console.log("2. Testing basic authentication...")
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        console.log("Auth test result:", { authData, authError })
        
        setAuthTest({ 
          success: true, 
          message: `✅ Auth system responding`,
          details: `Session state: ${authData?.session ? 'Active' : 'Anonymous'}`,
          data: authData
        })
      } catch (authErr) {
        console.error("Auth test failed:", authErr)
        setAuthTest({ 
          success: false, 
          message: `❌ Auth test failed`,
          error: authErr,
          details: String(authErr)
        })
      }

      // Test 3: Raw SQL Query
      console.log("3. Testing raw SQL query...")
      try {
        const { data: sqlData, error: sqlError } = await supabase
          .rpc('version')
        
        console.log("SQL test result:", { sqlData, sqlError })
        
        if (sqlError) {
          setRawQueryTest({ 
            success: false, 
            message: `❌ SQL query failed: ${sqlError.message}`,
            error: sqlError,
            details: `Code: ${sqlError.code}, Details: ${sqlError.details}`
          })
        } else {
          setRawQueryTest({ 
            success: true, 
            message: `✅ SQL queries working`,
            data: sqlData,
            details: `PostgreSQL version info available`
          })
        }
      } catch (sqlErr) {
        console.error("SQL test failed:", sqlErr)
        setRawQueryTest({ 
          success: false, 
          message: `❌ SQL connection failed`,
          error: sqlErr,
          details: String(sqlErr)
        })
      }

      // Test 4: Gardens table
      console.log("4. Testing gardens table...")
      try {
        const { data: gardens, error: gardensError, count } = await supabase
          .from("gardens")
          .select("*", { count: 'exact' })
          .limit(5)

        console.log("Gardens test result:", { gardens, gardensError, count })

        if (gardensError) {
          setGardensTest({ 
            success: false, 
            message: `❌ Gardens Error: ${gardensError.message}`,
            error: gardensError,
            details: `Code: ${gardensError.code}, Details: ${gardensError.details || 'No additional details'}`
          })
        } else {
          setGardensTest({ 
            success: true, 
            message: `✅ Gardens table: ${count || gardens?.length || 0} records`,
            data: gardens,
            details: `First garden: ${gardens?.[0]?.name || 'No gardens found'}`
          })
        }
      } catch (gardensErr) {
        console.error("Gardens test failed:", gardensErr)
        setGardensTest({ 
          success: false, 
          message: `❌ Gardens table error`,
          error: gardensErr,
          details: String(gardensErr)
        })
      }

      // Test 5: Plant beds table
      console.log("5. Testing plant_beds table...")
      try {
        const { data: plantBeds, error: plantBedsError, count } = await supabase
          .from("plant_beds")
          .select("*", { count: 'exact' })
          .limit(5)

        console.log("Plant beds test result:", { plantBeds, plantBedsError, count })

        if (plantBedsError) {
          setPlantBedsTest({ 
            success: false, 
            message: `❌ Plant Beds Error: ${plantBedsError.message}`,
            error: plantBedsError,
            details: `Code: ${plantBedsError.code}, Details: ${plantBedsError.details || 'No additional details'}`
          })
        } else {
          setPlantBedsTest({ 
            success: true, 
            message: `✅ Plant beds table: ${count || plantBeds?.length || 0} records`,
            data: plantBeds,
            details: `First bed: ${plantBeds?.[0]?.name || 'No plant beds found'}`
          })
        }
      } catch (plantBedsErr) {
        console.error("Plant beds test failed:", plantBedsErr)
        setPlantBedsTest({ 
          success: false, 
          message: `❌ Plant beds table error`,
          error: plantBedsErr,
          details: String(plantBedsErr)
        })
      }

      // Test 6: Plants table
      console.log("6. Testing plants table...")
      try {
        const { data: plants, error: plantsError, count } = await supabase
          .from("plants")
          .select("*", { count: 'exact' })
          .limit(5)

        console.log("Plants test result:", { plants, plantsError, count })

        if (plantsError) {
          setPlantsTest({ 
            success: false, 
            message: `❌ Plants Error: ${plantsError.message}`,
            error: plantsError,
            details: `Code: ${plantsError.code}, Details: ${plantsError.details || 'No additional details'}`
          })
        } else {
          setPlantsTest({ 
            success: true, 
            message: `✅ Plants table: ${count || plants?.length || 0} records`,
            data: plants,
            details: `First plant: ${plants?.[0]?.name || 'No plants found'}`
          })
        }
      } catch (plantsErr) {
        console.error("Plants test failed:", plantsErr)
        setPlantsTest({ 
          success: false, 
          message: `❌ Plants table error`,
          error: plantsErr,
          details: String(plantsErr)
        })
      }

      console.log("=== DATABASE TESTS COMPLETE ===")

    } catch (error) {
      console.error("Overall database test error:", error)
      setConnectionTest({ 
        success: false, 
        message: `❌ Connection failed: ${error}`,
        error: error,
        details: String(error)
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
        {result.details && (
          <p className="text-xs text-gray-600 mb-2">
            <strong>Details:</strong> {result.details}
          </p>
        )}
        {result.error && (
          <div className="text-xs bg-red-100 p-2 rounded mb-2">
            <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
          </div>
        )}
        {result.data && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )

  const allTestsPassed = [connectionTest, authTest, gardensTest, plantBedsTest, plantsTest].every(test => test.success)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔍 Uitgebreide Database Test</h1>
        <p className="text-gray-600">Gedetailleerde Supabase connectie diagnose</p>
        <div className={`inline-block px-4 py-2 rounded-lg mt-2 ${allTestsPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {allTestsPassed ? '✅ Alle tests geslaagd!' : '❌ Enkele tests gefaald'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TestCard title="� Environment Variables" result={connectionTest} />
        <TestCard title="🔐 Authentication" result={authTest} />
        <TestCard title="📊 Raw SQL Query" result={rawQueryTest} />
        <TestCard title="🌳 Gardens Table" result={gardensTest} />
        <TestCard title="🌱 Plant Beds Table" result={plantBedsTest} />
        <TestCard title="🌿 Plants Table" result={plantsTest} />
      </div>

      <div className="text-center">
        <button
          onClick={testDatabaseConnection}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mr-4"
        >
          🔄 Opnieuw Testen
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          🔃 Pagina Verversen
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <p><strong>❌ Als Environment Variables falen:</strong></p>
            <ul className="list-disc ml-6">
              <li>Check Vercel Dashboard → Settings → Environment Variables</li>
              <li>Zorg dat beide variabelen zijn ingesteld</li>
              <li>Re-deploy na het toevoegen van variabelen</li>
            </ul>
            
            <p className="mt-4"><strong>❌ Als Authentication faalt:</strong></p>
            <ul className="list-disc ml-6">
              <li>Check je Supabase API key (moet anon key zijn, niet service key)</li>
              <li>Controleer of de URL correct is</li>
            </ul>
            
            <p className="mt-4"><strong>❌ Als Tables falen:</strong></p>
            <ul className="list-disc ml-6">
              <li>Run de database setup script opnieuw in Supabase SQL Editor</li>
              <li>Check of Row Level Security is uitgeschakeld voor development</li>
              <li>Controleer of de tabellen bestaan in Supabase dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
{`Environment:
- Node Environment: ${process.env.NODE_ENV}
- Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
- API Key Length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0} characters
- Timestamp: ${new Date().toISOString()}
- User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}
`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}