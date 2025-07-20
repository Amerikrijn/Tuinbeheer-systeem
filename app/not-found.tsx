"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Home, ArrowLeft, Search, AlertCircle, MapPin, Settings, Eye } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <TreePine className="h-7 w-7 text-green-600" />
            Tuinbeheer Systeem
          </h1>
          <p className="text-muted-foreground">Page Not Found</p>
        </div>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            404 - Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">
            The page you're looking for doesn't exist. It may have been moved, deleted, or you entered an incorrect URL.
          </p>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-800">Common Pages:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <Link href="/" className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800">
                  <Home className="h-4 w-4" />
                  Home Page
                </Link>
                <Link href="/gardens" className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800">
                  <MapPin className="h-4 w-4" />
                  Gardens
                </Link>

                <Link href="/admin" className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800">
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>

              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Quick Actions:</h3>
              <div className="space-y-2">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
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