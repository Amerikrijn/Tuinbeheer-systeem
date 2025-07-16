"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TreePine, Plus, Search, MapPin, Calendar, Leaf, Eye, Settings, AlertCircle, Sparkles } from "lucide-react"
import { getGardens } from "@/lib/database"
import type { Garden } from "@/lib/supabase"

export default function HomePage() {
  const [gardens, setGardens] = React.useState<Garden[]>([])
  const [loading, setLoading] = React.useState(false) // Start with false to show welcome immediately
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function loadGardens() {
      try {
        setLoading(true)
        setError(null)
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        })
        
        const dataPromise = getGardens()
        const data = await Promise.race([dataPromise, timeoutPromise])
        
        setGardens(data)
      } catch (error) {
        console.error("Failed to load gardens:", error)
        let errorMessage = "Database connection failed. Please check your Supabase configuration."
        
        if (error instanceof Error) {
          if (error.message.includes("relation") || error.message.includes("table")) {
            errorMessage = "Database tables not found. Please run the database setup script first."
          } else if (error.message.includes("timeout")) {
            errorMessage = "Database connection timeout. Please check your internet connection and try again."
          } else if (error.message.includes("authentication") || error.message.includes("auth")) {
            errorMessage = "Database authentication failed. Please check your Supabase credentials."
          } else {
            errorMessage = error.message
          }
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    // Load gardens in background
    loadGardens()
  }, [])

  const filteredGardens = gardens.filter(
    (garden) =>
      garden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (garden.location && garden.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Show error state first - this takes priority
  if (error) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <TreePine className="h-7 w-7 text-green-600" />
              Tuinbeheer Systeem
            </h1>
            <p className="text-muted-foreground">Garden Management System</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Database Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold mb-2 text-yellow-800">Troubleshooting Steps:</h3>
                <ol className="text-sm text-yellow-700 space-y-1 mb-4">
                  <li>1. Check if your Supabase project is running</li>
                  <li>2. Verify your environment variables are set correctly</li>
                  <li>3. Run the database setup script in Supabase SQL Editor</li>
                  <li>4. Check your internet connection</li>
                </ol>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Quick Start Options:</h3>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/visual-garden-demo">
                      <Eye className="mr-2 h-4 w-4" />
                      Try Visual Garden Demo
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/plant-beds">
                      <Leaf className="mr-2 h-4 w-4" />
                      View Plant Beds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <TreePine className="h-7 w-7 text-green-600" />
              Tuinbeheer Systeem
            </h1>
            <p className="text-muted-foreground">Loading your gardens...</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/gardens/new">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Tuin
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show welcome screen when no gardens and not loading
  if (gardens.length === 0) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <TreePine className="h-7 w-7 text-green-600" />
              Tuinbeheer Systeem
            </h1>
            <p className="text-muted-foreground">Welcome to your Garden Management System</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/gardens/new">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Tuin
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-6">
            <TreePine className="h-16 w-16 text-green-600 mb-4" />
            <Sparkles className="h-8 w-8 text-yellow-500 -mt-8 ml-8" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Welcome to Tuinbeheer Systeem</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Your comprehensive garden management solution. Start by adding your first garden or explore the features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                  Create Garden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first garden to start managing plant beds and plants.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/gardens/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Garden
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Visual Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Try the interactive visual garden designer.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/visual-garden-demo">
                    <Eye className="mr-2 h-4 w-4" />
                    Try Demo
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access the admin panel for system management.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <TreePine className="h-7 w-7 text-green-600" />
            Tuinbeheer Systeem
          </h1>
          <p className="text-muted-foreground">Beheer al je tuinen op één plek</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/gardens/new">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Tuin
          </Link>
        </Button>
      </div>

      {gardens.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek tuinen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredGardens.length} van {gardens.length} tuinen
          </div>
        </div>
      )}

      {gardens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TreePine className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Welkom bij Tuinbeheer Systeem</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Begin met het toevoegen van je eerste tuin om plantvakken en planten te kunnen beheren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/gardens/new">
                <Plus className="mr-2 h-4 w-4" />
                Eerste Tuin Toevoegen
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/visual-garden-demo">
                <Eye className="mr-2 h-4 w-4" />
                Try Visual Demo
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGardens.map((garden) => (
            <Card key={garden.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="line-clamp-1">{garden.name}</span>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {garden.garden_type || "Tuin"}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{garden.location}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {garden.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{garden.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {garden.total_area && (
                    <div className="flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>{garden.total_area}</span>
                    </div>
                  )}
                  {garden.established_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{new Date(garden.established_date).getFullYear()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Link href={`/gardens/${garden.id}/plantvak-view`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijk
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/gardens/${garden.id}`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Beheer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGardens.length === 0 && gardens.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Geen tuinen gevonden</h2>
          <p className="text-muted-foreground mb-6">Probeer een andere zoekterm of voeg een nieuwe tuin toe.</p>
          <Button variant="outline" onClick={() => setSearchTerm("")} className="mr-2">
            Wis zoekopdracht
          </Button>
        </div>
      )}
    </div>
  )
}
