"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Leaf, Plus, Thermometer, Eye, Flower, Sparkles, TreePine } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { ResponsiveHeader } from "@/components/responsive-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { t } from "@/lib/translations"
import { getCurrentWeather, getWeatherTheme } from "@/lib/weather-service"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "volunteer"
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentWeather, setCurrentWeather] = useState<any>(null)
  const [weatherTheme, setWeatherTheme] = useState(getWeatherTheme("sunny"))
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { language } = useLanguage()

  useEffect(() => {
    const bootstrap = async () => {
      const userData = localStorage.getItem("currentUser")
      if (!userData) {
        router.push("/login")
        return
      }

      const user = JSON.parse(userData)
      if (user.role !== "admin") {
        router.push("/")
        return
      }

      setCurrentUser(user)

      const weather = await getCurrentWeather()
      setCurrentWeather(weather)
      setWeatherTheme(getWeatherTheme(weather.condition))

      setLoading(false)
    }

    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-green-50 to-blue-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">{t("loading", language)}</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-green-50 to-blue-50 relative overflow-hidden pb-20 md:pb-0">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-pink-200 opacity-10">
          <Flower className="h-32 w-32 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-green-200 opacity-10">
          <TreePine className="h-40 w-40 animate-bounce" />
        </div>
        <div className="absolute bottom-40 left-40 text-blue-200 opacity-10">
          <Sparkles className="h-24 w-24 animate-spin" />
        </div>
        <div className="absolute bottom-20 right-40 text-purple-200 opacity-10">
          <Leaf className="h-36 w-36 animate-pulse" />
        </div>
      </div>

      <ResponsiveHeader
        title={t("garden.management", language)}
        subtitle={`${t("welcome", language)}, ${currentUser.name}!`}
        currentUser={currentUser}
        currentWeather={currentWeather}
        weatherIcon={currentWeather ? <Thermometer className="h-4 w-4" /> : null}
        className="bg-gradient-to-r from-green-500 via-green-600 to-blue-600"
        showAdminButton={false}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        {/* Welcome Message */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            {t("management.dashboard", language)}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            {t("select.function.manage", language)}
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid gap-6 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Garden Calendar */}
          <Card className="hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm cursor-pointer group overflow-hidden transform hover:scale-105">
            <Link href="/">
              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 opacity-75" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10">
                  {t("garden.calendar", language)}
                </h3>
                <p className="text-blue-100 text-sm relative z-10">{t("view.calendar.as.volunteers", language)}</p>
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                    {t("view.manage.sessions", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                    {t("track.update.tasks", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                    {t("view.photos.progress", language)}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg shadow-lg transform transition-all duration-200 group-hover:scale-105">
                  {t("open.garden.calendar", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Plant Bed Management */}
          <Card className="hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm cursor-pointer group overflow-hidden transform hover:scale-105">
            <Link href="/admin/plant-beds">
              <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                    <Leaf className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <TreePine className="h-5 w-5 sm:h-6 sm:w-6 opacity-75" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10">
                  {t("plant.bed.management", language)}
                </h3>
                <p className="text-green-100 text-sm relative z-10">{t("manage.all.plant.beds", language)}</p>
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    {t("plant.beds.overview", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    {t("add.manage.plants", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    {t("track.growth.status", language)}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 sm:py-3 rounded-lg shadow-lg transform transition-all duration-200 group-hover:scale-105">
                  {t("manage.plant.beds", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Add Events */}
          <Card className="hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm cursor-pointer group overflow-hidden transform hover:scale-105 md:col-span-2 lg:col-span-1">
            <Link href="/admin/events">
              <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 opacity-75" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10">
                  {t("add.events", language)}
                </h3>
                <p className="text-purple-100 text-sm relative z-10">{t("create.new.sessions", language)}</p>
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
                    {t("create.sessions", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
                    {t("recurring.events", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
                    {t("assign.tasks", language)}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 rounded-lg shadow-lg transform transition-all duration-200 group-hover:scale-105">
                  {t("add.event", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 sm:mt-20 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8">
            {t("quick.actions", language)}
          </h3>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/admin/plant-beds/configure">
              <Button
                variant="outline"
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-green-300 text-green-700 hover:bg-green-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("new.plant.bed", language)}
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button
                variant="outline"
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-purple-300 text-purple-700 hover:bg-purple-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("new.session", language)}
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-blue-300 text-blue-700 hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("volunteer.view", language)}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <BottomNavigation currentUser={currentUser} />
    </div>
  )
}
