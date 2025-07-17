"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Plus, Eye, Flower, Sparkles, TreePine, Settings } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { t } from "@/lib/translations"
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(false)
    }

    bootstrap()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading", language)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <Settings className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {t("admin.dashboard", language)}
          </h1>
          <p className="text-lg text-gray-600">
            {t("admin.welcome", language)}
          </p>
        </div>



        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Gardens */}
          <Card className="hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm cursor-pointer group overflow-hidden transform hover:scale-105">
            <Link href="/admin/garden">
              <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                    <TreePine className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 opacity-75" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10">
                  {t("manage.gardens", language)}
                </h3>
                <p className="text-green-100 text-sm relative z-10">{t("view.all.gardens", language)}</p>
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    {t("view.garden.details", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    {t("manage.settings", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                    {t("monitor.status", language)}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 sm:py-3 rounded-lg shadow-lg transform transition-all duration-200 group-hover:scale-105">
                  {t("manage.gardens", language)}
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Manage Plant Beds */}
          <Card className="hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm cursor-pointer group overflow-hidden transform hover:scale-105">
            <Link href="/admin/plant-beds">
              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                    <Leaf className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <Flower className="h-5 w-5 sm:h-6 sm:w-6 opacity-75" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10">
                  {t("manage.plant.beds", language)}
                </h3>
                <p className="text-blue-100 text-sm relative z-10">{t("organize.plant.beds", language)}</p>
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                    {t("create.plant.beds", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                    {t("assign.plants", language)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                    {t("track.growth", language)}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg shadow-lg transform transition-all duration-200 group-hover:scale-105">
                  {t("manage.plant.beds", language)}
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
            <Link href="/gardens/new">
              <Button
                variant="outline"
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-blue-300 text-blue-700 hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <TreePine className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("new.garden", language)}
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <TreePine className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("back.to.home", language)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
