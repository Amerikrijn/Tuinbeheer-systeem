"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sprout,
  Calendar,
  Users,
  BarChart3,
  Plus,
  MapPin,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  CloudRain,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function HomePage() {
  const { t } = useLanguage()
  const [weatherData] = useState({
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    condition: "partly-cloudy",
    forecast: [
      { day: "Vandaag", temp: 22, condition: "sunny" },
      { day: "Morgen", temp: 19, condition: "rainy" },
      { day: "Overmorgen", temp: 24, condition: "sunny" },
    ],
  })

  const quickStats = [
    { label: t("gardens"), value: "12", icon: MapPin, color: "text-green-600" },
    { label: t("plantBeds"), value: "48", icon: Sprout, color: "text-blue-600" },
    { label: t("plants"), value: "324", icon: Sprout, color: "text-purple-600" },
    { label: t("volunteers"), value: "28", icon: Users, color: "text-orange-600" },
  ]

  const recentActivities = [
    { action: "Nieuwe tuin toegevoegd", garden: "Stadspark Noord", time: "2 uur geleden" },
    { action: "Planten water gegeven", garden: "Gemeenschapstuin West", time: "4 uur geleden" },
    { action: "Oogst geregistreerd", garden: "Schooltuin Centrum", time: "1 dag geleden" },
  ]

  const upcomingTasks = [
    { task: "Water geven - Tomaten", garden: "Stadspark Noord", due: "Vandaag 14:00" },
    { task: "Onkruid wieden", garden: "Gemeenschapstuin West", due: "Morgen 09:00" },
    { task: "Zaden planten", garden: "Schooltuin Centrum", due: "Vrijdag 10:00" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t("gardenManagement")}</h1>
                <p className="text-sm text-gray-500">{t("welcomeBack")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                {t("profile")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("welcomeToGardenSystem")}</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("systemDescription")}</p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link href="/gardens/new">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-5 w-5 mr-2" />
                {t("addNewGarden")}
              </Button>
            </Link>
            <Link href="/gardens">
              <Button variant="outline" size="lg">
                <MapPin className="h-5 w-5 mr-2" />
                {t("viewGardens")}
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline" size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                {t("calendar")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weather Widget */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                {t("weather")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">{t("temperature")}</span>
                  </div>
                  <span className="font-semibold">{weatherData.temperature}°C</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{t("humidity")}</span>
                  </div>
                  <span className="font-semibold">{weatherData.humidity}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{t("wind")}</span>
                  </div>
                  <span className="font-semibold">{weatherData.windSpeed} km/h</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">{t("forecast")}</h4>
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        {day.condition === "sunny" ? (
                          <Sun className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <CloudRain className="h-3 w-3 text-blue-500" />
                        )}
                        <span className="font-medium">{day.temp}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                {t("recentActivities")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-4">
                    <p className="font-medium text-sm text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.garden}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Link href="/activities">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  {t("viewAllActivities")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                {t("upcomingTasks")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{task.task}</p>
                        <p className="text-sm text-gray-600">{task.garden}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.due}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  {t("viewAllTasks")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                {t("gardenManagement")}
              </CardTitle>
              <CardDescription>{t("manageGardensDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/gardens">
                <Button className="w-full">{t("manageGardens")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-blue-600" />
                {t("plantTracking")}
              </CardTitle>
              <CardDescription>{t("trackPlantsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plants">
                <Button className="w-full bg-transparent" variant="outline">
                  {t("viewPlants")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                {t("volunteerManagement")}
              </CardTitle>
              <CardDescription>{t("manageVolunteersDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/volunteers">
                <Button className="w-full bg-transparent" variant="outline">
                  {t("manageVolunteers")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
