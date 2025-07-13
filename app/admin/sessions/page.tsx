"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle, Trash2, Edit } from "lucide-react"
import { getMockSessions, type GardenSession } from "@/lib/mock-data"
import { getCurrentWeather } from "@/lib/weather-service"
import { useToast } from "@/hooks/use-toast"

export default function AdminSessionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<GardenSession[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [sessionTitle, setSessionTitle] = useState("")
  const [sessionDescription, setSessionDescription] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  const [sessionTime, setSessionTime] = useState("")
  const [sessionLocation, setSessionLocation] = useState("")
  const [maxVolunteers, setMaxVolunteers] = useState("10")
  const [isRecurring, setIsRecurring] = useState(false)
  const [repeatFrequency, setRepeatFrequency] = useState<"weekly" | "monthly">("weekly")
  const [repeatUntil, setRepeatUntil] = useState("")

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [selectedSessionForTask, setSelectedSessionForTask] = useState<number | null>(null)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setSessions(getMockSessions())
      } catch (error) {
        console.error("Error loading sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

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
              recordedBy: "Admin",
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
            recordedBy: "Admin",
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
        description: `${sessionsToAdd.length} sessie(s) succesvol toegevoegd.`,
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

  const handleAddTask = () => {
    if (!taskTitle || !selectedSessionForTask) {
      toast({
        title: "Ontbrekende Informatie",
        description: "Vul alle verplichte velden in en selecteer een sessie.",
        variant: "destructive",
      })
      return
    }

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      status: "not-started" as const,
      photos: [],
      addedBy: "Admin",
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
    setShowTaskForm(false)

    toast({
      title: "Taak Toegevoegd",
      description: "Nieuwe taak is toegevoegd aan de sessie.",
    })
  }

  const handleDeleteSession = (sessionId: number) => {
    if (confirm("Weet je zeker dat je deze sessie wilt verwijderen?")) {
      setSessions((prev) => prev.filter((session) => session.id !== sessionId))
      toast({
        title: "Sessie Verwijderd",
        description: "De sessie is succesvol verwijderd.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const upcomingSessions = sessions.filter((session) => new Date(session.date) >= new Date())
  const pastSessions = sessions.filter((session) => new Date(session.date) < new Date())

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
            <Calendar className="h-8 w-8 text-green-600" />
            Sessies & Taken Beheren
          </h1>
          <p className="text-gray-600">Voeg sessies toe en beheer taken</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Session Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Nieuwe Sessie Toevoegen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-title">Sessie Titel *</Label>
              <Input
                id="session-title"
                placeholder="bijv. Lente Plantdag"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="session-description">Beschrijving</Label>
              <Textarea
                id="session-description"
                placeholder="Beschrijf de sessie..."
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="session-location">Locatie</Label>
              <Input
                id="session-location"
                placeholder="bijv. Hoofdtuin Gebied"
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-date">Datum *</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="session-time">Tijd *</Label>
                <Input
                  id="session-time"
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max-volunteers">Max Vrijwilligers</Label>
              <Input
                id="max-volunteers"
                type="number"
                min="1"
                placeholder="10"
                value={maxVolunteers}
                onChange={(e) => setMaxVolunteers(e.target.value)}
              />
            </div>

            {/* Recurring Options */}
            <div className="space-y-3">
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
                <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                  <div>
                    <Label htmlFor="repeat-frequency">Herhaal frequentie</Label>
                    <select
                      id="repeat-frequency"
                      value={repeatFrequency}
                      onChange={(e) => setRepeatFrequency(e.target.value as "weekly" | "monthly")}
                      className="w-full p-2 border rounded"
                    >
                      <option value="weekly">Wekelijks</option>
                      <option value="monthly">Maandelijks</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="repeat-until">Herhaal tot</Label>
                    <Input
                      id="repeat-until"
                      type="date"
                      value={repeatUntil}
                      onChange={(e) => setRepeatUntil(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddSession}
              disabled={!sessionTitle || !sessionDate || !sessionTime}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isRecurring ? "Herhalende Sessies Toevoegen" : "Sessie Toevoegen"}
            </Button>
          </CardContent>
        </Card>

        {/* Add Task Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Taak Toevoegen aan Sessie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="task-session">Selecteer Sessie *</Label>
              <select
                id="task-session"
                value={selectedSessionForTask || ""}
                onChange={(e) => setSelectedSessionForTask(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="">Kies een sessie</option>
                {upcomingSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title} - {new Date(session.date).toLocaleDateString("nl-NL")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="task-title">Taak Titel *</Label>
              <Input
                id="task-title"
                placeholder="bijv. Onkruid wieden bloemperken"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="task-description">Taak Beschrijving</Label>
              <Textarea
                id="task-description"
                placeholder="Beschrijf de taak in detail..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="task-priority">Prioriteit</Label>
              <select
                id="task-priority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full p-2 border rounded"
              >
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
              </select>
            </div>

            <Button
              onClick={handleAddTask}
              disabled={!taskTitle || !selectedSessionForTask}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Taak Toevoegen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Komende Sessies ({upcomingSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{session.title}</h3>
                          {session.sessionType === "recurring" && (
                            <Badge variant="outline" className="text-xs">
                              Herhalend
                            </Badge>
                          )}
                        </div>
                        {session.description && <p className="text-gray-600 mb-3">{session.description}</p>}

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
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
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.registeredVolunteers.length}/{session.maxVolunteers}
                          </span>
                        </div>

                        {session.tasks.length > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {session.tasks.filter((t) => t.status === "completed").length}/{session.tasks.length}{" "}
                              taken voltooid
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              {session.tasks.filter((t) => t.priority === "high").length} hoge prioriteit
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/calendar`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Bekijk
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nog geen komende sessies gepland</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                Voltooide Sessies ({pastSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{session.title}</div>
                      <div className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString("nl-NL")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {session.tasks.filter((t) => t.status === "completed").length}/{session.tasks.length} taken
                      </div>
                      <div className="text-xs text-gray-500">{session.registeredVolunteers.length} vrijwilligers</div>
                    </div>
                  </div>
                ))}
                {pastSessions.length > 5 && (
                  <p className="text-center text-sm text-gray-500">En {pastSessions.length - 5} meer...</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
