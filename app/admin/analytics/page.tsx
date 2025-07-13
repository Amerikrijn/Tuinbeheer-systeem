"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Leaf,
  Camera,
  Clock,
  Award,
  Activity,
} from "lucide-react"
import { getMockSessions, getMockPlantBeds, type GardenSession } from "@/lib/mock-data"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<GardenSession[]>([])
  const [plantBeds, setPlantBeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setSessions(getMockSessions())
        setPlantBeds(getMockPlantBeds())
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalSessions = sessions.length
  const completedSessions = sessions.filter((s) => s.sessionCompleted).length
  const upcomingSessions = sessions.filter((s) => new Date(s.date) >= new Date()).length
  const totalTasks = sessions.reduce((sum, session) => sum + session.tasks.length, 0)
  const completedTasks = sessions.reduce(
    (sum, session) => sum + session.tasks.filter((task) => task.status === "completed").length,
    0,
  )
  const totalVolunteers = new Set(sessions.flatMap((s) => s.registeredVolunteers)).size
  const totalPlants = plantBeds.reduce((sum, bed) => sum + bed.plants.length, 0)
  const occupiedBeds = plantBeds.filter((bed) => bed.plants.length > 0).length
  const totalPhotos = sessions.reduce((sum, session) => sum + session.progressEntries.length, 0)

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const occupancyRate = plantBeds.length > 0 ? Math.round((occupiedBeds / plantBeds.length) * 100) : 0

  // Recent activity
  const recentSessions = sessions
    .filter((s) => s.sessionCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const topVolunteers = sessions
    .flatMap((s) => s.registeredVolunteers)
    .reduce((acc: any, volunteer) => {
      acc[volunteer] = (acc[volunteer] || 0) + 1
      return acc
    }, {})

  const topVolunteersList = Object.entries(topVolunteers)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            Tuin Statistieken & Analytics
          </h1>
          <p className="text-gray-600">Overzicht van alle activiteiten en prestaties</p>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Totaal Sessies</p>
                <p className="text-3xl font-bold text-green-800">{totalSessions}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">{completedSessions} voltooid</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Taak Voltooiing</p>
                <p className="text-3xl font-bold text-blue-800">{completionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600">
                    {completedTasks}/{totalTasks} taken
                  </span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Plantvak Bezetting</p>
                <p className="text-3xl font-bold text-purple-800">{occupancyRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <Leaf className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600">
                    {occupiedBeds}/{plantBeds.length} vakken
                  </span>
                </div>
              </div>
              <Leaf className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Actieve Vrijwilligers</p>
                <p className="text-3xl font-bold text-orange-800">{totalVolunteers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-orange-600" />
                  <span className="text-xs text-orange-600">Unieke deelnemers</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Planten</p>
                <p className="text-2xl font-bold text-green-700">{totalPlants}</p>
              </div>
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Voortgang Foto's</p>
                <p className="text-2xl font-bold text-blue-700">{totalPhotos}</p>
              </div>
              <Camera className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Komende Sessies</p>
                <p className="text-2xl font-bold text-purple-700">{upcomingSessions}</p>
              </div>
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Recente Activiteit
            </CardTitle>
            <CardDescription>Laatst voltooide sessies</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{session.title}</div>
                      <div className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString("nl-NL")}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {session.tasks.filter((t) => t.status === "completed").length}/{session.tasks.length} taken
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {session.registeredVolunteers.length} vrijwilligers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nog geen voltooide sessies</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Volunteers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Top Vrijwilligers
            </CardTitle>
            <CardDescription>Meest actieve deelnemers</CardDescription>
          </CardHeader>
          <CardContent>
            {topVolunteersList.length > 0 ? (
              <div className="space-y-3">
                {topVolunteersList.map(([volunteer, count], index) => (
                  <div key={volunteer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{volunteer}</div>
                        <div className="text-sm text-gray-600">Vrijwilliger</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-700">{count as number}</div>
                      <div className="text-xs text-orange-600">sessies</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nog geen vrijwilliger data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Link href="/admin/sessions">
              <Button className="bg-green-600 hover:bg-green-700">
                <Calendar className="h-4 w-4 mr-2" />
                Beheer Sessies
              </Button>
            </Link>
            <Link href="/admin/plant-beds">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Leaf className="h-4 w-4 mr-2" />
                Beheer Plantvakken
              </Button>
            </Link>
            <Link href="/progress">
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Bekijk Voortgang
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
