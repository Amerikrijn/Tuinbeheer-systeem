"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Leaf, Plus, Users, MapPin, Thermometer, Sun, Cloud, CloudRain } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import Link from "next/link"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "volunteer"
}

interface WeatherData {
  temperature: number
  condition: "sunny" | "cloudy" | "rainy"
  humidity: number
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [weather, setWeather] = useState<WeatherData>({ temperature: 18, condition: "sunny", humidity: 65 })
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()

  useEffect(() => {
    // Simulate loading user data
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    } else {
      // Set default user for demo
      const defaultUser = { id: 1, email: "admin@tuin.nl", name: "Beheerder", role: "admin" as const }
      setCurrentUser(defaultUser)
      localStorage.setItem("currentUser", JSON.stringify(defaultUser))
    }
    setLoading(false)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">{t("loading", language)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">{t("garden.management", language)}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getWeatherIcon(weather.condition)}
                <span>{weather.temperature}°C</span>
                <Thermometer className="h-4 w-4" />
              </div>
              {currentUser && (
                <Badge variant="secondary">
                  {t("welcome", language)}, {currentUser.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("management.dashboard", language)}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("select.function.manage", language)}</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Garden Calendar */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/calendar">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <Badge variant="outline">Actief</Badge>
                </div>
                <CardTitle className="text-xl">{t("garden.calendar", language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t("view.calendar.as.volunteers", language)}</p>
                <Button className="w-full bg-transparent" variant="outline">
                  {t("open.garden.calendar", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Plant Bed Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/plant-beds">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <Badge variant="outline">12 vakken</Badge>
                </div>
                <CardTitle className="text-xl">{t("plant.bed.management", language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t("manage.all.plant.beds", language)}</p>
                <Button className="w-full bg-transparent" variant="outline">
                  {t("manage.plant.beds", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Add Events */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/events">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Plus className="h-8 w-8 text-purple-600" />
                  <Badge variant="outline">Nieuw</Badge>
                </div>
                <CardTitle className="text-xl">{t("add.events", language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t("create.new.sessions", language)}</p>
                <Button className="w-full bg-transparent" variant="outline">
                  {t("add.event", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-gray-600">Vrijwilligers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-gray-600">Planten</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-gray-600">Sessies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-gray-600">Tuinen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{t("quick.actions", language)}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/plant-beds/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("new.plant.bed", language)}
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Calendar className="h-4 w-4" />
                {t("new.session", language)}
              </Button>
            </Link>
            <Link href="/gardens">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <MapPin className="h-4 w-4" />
                Tuinen Beheren
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
