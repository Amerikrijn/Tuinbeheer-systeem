"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Camera,
  LogOut,
  ArrowLeft,
  Users,
  CheckCircle,
  MapPin,
  Clock,
  Eye,
  Download,
  Share2,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { getMockSessions, type GardenSession } from "@/lib/mock-data"
import { getCurrentWeather, getWeatherTheme } from "@/lib/weather-service"
import Link from "next/link"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "volunteer"
}

function ProgressContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<GardenSession[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeather, setCurrentWeather] = useState<any>(null)
  const [weatherTheme, setWeatherTheme] = useState(getWeatherTheme("sunny"))
  const [selectedSession, setSelectedSession] = useState<GardenSession | null>(null)
  const router = useRouter()
  const { language, translationsLoaded } = useLanguage()

  useEffect(() => {
    const loadData = async () => {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        setCurrentUser(JSON.parse(userData))
      } else {
        router.push("/login")
        return
      }

      const weather = await getCurrentWeather()
      setCurrentWeather(weather)
      setWeatherTheme(getWeatherTheme(weather.condition))

      setSessions(getMockSessions())
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  if (loading || !translationsLoaded) {
    return <LoadingSkeleton />
  }

  if (!currentUser) {
    return null
  }

  // Get sessions with progress/photos
  const sessionsWithProgress = sessions.filter(
    (session) => session.progressEntries.length > 0 || session.tasks.some((task) => task.photos.length > 0),
  )

  // Get all photos with metadata
  const allPhotos = sessionsWithProgress.flatMap((session) => [
    ...session.progressEntries.flatMap((entry) =>
      entry.photos.map((photo) => ({
        url: photo,
        title: entry.title,
        description: entry.description,
        session: session.title,
        sessionId: session.id,
        date: session.date,
        author: entry.addedBy,
        type: "progress" as const,
      })),
    ),
    ...session.tasks.flatMap((task) =>
      task.photos.map((photo) => ({
        url: photo,
        title: task.title,
        description: task.description || "",
        session: session.title,
        sessionId: session.id,
        date: session.date,
        author: task.completedBy || "Unknown",
        type: "task" as const,
      })),
    ),
  ])

  const recentPhotos = allPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12)

  return (
    <div className={`min-h-screen ${weatherTheme.primary}`}>
      {/* Header */}
      <header className={`${weatherTheme.header} text-white p-6`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={currentUser.role === "admin" ? "/admin" : "/"}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Tuin Voortgang</h1>
              <p className="text-sm opacity-90">Bekijk alle foto's en documentatie</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-black/20">
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totaal Foto's</p>
                  <p className="text-2xl font-bold">{allPhotos.length}</p>
                </div>
                <Camera className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sessies met Voortgang</p>
                  <p className="text-2xl font-bold">{sessionsWithProgress.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Voortgang Entries</p>
                  <p className="text-2xl font-bold">{sessions.reduce((sum, s) => sum + s.progressEntries.length, 0)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actieve Fotografen</p>
                  <p className="text-2xl font-bold">{new Set(allPhotos.map((photo) => photo.author)).size}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Photos Gallery */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-green-600" />
                  Recente Foto's
                </CardTitle>
                <CardDescription>Laatste voortgang documentatie</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporteren
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Delen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentPhotos.map((photo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative group">
                      <img
                        src={photo.url || "/placeholder.svg?height=200&width=300"}
                        alt={photo.title}
                        className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          const session = sessions.find((s) => s.id === photo.sessionId)
                          if (session) setSelectedSession(session)
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge
                        variant={photo.type === "progress" ? "default" : "secondary"}
                        className="absolute top-2 left-2 text-xs"
                      >
                        {photo.type === "progress" ? "Voortgang" : "Taak"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm truncate">{photo.title}</h4>
                      <p className="text-xs text-gray-600 truncate">{photo.session}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{photo.author}</span>
                        <span>{new Date(photo.date).toLocaleDateString("nl-NL")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen foto's</h3>
                <p className="text-gray-600 mb-4">Begin met het uploaden van foto's tijdens tuinsessies</p>
                <Link href="/calendar">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ga naar Kalender
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions with Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Sessies met Voortgang
            </CardTitle>
            <CardDescription>Overzicht van gedocumenteerde sessies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessionsWithProgress.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{session.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString("nl-NL")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.time}
                        </span>
                        {session.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {session.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{session.progressEntries.length} voortgang</Badge>
                        <Badge variant="outline">
                          {session.tasks.reduce((sum, task) => sum + task.photos.length, 0)} taak foto's
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">{session.registeredVolunteers.length} vrijwilligers</div>
                    </div>
                  </div>

                  {/* Preview photos */}
                  <div className="flex gap-2 mt-3">
                    {session.progressEntries
                      .slice(0, 3)
                      .map((entry, index) =>
                        entry.photos
                          .slice(0, 1)
                          .map((photo, photoIndex) => (
                            <img
                              key={`${index}-${photoIndex}`}
                              src={photo || "/placeholder.svg?height=60&width=60"}
                              alt={entry.title}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )),
                      )}
                    {session.tasks
                      .slice(0, 2)
                      .map((task, index) =>
                        task.photos
                          .slice(0, 1)
                          .map((photo, photoIndex) => (
                            <img
                              key={`task-${index}-${photoIndex}`}
                              src={photo || "/placeholder.svg?height=60&width=60"}
                              alt={task.title}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )),
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProgressContent />
    </Suspense>
  )
}
