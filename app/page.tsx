"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TreePine, Flower, Palette, Settings, Plus, TrendingUp, Users, Calendar } from "lucide-react"
import { ModernPageWrapper } from "@/components/modern-page-wrapper"

export default function HomePage() {
  const quickActions = [
    {
      title: "Nieuwe Tuin",
      description: "Maak een nieuwe tuin aan",
      href: "/gardens/new",
      icon: Plus,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Nieuw Plantvak",
      description: "Voeg een plantvak toe",
      href: "/plant-beds/new",
      icon: Flower,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Visual Designer",
      description: "Ontwerp je tuin visueel",
      href: "/visual-garden-demo",
      icon: Palette,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Beheer",
      description: "Systeeminstellingen",
      href: "/admin",
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ]

  const stats = [
    {
      title: "Actieve Tuinen",
      value: "12",
      change: "+2 deze maand",
      icon: TreePine,
      color: "text-green-600"
    },
    {
      title: "Plantvakken",
      value: "45",
      change: "+8 deze week",
      icon: Flower,
      color: "text-blue-600"
    },
    {
      title: "Totaal Bloemen",
      value: "234",
      change: "+15 vandaag",
      icon: Palette,
      color: "text-purple-600"
    },
    {
      title: "Gebruikers",
      value: "3",
      change: "Actief",
      icon: Users,
      color: "text-orange-600"
    }
  ]

  return (
    <ModernPageWrapper
      title="Dashboard"
      subtitle="Overzicht van je tuin beheer systeem"
      maxWidth="xl"
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Systeem Actief
          </Badge>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-1" />
            Nieuw
          </Button>
        </div>
      }
    >
      {/* Welcome Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="border-0 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Link href={action.href}>
                    <Button size="sm" variant="outline" className="w-full">
                      Start
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TreePine className="h-5 w-5" />
              Mijn Tuinen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Bekijk en beheer al je tuinen. Voeg nieuwe plantvakken toe en organiseer je bloemen collectie.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/gardens" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Bekijk Tuinen
                </Button>
              </Link>
              <Link href="/gardens/new" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Tuin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Flower className="h-5 w-5" />
              Plantvakken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Beheer je plantvakken en ontdek populaire bloemen. Organiseer je tuin op de meest efficiënte manier.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/plant-beds" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Bekijk Plantvakken
                </Button>
              </Link>
              <Link href="/plant-beds/popular-flowers" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Palette className="h-4 w-4 mr-2" />
                  Populaire Bloemen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <TrendingUp className="h-5 w-5" />
            Recente Activiteit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <TreePine className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nieuwe tuin aangemaakt</p>
                <p className="text-xs text-gray-500">Voortuin - 2 uur geleden</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Flower className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Plantvak bijgewerkt</p>
                <p className="text-xs text-gray-500">Rozen tuin - 5 uur geleden</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Palette className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Bloemen toegevoegd</p>
                <p className="text-xs text-gray-500">15 nieuwe bloemen - 1 dag geleden</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ModernPageWrapper>
  )
}
