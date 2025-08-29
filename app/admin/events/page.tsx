"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  MapPin,
  RefreshCw,
  Home,
  CalendarDays,
  CheckCircle,
} from "lucide-react"
import { getMockEvents, type Event } from "@/lib/mock-data"

interface NewEvent {
  title: string
  description: string
  date: string
  time: string
  duration: string
  location: string
  maxVolunteers: string
  category: string
  isRecurring: boolean
  recurringType: string
  recurringEnd: string
}

export default function EventsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "2",
    location: "",
    maxVolunteers: "10",
    category: "Onderhoud",
    isRecurring: false,
    recurringType: "weekly",
    recurringEnd: "",
  })

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setEvents(getMockEvents())
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      // Validate required fields
      if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
        toast({
          title: "Ontbrekende informatie",
          description: "Vul alle verplichte velden in.",
          variant: "destructive",
        })
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Evenement aangemaakt!",
        description: `${newEvent.title} is succesvol toegevoegd aan de agenda.`,
      })

      // Reset form
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "2",
        location: "",
        maxVolunteers: "10",
        category: "Onderhoud",
        isRecurring: false,
        recurringType: "weekly",
        recurringEnd: "",
      })

      setShowAddForm(false)

      // Reload events (in real app, add to state)
      const updatedEvents = getMockEvents()
      setEvents(updatedEvents)
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanmaken van het evenement.",
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const categoryOptions = ["Onderhoud", "Planten", "Evenement", "Schoonmaak", "Reparatie", "Overig"]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Onderhoud":
        return "bg-blue-100 text-blue-800"
      case "Planten":
        return "bg-green-100 text-green-800"
      case "Evenement":
        return "bg-purple-100 text-purple-800"
      case "Schoonmaak":
        return "bg-yellow-100 text-yellow-800"
      case "Reparatie":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Tuinbeheerscherm
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              Evenementen Beheer
            </h1>
            <p className="text-gray-600">Beheer alle tuinevenementen en vrijwilligerssessies</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {showAddForm ? "Annuleren" : "Nieuw Evenement"}
        </Button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Plus className="h-5 w-5" />
              Nieuw Evenement Toevoegen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Evenement Titel *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Bijv. Tuin Onderhoud, Planten Sessie"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categorie</Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Tijd *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duur (uren)</Label>
                  <Select
                    value={newEvent.duration}
                    onValueChange={(value) => setNewEvent((prev) => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer duur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 uur</SelectItem>
                      <SelectItem value="2">2 uur</SelectItem>
                      <SelectItem value="3">3 uur</SelectItem>
                      <SelectItem value="4">4 uur</SelectItem>
                      <SelectItem value="6">6 uur</SelectItem>
                      <SelectItem value="8">8 uur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxVolunteers">Max Vrijwilligers</Label>
                  <Input
                    id="maxVolunteers"
                    type="number"
                    value={newEvent.maxVolunteers}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, maxVolunteers: e.target.value }))}
                    min="1"
                    max="50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Locatie *</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Bijv. Hoofdtuin, Plantvak A, Gereedschapsschuur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschrijf wat er gedaan moet worden..."
                  rows={3}
                />
              </div>

              {/* Recurring Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={newEvent.isRecurring}
                    onCheckedChange={(checked) => setNewEvent((prev) => ({ ...prev, isRecurring: checked as boolean }))}
                  />
                  <Label htmlFor="isRecurring">Terugkerend evenement</Label>
                </div>

                {newEvent.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="recurringType">Herhaling</Label>
                      <Select
                        value={newEvent.recurringType}
                        onValueChange={(value) => setNewEvent((prev) => ({ ...prev, recurringType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer herhaling" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Wekelijks</SelectItem>
                          <SelectItem value="biweekly">Tweewekelijks</SelectItem>
                          <SelectItem value="monthly">Maandelijks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recurringEnd">Einddatum</Label>
                      <Input
                        id="recurringEnd"
                        type="date"
                        value={newEvent.recurringEnd}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, recurringEnd: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitLoading} className="bg-blue-600 hover:bg-blue-700">
                  {submitLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Aanmaken...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Evenement Aanmaken
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuleren
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal Evenementen</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deze Week</p>
                <p className="text-2xl font-bold">
                  {
                    events.filter((event) => {
                      const eventDate = new Date(event.date)
                      const now = new Date()
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return eventDate >= now && eventDate <= weekFromNow
                    }).length
                  }
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal Inschrijvingen</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, event) => sum + event.registeredVolunteers, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Voltooide Evenementen</p>
                <p className="text-2xl font-bold">
                  {events.filter((event) => new Date(event.date) < new Date()).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                    {event.isRecurring && <Badge variant="outline">Terugkerend</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {new Date(event.date).toLocaleDateString("nl-NL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {event.time} ({event.duration} uur)
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  {event.registeredVolunteers}/{event.maxVolunteers} vrijwilligers
                </div>
              </div>

              {event.description && (
                <>
                  <Separator />
                  <div className="text-sm text-gray-600">{event.description}</div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Bewerken
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen evenementen</h3>
          <p className="text-gray-600 mb-4">Begin met het toevoegen van je eerste tuinevenement.</p>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Eerste Evenement Toevoegen
          </Button>
        </div>
      )}
    </div>
  )
}
