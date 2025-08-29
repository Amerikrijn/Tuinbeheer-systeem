"use client"

// Force dynamic rendering to prevent SSR issues with auth
export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, ArrowLeft, Search, Filter, BookOpen, Clock, User } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserRestrictedRoute } from "@/components/auth/user-restricted-route"
import { useAuth } from "@/hooks/use-supabase-auth"

export default function LogbookPage() {
  return (
    <ProtectedRoute>
      <UserRestrictedRoute>
        <LogbookPageContent />
      </UserRestrictedRoute>
    </ProtectedRoute>
  )
}

function LogbookPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [editingEntry, setEditingEntry] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [isLoading, setIsLoading] = React.useState(false)

  // Mock data for demonstration
  const mockEntries = [
    {
      id: "1",
      title: "Planten water gegeven",
      description: "Alle planten in de achtertuin hebben water gekregen",
      status: "completed",
      date: "2024-01-15",
      user: "John Doe",
      category: "Watering"
    },
    {
      id: "2",
      title: "Onkruid verwijderd",
      description: "Onkruid weggehaald uit de moestuin",
      status: "completed",
      date: "2024-01-14",
      user: "Jane Smith",
      category: "Maintenance"
    },
    {
      id: "3",
      title: "Meststoffen toegevoegd",
      description: "Organische meststoffen toegevoegd aan de bloembedden",
      status: "in_progress",
      date: "2024-01-13",
      user: "John Doe",
      category: "Fertilizing"
    }
  ]

  const filteredEntries = mockEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddEntry = (entryData: any) => {
    console.log("Adding new entry:", entryData)
    setShowAddForm(false)
    // Here you would typically save to database
  }

  const handleEditEntry = (entryData: any) => {
    console.log("Editing entry:", entryData)
    setEditingEntry(null)
    // Here you would typically update database
  }

  const handleDeleteEntry = (entryId: string) => {
    console.log("Deleting entry:", entryId)
    // Here you would typically delete from database
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {/* Mobile-First Header */}
        <div className="mb-6">
          {/* Top Bar - Mobile First */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => router.back()}
              aria-label="Ga terug"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Logboek
              </h1>
            </div>
            
            <Button
              onClick={() => setShowAddForm(true)}
              className="h-10 w-10 p-0 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
              aria-label="Nieuwe logboek entry toevoegen"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Description */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Tuinactiviteiten
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Houd bij wat je in je tuin doet en wanneer
            </p>
          </div>

          {/* Mobile Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">Totaal</p>
                  <p className="text-lg font-bold text-foreground">{mockEntries.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">Vandaag</p>
                  <p className="text-lg font-bold text-foreground">1</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Zoek in logboek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
                <SelectValue placeholder="Filter op status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="completed">Voltooid</SelectItem>
                <SelectItem value="in_progress">In uitvoering</SelectItem>
                <SelectItem value="planned">Gepland</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logbook Entries */}
        <Card className="rounded-lg text-card-foreground bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/30 shadow-lg">
          <CardHeader className="flex flex-col space-y-1.5 p-6 pb-3 px-4">
            <CardTitle className="font-semibold tracking-tight flex items-center justify-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              Recente Activiteiten
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 px-4 pb-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Geen activiteiten gevonden</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" 
                    ? "Probeer je zoekopdracht aan te passen" 
                    : "Voeg je eerste tuinactiviteit toe"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Eerste Entry Toevoegen
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {entry.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Badge 
                            variant={entry.status === "completed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {entry.status === "completed" ? "Voltooid" : "In uitvoering"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{entry.user}</span>
                        </div>
                        <span className="px-2 py-1 bg-muted rounded-md">{entry.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                          className="h-8 text-xs"
                        >
                          Bewerken
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="h-8 text-xs text-red-600 hover:text-red-700"
                        >
                          Verwijderen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form - Simple placeholder for now */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Nieuwe Logboek Entry</h3>
            <p className="text-muted-foreground mb-4">
              Deze functionaliteit wordt binnenkort toegevoegd.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddForm(false)} className="flex-1">
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Form - Simple placeholder for now */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Bewerk Entry</h3>
            <p className="text-muted-foreground mb-4">
              Deze functionaliteit wordt binnenkort toegevoegd.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setEditingEntry(null)} className="flex-1">
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}