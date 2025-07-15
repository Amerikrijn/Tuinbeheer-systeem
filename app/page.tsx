"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <TreePine className="h-20 w-20 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Tuinbeheer Systeem
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Beheer je tuinen, plantvakken en bloemen op een eenvoudige manier.
          </p>
        </div>

        {/* Main Navigation */}
        <div className="flex justify-center">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 justify-center">
                <TreePine className="h-6 w-6" />
                Mijn Tuinen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Bekijk en beheer je tuinen. Voeg plantvakken toe en selecteer bloemen.
              </p>
              <Link href="/gardens">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                  Ga naar Tuinen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Instructions */}
        <div className="text-center text-gray-500 text-sm">
          <p>Navigatie: Tuin → Plantvak → Bloem</p>
        </div>
      </div>
    </div>
  )
}
