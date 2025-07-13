"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Users, Calendar, Leaf, Plus, ArrowRight } from "lucide-react"

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
            Beheer je tuinen, plantvakken en planten op een professionele manier. Perfect voor gemeenschapstuinen,
            schooltuinen en vrijwilligersprojecten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gardens">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <TreePine className="h-5 w-5 mr-2" />
                Bekijk Tuinen
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/gardens/new">
              <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm">
                <Plus className="h-5 w-5 mr-2" />
                Nieuwe Tuin Toevoegen
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
              <Link href="/gardens">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Tuinen Bekijken
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
                <Users className="h-6 w-6" />
                Vrijwilligers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Coördineer vrijwilligers en beheer sessies voor onderhoud en verzorging van de tuinen.
              </p>
              <Link href="/calendar">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Kalender Bekijken
                </Button>
              </Link>
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
              <Link href="/gardens/new">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Tuin
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Kalender
                </Button>
              </Link>
              <Link href="/mobile">
                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Mobiele App
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
                  <h3 className="font-medium">Maak je eerste tuin aan</h3>
                  <p className="text-sm text-gray-600">
                    Begin met het toevoegen van een tuin met naam, locatie en afmetingen.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Voeg plantvakken toe</h3>
                  <p className="text-sm text-gray-600">
                    Verdeel je tuin in plantvakken met unieke ID's en eigenschappen.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Beheer je planten</h3>
                  <p className="text-sm text-gray-600">Voeg planten toe aan elk plantvak en houd hun groei bij.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
