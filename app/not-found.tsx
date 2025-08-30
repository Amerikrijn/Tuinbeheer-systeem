"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Home, ArrowLeft, Search, AlertCircle, MapPin, Settings, Eye, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <TreePine className="h-7 w-7 text-green-600 dark:text-green-400" />
            Tuinbeheer Systeem
          </h1>
          <p className="text-muted-foreground">Page Not Found</p>
        </div>
      </div>

      <Card className="border-red-200 bg-red-50 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            404 - Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300 mb-4">
            The page you're looking for doesn't exist. It may have been moved, deleted, or you entered an incorrect URL.
          </p>
          
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Debug Informatie
              </CardTitle>
              <CardContent className="pt-4">
                <p className="text-destructive mb-4">
                  Pagina niet gevonden. Controleer de URL of ga terug naar een bekende pagina.
                </p>
                
                <div className="bg-muted p-3 rounded text-sm">
                  <h3 className="font-semibold mb-2 text-primary">Common Pages:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link href="/gardens" className="flex items-center gap-2 text-primary hover:text-primary/80">
                      <TreePine className="h-4 w-4" />
                      Tuinen
                    </Link>
                    {/* Only show admin link if user has admin role */}
                    <Link href="/admin" className="flex items-center gap-2 text-primary hover:text-primary/80">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  </div>
                </div>
              </CardContent>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Quick Actions:</h3>
              <div className="space-y-2">
                <Button asChild className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Home Page
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/gardens">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Gardens
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