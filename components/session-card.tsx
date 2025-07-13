"use client"

import { memo, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Thermometer, Camera } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { t } from "@/lib/translations"
import type { GardenSession } from "@/lib/mock-data"

interface SessionCardProps {
  session: GardenSession
  currentUser: { name: string; role: string } | null
  onRegister: (sessionId: number) => void
  onUnenroll: (sessionId: number) => void
  onAddToCalendar: (session: GardenSession) => void
  onUpdateTaskStatus: (sessionId: number, taskId: number, status: string) => void
  onAddPhoto: (sessionId: number, taskId: number) => void
  isUserEnrolled: boolean
}

export const SessionCard = memo(function SessionCard({
  session,
  currentUser,
  onRegister,
  onUnenroll,
  onAddToCalendar,
  onUpdateTaskStatus,
  onAddPhoto,
  isUserEnrolled,
}: SessionCardProps) {
  const { language } = useLanguage()

  const formatDate = useCallback(
    (dateString: string) => {
      return new Date(dateString).toLocaleDateString(language === "nl" ? "nl-NL" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    },
    [language],
  )

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "in-progress":
        return "text-blue-600 bg-blue-100"
      case "not-started":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }, [])

  const handleRegister = useCallback(() => {
    onRegister(session.id)
  }, [onRegister, session.id])

  const handleUnenroll = useCallback(() => {
    onUnenroll(session.id)
  }, [onUnenroll, session.id])

  const handleAddToCalendar = useCallback(() => {
    onAddToCalendar(session)
  }, [onAddToCalendar, session])

  return (
    <Card id={`session-${session.id}`} className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-green-700">{session.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(session.date)}
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
              {session.weather && (
                <span className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  {session.weather.temperature}°C, {session.weather.condition}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {session.registeredVolunteers.length}/{session.maxVolunteers}
            </Badge>
            {currentUser?.role !== "admin" && (
              <div className="flex gap-2">
                {isUserEnrolled ? (
                  <>
                    <Badge variant="default" className="bg-green-600">
                      {t("enrolled", language)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddToCalendar}
                      className="text-xs bg-transparent"
                    >
                      📅 {t("add.to.calendar", language)}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleRegister}
                    disabled={session.registeredVolunteers.length >= session.maxVolunteers}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {session.registeredVolunteers.length >= session.maxVolunteers
                      ? t("full", language)
                      : t("enroll.now", language)}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {session.description && <CardDescription className="mt-2">{session.description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t("overview", language)}</TabsTrigger>
            <TabsTrigger value="tasks">{t("tasks", language)}</TabsTrigger>
            <TabsTrigger value="attendance">{t("attendance", language)}</TabsTrigger>
            <TabsTrigger value="progress">{t("progress", language)}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Registered Volunteers */}
            {session.registeredVolunteers.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">{t("registered.volunteers", language)}:</h4>
                <div className="flex flex-wrap gap-2">
                  {session.registeredVolunteers.map((volunteer, index) => (
                    <Badge key={index} variant="secondary">
                      {volunteer}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-lg font-bold text-green-700">{session.tasks.length}</div>
                <div className="text-xs text-green-600">{t("tasks", language)}</div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <div className="text-lg font-bold text-blue-700">{session.attendance.length}</div>
                <div className="text-xs text-blue-600">{t("attendees", language)}</div>
              </div>
              <div className="text-center p-3 bg-purple-100 rounded-lg">
                <div className="text-lg font-bold text-purple-700">{session.progressEntries.length}</div>
                <div className="text-xs text-purple-600">{t("progress", language)}</div>
              </div>
              <div className="text-center p-3 bg-orange-100 rounded-lg">
                <div className="text-lg font-bold text-orange-700">{session.weather ? "✓" : "—"}</div>
                <div className="text-xs text-orange-600">{t("weather", language)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {session.tasks.length > 0 ? (
              <div className="space-y-4">
                {session.tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">{task.title}</h5>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                        {task.addedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t("added.by", language)}: {task.addedBy}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {t(task.priority, language)}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>{t(task.status, language)}</Badge>
                      </div>
                    </div>

                    {/* Task Status Controls */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">{t("status", language)}:</span>
                      <Button
                        size="sm"
                        variant={task.status === "not-started" ? "default" : "outline"}
                        onClick={() => onUpdateTaskStatus(session.id, task.id, "not-started")}
                        className="text-xs"
                      >
                        {t("not.started", language)}
                      </Button>
                      <Button
                        size="sm"
                        variant={task.status === "in-progress" ? "default" : "outline"}
                        onClick={() => onUpdateTaskStatus(session.id, task.id, "in-progress")}
                        className="text-xs"
                      >
                        {t("in.progress", language)}
                      </Button>
                      <Button
                        size="sm"
                        variant={task.status === "completed" ? "default" : "outline"}
                        onClick={() => onUpdateTaskStatus(session.id, task.id, "completed")}
                        className="text-xs"
                      >
                        {t("completed", language)}
                      </Button>
                    </div>

                    {/* Completion Info */}
                    {task.completedBy && (
                      <div className="text-sm text-green-600 mb-3">
                        {t("completed.by.on", language, {
                          name: task.completedBy,
                          date: task.completedDate || "",
                        })}
                      </div>
                    )}

                    {/* Photos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {t("progress.photos", language, { count: task.photos.length.toString() })}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddPhoto(session.id, task.id)}
                          className="text-xs"
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          {t("add.photo", language)}
                        </Button>
                      </div>

                      {task.photos.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {task.photos.map((photo, index) => (
                            <Image
                              key={index}
                              src={photo || "/placeholder.svg"}
                              alt={`Task progress ${index + 1}`}
                              width={100}
                              height={75}
                              className="rounded border object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{t("no.tasks.assigned", language)}</p>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Attendance tracking coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Progress tracking coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
})
