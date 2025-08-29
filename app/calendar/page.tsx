"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  MapPin,
  Plus,
  Sun,
  Camera,
  Check,
  MessageSquare,
  Users,
  Clock,
  Thermometer,
  X,
  Leaf,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveHeader } from "@/components/responsive-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useLanguage } from "@/hooks/use-language"
import { useToast } from "@/hooks/use-toast"
import { getMockSessions, type GardenSession } from "@/lib/mock-data"
import { getCurrentWeather, getWeatherTheme, type WeatherData } from "@/lib/weather-service"
import { t } from "@/lib/translations"
import { InstagramIntegration } from "@/components/instagram-integration"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "volunteer"
}

function CalendarContent() {
  /* ------------------------------------------------------------------ */
  /* State & initial data                                               */
  /* ------------------------------------------------------------------ */
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<GardenSession[]>([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<GardenSession | null>(null)

  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [weatherTheme, setWeatherTheme] = useState(getWeatherTheme("sunny"))

  // Task interaction states
  const [taskComment, setTaskComment] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

  /* admin-only: form state (kept minimal for brevity) */
  const [sessionTitle, setSessionTitle] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  const [sessionTime, setSessionTime] = useState("")

  // Admin form state - uitgebreid
  const [sessionDescription, setSessionDescription] = useState("")
  const [sessionLocation, setSessionLocation] = useState("")
  const [maxVolunteers, setMaxVolunteers] = useState("10")
  const [isRecurring, setIsRecurring] = useState(false)
  const [repeatFrequency, setRepeatFrequency] = useState<"weekly" | "monthly">("weekly")
  const [repeatUntil, setRepeatUntil] = useState("")

  // Task management
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [selectedSessionForTask, setSelectedSessionForTask] = useState<number | null>(null)

  const router = useRouter()
  const { language, translationsLoaded } = useLanguage()
  const { toast } = useToast()

  /* ------------------------------------------------------------------ */
  /* Load user, mock sessions, and current weather                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const bootstrap = async () => {
      const stored = localStorage.getItem("currentUser")
      if (!stored) {
        router.push("/login")
        return
      }

      setCurrentUser(JSON.parse(stored))
      setSessions(getMockSessions())

      const weather = await getCurrentWeather()
      setCurrentWeather(weather)
      setWeatherTheme(getWeatherTheme(weather.condition))

      // Check if we should open a specific session
      const selectedSessionId = localStorage.getItem("selectedSessionId")
      if (selectedSessionId) {
        const sessionId = Number.parseInt(selectedSessionId)
        const session = getMockSessions().find((s) => s.id === sessionId)
        if (session) {
          setSelectedSession(session)
          setShowSessionDialog(true)
        }
        localStorage.removeItem("selectedSessionId")
      }

      setLoading(false)
    }

    bootstrap()
  }, [router])

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const navigateMonth = (dir: "next" | "prev") =>
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setMonth(next.getMonth() + (dir === "next" ? 1 : -1))
      return next
    })

  const days = useMemo(() => {
    /* Build a 6-row (42-cell) grid for the current month                */
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const first = new Date(year, month, 1)
    const start = new Date(first)
    start.setDate(start.getDate() - first.getDay())

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)

      const dateStr = date.toISOString().split("T")[0]
      const daySessions = sessions.filter((s) => s.date === dateStr)

      return {
        date,
        dateStr,
        inMonth: date.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split("T")[0],
        sessions: daySessions,
      }
    })
  }, [currentDate, sessions])

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("sunny") || condition.includes("Zonnig")) return <Sun className="h-4 w-4 text-yellow-500" />
    if (condition.includes("cloudy") || condition.includes("Bewolkt"))
      return <Cloud className="h-4 w-4 text-gray-500" />
    return <CloudRain className="h-4 w-4 text-blue-500" />
  }

  const handleToggleTask = useCallback(
    (sessionId: number, taskId: number) => {
      if (!currentUser) return

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                tasks: session.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        status: task.status === "completed" ? "not-started" : "completed",
                        completedBy: task.status === "completed" ? undefined : currentUser.name,
                        completedDate: task.status === "completed" ? undefined : new Date().toISOString().split("T")[0],
                      }
                    : task,
                ),
              }
            : session,
        ),
      )

      // Update selected session if it's the one being modified
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        status: task.status === "completed" ? "not-started" : "completed",
                        completedBy: task.status === "completed" ? undefined : currentUser.name,
                        completedDate: task.status === "completed" ? undefined : new Date().toISOString().split("T")[0],
                      }
                    : task,
                ),
              }
            : null,
        )
      }

      toast({
        title: "Taak Bijgewerkt",
        description: "Taak status is gewijzigd",
      })
    },
    [currentUser, selectedSession, toast],
  )

  const handleAddTaskComment = useCallback(
    (sessionId: number, taskId: number) => {
      if (!currentUser || !taskComment.trim()) return

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                tasks: session.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        comments: [
                          ...(task.comments || []),
                          {
                            id: Date.now(),
                            text: taskComment,
                            author: currentUser.name,
                            date: new Date().toISOString(),
                          },
                        ],
                      }
                    : task,
                ),
              }
            : session,
        ),
      )

      // Update selected session
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        comments: [
                          ...(task.comments || []),
                          {
                            id: Date.now(),
                            text: taskComment,
                            author: currentUser.name,
                            date: new Date().toISOString(),
                          },
                        ],
                      }
                    : task,
                ),
              }
            : null,
        )
      }

      setTaskComment("")
      setSelectedTaskId(null)

      toast({
        title: "Opmerking Toegevoegd",
        description: "Je opmerking is toegevoegd aan de taak",
      })
    },
    [currentUser, taskComment, selectedSession, toast],
  )

  const handleUploadPhoto = useCallback(
    (sessionId: number, taskId?: number) => {
      // Simulate photo upload
      const newPhotoUrl = "/placeholder.svg?height=200&width=300"

      if (taskId) {
        // Add photo to specific task
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  tasks: session.tasks.map((task) =>
                    task.id === taskId ? { ...task, photos: [...task.photos, newPhotoUrl] } : task,
                  ),
                }
              : session,
          ),
        )

        // Update selected session
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession((prev) =>
            prev
              ? {
                  ...prev,
                  tasks: prev.tasks.map((task) =>
                    task.id === taskId ? { ...task, photos: [...task.photos, newPhotoUrl] } : task,
                  ),
                }
              : null,
          )
        }
      } else {
        // Add photo to session progress
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  progressEntries: [
                    ...session.progressEntries,
                    {
                      id: Date.now(),
                      title: "Nieuwe voortgang foto",
                      description: `Foto toegevoegd door ${currentUser?.name}`,
                      photos: [newPhotoUrl],
                      addedBy: currentUser?.name || "Unknown",
                      date: new Date().toISOString().split("T")[0],
                    },
                  ],
                }
              : session,
          ),
        )

        // Update selected session
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession((prev) =>
            prev
              ? {
                  ...prev,
                  progressEntries: [
                    ...prev.progressEntries,
                    {
                      id: Date.now(),
                      title: "Nieuwe voortgang foto",
                      description: `Foto toegevoegd door ${currentUser?.name}`,
                      photos: [newPhotoUrl],
                      addedBy: currentUser?.name || "Unknown",
                      date: new Date().toISOString().split("T")[0],
                    },
                  ],
                }
              : null,
          )
        }
      }

      toast({
        title: "Foto Geüpload",
        description: "Je foto is succesvol toegevoegd",
      })
    },
    [currentUser?.name, selectedSession, toast],
  )

  /* ------------------------------------------------------------------ */
  /* Render loading                                                     */
  /* ------------------------------------------------------------------ */
  if (loading || !translationsLoaded) return <LoadingSkeleton />
  if (!currentUser) return null

  const isAdmin = currentUser.role === "admin"

  const handleAddTask = () => {
    if (!taskTitle || !selectedSessionForTask) return

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      status: "not-started" as const,
      photos: [],
      addedBy: currentUser?.name || "Admin",
      comments: [],
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === selectedSessionForTask ? { ...session, tasks: [...session.tasks, newTask] } : session,
      ),
    )

    // Reset form
    setTaskTitle("")
    setTaskDescription("")
    setTaskPriority("medium")
    setSelectedSessionForTask(null)
    setShowTaskDialog(false)

    toast({
      title: "Taak Toegevoegd",
      description: "Nieuwe taak is toegevoegd aan de sessie.",
    })
  }

  const handleAddSession = async () => {
    if (!sessionTitle || !sessionDate || !sessionTime) {
      toast({
        title: "Ontbrekende Informatie",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      })
      return
    }

    try {
      const sessionWeather = await getCurrentWeather()
      const sessionsToAdd: GardenSession[] = []

      if (isRecurring && repeatUntil) {
        // Generate recurring sessions
        const startDate = new Date(sessionDate)
        const endDate = new Date(repeatUntil)
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
          sessionsToAdd.push({
            id: Date.now() + Math.random(),
            title: sessionTitle,
            description: sessionDescription,
            date: currentDate.toISOString().split("T")[0],
            time: sessionTime,
            location: sessionLocation,
            maxVolunteers: Number.parseInt(maxVolunteers) || 10,
            registeredVolunteers: [],
            tasks: [],
            attendance: [],
            progressEntries: [],
            sessionCompleted: false,
            sessionType: "recurring",
            repeatFrequency,
            repeatUntil,
            weather: {
              temperature: sessionWeather.temperature,
              condition: sessionWeather.description,
              humidity: sessionWeather.humidity,
              windSpeed: sessionWeather.windSpeed,
              recordedBy: currentUser?.name || "System",
              recordedAt: new Date().toISOString(),
              weatherType: sessionWeather.condition,
            },
          })

          // Move to next occurrence
          if (repeatFrequency === "weekly") {
            currentDate.setDate(currentDate.getDate() + 7)
          } else {
            currentDate.setMonth(currentDate.getMonth() + 1)
          }
        }
      } else {
        // Single session
        sessionsToAdd.push({
          id: Date.now(),
          title: sessionTitle,
          description: sessionDescription,
          date: sessionDate,
          time: sessionTime,
          location: sessionLocation,
          maxVolunteers: Number.parseInt(maxVolunteers) || 10,
          registeredVolunteers: [],
          tasks: [],
          attendance: [],
          progressEntries: [],
          sessionCompleted: false,
          sessionType: "single",
          weather: {
            temperature: sessionWeather.temperature,
            condition: sessionWeather.description,
            humidity: sessionWeather.humidity,
            windSpeed: sessionWeather.windSpeed,
            recordedBy: currentUser?.name || "System",
            recordedAt: new Date().toISOString(),
            weatherType: sessionWeather.condition,
          },
        })
      }

      setSessions((prev) =>
        [...prev, ...sessionsToAdd].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      )

      // Reset form
      setSessionTitle("")
      setSessionDescription("")
      setSessionLocation("")
      setSessionDate("")
      setSessionTime("")
      setMaxVolunteers("10")
      setIsRecurring(false)
      setRepeatUntil("")

      toast({
        title: "Sessie(s) Toegevoegd",
        description: `${sessionsToAdd.length} sessie(s) succesvol toegevoegd aan de kalender.`,
      })
    } catch (error) {
      console.error("Error adding session:", error)
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het toevoegen van de sessie(s).",
        variant: "destructive",
      })
    }
  }

  /* ------------------------------------------------------------------ */
  /* JSX                                                                */
  /* ------------------------------------------------------------------ */
  return (
    <div className={`min-h-screen ${weatherTheme.primary} pb-20 md:pb-0`}>
      {/* ---------------- Header ---------------- */}
      <ResponsiveHeader
        title="Tuin Agenda"
        subtitle="Bekijk en beheer alle tuinsessies"
        currentUser={currentUser}
        currentWeather={currentWeather}
        weatherIcon={currentWeather ? getWeatherIcon(currentWeather.description) : null}
        className={weatherTheme.header}
        showAdminButton={false}
      />

      {/* ---------------- Main ---------------- */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 grid gap-4 sm:gap-6 lg:grid-cols-4">
        {/* ---- Admin quick-add form (very basic) ---- */}
        {isAdmin && (
          <div className="space-y-4 lg:order-1">
            <Card className={`${weatherTheme.card} sticky top-4`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                  Sessie Toevoegen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Sessie titel"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Beschrijving (optioneel)"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  rows={2}
                />
                <Input
                  placeholder="Locatie"
                  value={sessionLocation}
                  onChange={(e) => setSessionLocation(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                  <Input type="time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} />
                </div>
                <Input
                  type="number"
                  placeholder="Max vrijwilligers"
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                  min="1"
                />

                {/* Recurring Options */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                    />
                    <label htmlFor="recurring" className="text-sm font-medium">
                      Herhalend evenement
                    </label>
                  </div>

                  {isRecurring && (
                    <div className="space-y-2 pl-6">
                      <select
                        value={repeatFrequency}
                        onChange={(e) => setRepeatFrequency(e.target.value as "weekly" | "monthly")}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="weekly">Wekelijks</option>
                        <option value="monthly">Maandelijks</option>
                      </select>
                      <Input
                        type="date"
                        placeholder="Herhaal tot"
                        value={repeatUntil}
                        onChange={(e) => setRepeatUntil(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!sessionTitle || !sessionDate || !sessionTime}
                  onClick={handleAddSession}
                  size="sm"
                >
                  {isRecurring ? "Herhalende Sessies Toevoegen" : "Sessie Toevoegen"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className={weatherTheme.card}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Beheer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/plant-beds">
                  <Button variant="outline" className="w-full justify-start bg-transparent text-sm" size="sm">
                    <Leaf className="h-4 w-4 mr-2" />
                    Plantvakken Beheren
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent text-sm"
                  onClick={() => setShowTaskDialog(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Taak Toevoegen
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ---- Calendar ---- */}
        <div className={`${isAdmin ? "lg:col-span-3 lg:order-2" : "lg:col-span-4"}`}>
          <Card className={weatherTheme.card}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")} className="flex-shrink-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {currentDate.toLocaleDateString(language === "nl" ? "nl-NL" : "en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth("next")} className="flex-shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="self-start sm:self-center">
                  {sessions.length} sessies
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {/* day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm text-gray-500 mb-2">
                {["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`min-h-[60px] sm:min-h-[80px] p-1 border text-xs cursor-pointer hover:bg-gray-50 transition-colors ${
                      day.inMonth ? "bg-white" : "bg-gray-100"
                    } ${day.isToday ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => {
                      if (day.sessions.length) {
                        setSelectedSession(day.sessions[0])
                        setShowSessionDialog(true)
                      }
                    }}
                  >
                    <div className="font-medium text-xs sm:text-sm">{day.date.getDate()}</div>
                    {day.sessions.slice(0, 2).map((s) => (
                      <div key={s.id} className="truncate bg-green-100 rounded px-1 my-[1px] text-xs">
                        <span className="hidden sm:inline">{s.time} – </span>
                        {s.title}
                      </div>
                    ))}
                    {day.sessions.length > 2 && <div className="text-xs text-gray-500">+{day.sessions.length - 2}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ---------------- Dialog ---------------- */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl text-green-700">{selectedSession.title}</DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedSession.date).toLocaleDateString(language === "nl" ? "nl-NL" : "en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedSession.time}
                      </span>
                      {selectedSession.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedSession.location}
                        </span>
                      )}
                      {selectedSession.weather && (
                        <span className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" />
                          {selectedSession.weather.temperature}°C
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowSessionDialog(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    Overzicht
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="text-xs sm:text-sm">
                    Taken
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="text-xs sm:text-sm">
                    Foto's
                  </TabsTrigger>
                  <TabsTrigger value="weather" className="text-xs sm:text-sm">
                    Weer
                  </TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="instagram" className="text-xs sm:text-sm">
                      Instagram
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {selectedSession.description && <p className="text-gray-700">{selectedSession.description}</p>}

                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedSession.registeredVolunteers.length}/{selectedSession.maxVolunteers} vrijwilligers
                    </Badge>
                  </div>

                  {/* Action Buttons for volunteers */}
                  {!isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      {selectedSession.registeredVolunteers.includes(currentUser?.name || "") ? (
                        <Badge variant="default" className="bg-green-600 self-start">
                          ✓ Ingeschreven
                        </Badge>
                      ) : (
                        <Button className="bg-green-600 hover:bg-green-700" size="sm">
                          Inschrijven
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleUploadPhoto(selectedSession.id)}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Camera className="h-4 w-4" />
                        Foto Uploaden
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4">
                  {selectedSession.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSession.tasks.map((task) => (
                        <Card key={task.id} className="border-gray-200">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleTask(selectedSession.id, task.id)}
                                    className={`p-1 h-6 w-6 rounded flex-shrink-0 ${
                                      task.status === "completed" ? "bg-green-500 text-white" : "border-2"
                                    }`}
                                  >
                                    {task.status === "completed" && <Check className="h-3 w-3" />}
                                  </Button>
                                  <h5
                                    className={`font-medium text-sm sm:text-base ${
                                      task.status === "completed" ? "line-through text-gray-500" : ""
                                    }`}
                                  >
                                    {task.title}
                                  </h5>
                                </div>
                                {task.description && <p className="text-sm text-gray-600 ml-8">{task.description}</p>}
                                {task.addedBy && (
                                  <p className="text-xs text-gray-500 ml-8">Toegevoegd door: {task.addedBy}</p>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
                                <Badge
                                  className={`text-xs ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {t(task.priority, language)}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUploadPhoto(selectedSession.id, task.id)}
                                  className="p-1"
                                >
                                  <Camera className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Task Photos */}
                            {task.photos.length > 0 && (
                              <div className="flex gap-2 mb-3 ml-8 overflow-x-auto">
                                {task.photos.map((photo, index) => (
                                  <img
                                    key={index}
                                    src={photo || "/placeholder.svg?height=64&width=64"}
                                    alt={`Task photo ${index + 1}`}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border flex-shrink-0"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Comments */}
                            {task.comments && task.comments.length > 0 && (
                              <div className="ml-8 space-y-2">
                                {task.comments.map((comment: any) => (
                                  <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                                    <div className="font-medium text-xs text-gray-600">{comment.author}</div>
                                    <div>{comment.text}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment */}
                            <div className="ml-8 mt-3">
                              {selectedTaskId === task.id ? (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    value={taskComment}
                                    onChange={(e) => setTaskComment(e.target.value)}
                                    placeholder="Voeg opmerking toe..."
                                    className="text-sm flex-1"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleAddTaskComment(selectedSession.id, task.id)}>
                                      Toevoegen
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedTaskId(null)}>
                                      Annuleren
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="text-xs"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Opmerking toevoegen
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nog geen taken voor deze sessie</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="photos" className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h4 className="font-medium">Sessie Foto's</h4>
                    <Button
                      onClick={() => handleUploadPhoto(selectedSession.id)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Camera className="h-4 w-4" />
                      Foto Uploaden
                    </Button>
                  </div>

                  {/* Progress Photos */}
                  {selectedSession.progressEntries.length > 0 ||
                  selectedSession.tasks.some((t) => t.photos.length > 0) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {/* Progress entry photos */}
                      {selectedSession.progressEntries.map((entry) =>
                        entry.photos.map((photo, index) => (
                          <div key={`${entry.id}-${index}`} className="space-y-2">
                            <img
                              src={photo || "/placeholder.svg?height=128&width=128"}
                              alt={entry.title}
                              className="w-full h-24 sm:h-32 object-cover rounded border"
                            />
                            <div className="text-sm">
                              <div className="font-medium truncate">{entry.title}</div>
                              <div className="text-gray-600 text-xs">
                                {entry.addedBy} - {entry.date}
                              </div>
                            </div>
                          </div>
                        )),
                      )}
                      {/* Task photos */}
                      {selectedSession.tasks.map((task) =>
                        task.photos.map((photo, index) => (
                          <div key={`task-${task.id}-${index}`} className="space-y-2">
                            <img
                              src={photo || "/placeholder.svg?height=128&width=128"}
                              alt={task.title}
                              className="w-full h-24 sm:h-32 object-cover rounded border"
                            />
                            <div className="text-sm">
                              <div className="font-medium truncate">{task.title}</div>
                              {task.completedBy && (
                                <div className="text-gray-600 text-xs">
                                  {task.completedBy} – {task.completedDate}
                                </div>
                              )}
                            </div>
                          </div>
                        )),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nog geen foto's voor deze sessie</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="weather" className="space-y-4">
                  {selectedSession.weather ? (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {getWeatherIcon(selectedSession.weather.condition)}
                      <span className="font-medium">
                        {selectedSession.weather.temperature}°C • {selectedSession.weather.condition}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-500">Geen weerdata beschikbaar</p>
                  )}
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="instagram" className="space-y-4">
                    <InstagramIntegration
                      sessionTitle={selectedSession.title}
                      description={selectedSession.description}
                      imageUrl={
                        selectedSession.progressEntries[0]?.photos[0] ||
                        selectedSession.tasks.find((t) => t.photos.length)?.photos[0]
                      }
                      completedTasks={selectedSession.tasks.filter((t) => t.status === "completed").length}
                      totalTasks={selectedSession.tasks.length}
                      weather={selectedSession.weather?.condition}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Management Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Taak Toevoegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-session">Selecteer Sessie</Label>
              <select
                id="task-session"
                value={selectedSessionForTask || ""}
                onChange={(e) => setSelectedSessionForTask(Number(e.target.value))}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Kies een sessie</option>
                {sessions
                  .filter((s) => new Date(s.date) >= new Date())
                  .map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title} - {new Date(session.date).toLocaleDateString()}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="task-title">Taak Titel</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="bijv. Onkruid wieden"
              />
            </div>

            <div>
              <Label htmlFor="task-description">Beschrijving</Label>
              <Textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Taak details..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="task-priority">Prioriteit</Label>
              <select
                id="task-priority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleAddTask}
                disabled={!taskTitle || !selectedSessionForTask}
                className="bg-green-600 hover:bg-green-700 flex-1"
                size="sm"
              >
                Taak Toevoegen
              </Button>
              <Button variant="outline" onClick={() => setShowTaskDialog(false)} size="sm">
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentUser={currentUser} />
    </div>
  )
}

export default CalendarContent
