"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Camera, Users, Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { ResponsiveHeader } from "@/components/responsive-header"
import { t } from "@/lib/translations"
import { getMockSessions, type GardenSession } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "volunteer"
}

export default function MobileApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<GardenSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"dashboard" | "sessions" | "enrolled" | "progress">("dashboard")
  const router = useRouter()
  const { language, translationsLoaded } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    } else {
      router.push("/login")
      return
    }
    setSessions(getMockSessions())
    setLoading(false)
  }, [router])

  const handleRegister = (sessionId: number) => {
    if (!currentUser) return

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          if (session.registeredVolunteers.includes(currentUser.name)) {
            toast({
              title: t("already.registered", language),
              variant: "destructive",
            })
            return session
          }

          if (session.registeredVolunteers.length >= session.maxVolunteers) {
            toast({
              title: t("full", language),
              description: t("session.full", language),
              variant: "destructive",
            })
            return session
          }

          toast({
            title: t("enrollment.successful", language),
            description: t("enrolled.for.session", language, { title: session.title }),
          })

          return {
            ...session,
            registeredVolunteers: [...session.registeredVolunteers, currentUser.name],
          }
        }
        return session
      }),
    )
  }

  const handleUnenroll = (sessionId: number) => {
    if (!currentUser) return

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            registeredVolunteers: session.registeredVolunteers.filter((name) => name !== currentUser.name),
          }
        }
        return session
      }),
    )

    toast({
      title: t("unenrolled.successfully", language),
    })
  }

  const isUserEnrolled = (session: GardenSession) => {
    return currentUser && session.registeredVolunteers.includes(currentUser.name)
  }

  const upcomingSessions = sessions.filter((session) => new Date(session.date) >= new Date())
  const enrolledSessions = upcomingSessions.filter((session) => isUserEnrolled(session))

  if (loading || !translationsLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">{t("loading", language)}</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "nl" ? "nl-NL" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      <ResponsiveHeader
        title={t("garden.volunteers", language)}
        subtitle={`${currentUser.name} • ${t(currentUser.role, language)}`}
        currentUser={currentUser}
        className="bg-green-600"
        showAdminButton={false}
      />

      {/* Mobile Content */}
      <main className="p-4">
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">{upcomingSessions.length}</div>
                  <div className="text-xs text-green-600">{t("upcoming.sessions", language)}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-700">{enrolledSessions.length}</div>
                  <div className="text-xs text-blue-600">{t("enrolled.sessions", language)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Next Session */}
            {enrolledSessions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    Next Session
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <h3 className="font-medium">{enrolledSessions[0].title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(enrolledSessions[0].date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {enrolledSessions[0].time}
                      </span>
                    </div>
                    {enrolledSessions[0].location && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {enrolledSessions[0].location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setActiveTab("sessions")}
                className="h-16 bg-green-600 hover:bg-green-700 flex-col gap-1"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">{t("session.calendar", language)}</span>
              </Button>
              <Link href="/progress">
                <Button className="h-16 w-full bg-green-600 hover:bg-green-700 flex-col gap-1">
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">{t("progress.gallery", language)}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("upcoming.sessions", language)}</h2>
              <Badge variant="outline">{upcomingSessions.length} sessions</Badge>
            </div>

            {upcomingSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{session.title}</CardTitle>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {session.registeredVolunteers.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                  {session.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </div>
                  )}

                  {/* Tasks Preview */}
                  {session.tasks.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        {t("tasks", language)} ({session.tasks.length})
                      </div>
                      <div className="space-y-1">
                        {session.tasks.slice(0, 2).map((task) => (
                          <div key={task.id} className="flex items-center gap-2 text-xs">
                            {task.status === "completed" ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="truncate flex-1">{task.title}</span>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {t(task.priority, language)}
                            </Badge>
                          </div>
                        ))}
                        {session.tasks.length > 2 && (
                          <div className="text-xs text-gray-500">+{session.tasks.length - 2} more tasks</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isUserEnrolled(session) ? (
                      <>
                        <Badge variant="default" className="bg-green-600 text-xs">
                          {t("enrolled", language)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnenroll(session.id)}
                          className="text-xs flex-1"
                        >
                          {t("unenroll", language)}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleRegister(session.id)}
                        disabled={session.registeredVolunteers.length >= session.maxVolunteers}
                        className="bg-green-600 hover:bg-green-700 text-xs flex-1"
                      >
                        {session.registeredVolunteers.length >= session.maxVolunteers
                          ? t("full", language)
                          : t("enroll.now", language)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "enrolled" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("enrolled.sessions", language)}</h2>
              <Badge variant="outline">{enrolledSessions.length} sessions</Badge>
            </div>

            {enrolledSessions.length > 0 ? (
              enrolledSessions.map((session) => (
                <Card key={session.id} className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{session.title}</CardTitle>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                    {session.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUnenroll(session.id)}
                      className="w-full text-xs"
                    >
                      {t("unenroll", language)}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t("not.enrolled.sessions", language)}</p>
                <Button onClick={() => setActiveTab("sessions")} className="bg-green-600 hover:bg-green-700">
                  {t("view.all.sessions", language)}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("progress.gallery", language)}</h2>
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Progress gallery coming soon...</p>
              <Link href="/progress">
                <Button className="bg-green-600 hover:bg-green-700">{t("view.gallery", language)}</Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("dashboard")}
            className="flex-col gap-1 h-12 px-3"
          >
            <Users className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button
            variant={activeTab === "sessions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("sessions")}
            className="flex-col gap-1 h-12 px-3"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Sessions</span>
          </Button>
          <Button
            variant={activeTab === "enrolled" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("enrolled")}
            className="flex-col gap-1 h-12 px-3"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Enrolled</span>
          </Button>
          <Button
            variant={activeTab === "progress" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("progress")}
            className="flex-col gap-1 h-12 px-3"
          >
            <Camera className="h-4 w-4" />
            <span className="text-xs">Progress</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
