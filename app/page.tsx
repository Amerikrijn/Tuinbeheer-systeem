"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Leaf, Plus, ArrowRight, Palette, Eye, Settings } from "lucide-react"

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
            Beheer je tuinen, plantvakken en planten op een professionele manier. 
            Met visuele tuin designer voor interactieve planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/plant-beds">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Leaf className="h-5 w-5 mr-2" />
                Plant Toevoegen
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/visual-garden-demo">
              <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm border-green-300 hover:bg-green-50">
                <Eye className="h-5 w-5 mr-2" />
                Visueel Overzicht
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TreePine className="h-6 w-6" />
                Tuinbeheer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Beheer meerdere tuinen met gedetailleerde informatie over locatie, afmetingen en kenmerken.
              </p>
              <Link href="/visual-garden-demo">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Visueel Overzicht
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Leaf className="h-6 w-6" />
                Plantvakken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Organiseer je tuinen in plantvakken met specifieke eigenschappen zoals zonligging en grondtype.
              </p>
              <Link href="/plant-beds">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Plantvakken Bekijken
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
                Interactieve visuele weergave van je tuin met drag & drop functionaliteit voor plantvakken.
              </p>
              <div className="flex gap-2">
                <Link href="/visual-garden-demo">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Designer Proberen
                  </Button>
                </Link>
                <Link href="/flower-selector-demo">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Leaf className="h-4 w-4 mr-1" />
                    Bloemennamen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Snelle Acties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/plant-beds">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Plant Toevoegen
                </Button>
              </Link>
              <Link href="/visual-garden-demo">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  Visueel Overzicht
                </Button>
              </Link>
              <Link href="/flower-selector-demo">
                <Button variant="outline" className="w-full bg-transparent">
                  <Leaf className="h-4 w-4 mr-2" />
                  Bloemennamen Database
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
                  <h3 className="font-medium">Bekijk plantvakken</h3>
                  <p className="text-sm text-gray-600">
                    Start met het bekijken van bestaande plantvakken en hun eigenschappen.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Voeg planten toe</h3>
                  <p className="text-sm text-gray-600">
                    Voeg nieuwe planten toe aan je plantvakken met specifieke eigenschappen.
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
                    Bekijk je tuin visueel en plaats plantvakken interactief met drag & drop.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Beheer je planten</h3>
                  <p className="text-sm text-gray-600">
                    Houd de groei en status van je planten bij met gedetailleerde informatie.
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
