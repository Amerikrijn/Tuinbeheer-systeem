"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Palette, Eye, Flower } from "lucide-react"

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
            Beheer je tuinen en plantvakken op een professionele manier. 
            Met visuele tuin designer voor interactieve planning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TreePine className="h-6 w-6" />
                Tuinen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Beheer je tuinen met gedetailleerde informatie over locatie, afmetingen en kenmerken. Plantvakken zijn altijd toegankelijk via je tuinen.
              </p>
              <Link href="/gardens">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Ga naar Tuinen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Flower className="h-6 w-6" />
                60 Populaire Bloemen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Ontdek de 60 meest voorkomende bloemen voor je tuin. Zoek, filter en voeg direct toe aan je plantvakken.
              </p>
              <Link href="/plant-beds/popular-flowers">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Bekijk Bloemen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Palette className="h-6 w-6" />
                Visual Garden Designer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Interactieve visuele weergave van je tuin met drag & drop functionaliteit voor plantvakken en planten.
              </p>
              <Link href="/visual-garden-demo">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Designer Proberen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Aan de slag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Ga naar Tuinen</h3>
                  <p className="text-sm text-gray-600">
                    Start met het bekijken van je tuinen. Plantvakken zijn altijd onderdeel van een tuin.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Bekijk plantvakken</h3>
                  <p className="text-sm text-gray-600">
                    Gebruik de bekijk functie om plantvakken te openen en planten te beheren.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Gebruik Visual Garden Designer</h3>
                  <p className="text-sm text-gray-600">
                    Bekijk je tuin visueel op volledig scherm met verplaatsbare plantvakken en planten.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
