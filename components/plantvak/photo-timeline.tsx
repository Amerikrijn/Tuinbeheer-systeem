"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Image as ImageIcon,
  Clock,
  Maximize2,
  X
} from 'lucide-react'
import { format, parseISO, getYear } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { LogbookEntryWithDetails } from '@/lib/types/index'

interface PhotoTimelineProps {
  plantBedId: string
  plantBedName: string
}

interface YearGroup {
  year: number
  entries: LogbookEntryWithDetails[]
  isExpanded: boolean
}

export function PhotoTimeline({ plantBedId, plantBedName }: PhotoTimelineProps) {
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntryWithDetails[]>([])
  const [yearGroups, setYearGroups] = useState<YearGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<LogbookEntryWithDetails | null>(null)
  const [showFullscreen, setShowFullscreen] = useState(false)
  
  const currentYear = new Date().getFullYear()

  // Fetch logbook entries with photos for this plant bed
  useEffect(() => {
    const fetchLogbookPhotos = async () => {
      try {
        setLoading(true)
        
        // Fetch logbook entries for this plant bed
        const { LogbookService } = await import('@/lib/services/database.service')
        const response = await LogbookService.getAll({
          plant_bed_id: plantBedId
        })
        
        if (response.success && response.data) {
          // Filter only entries with photos
          const entriesWithPhotos = response.data.filter(entry => entry.photo_url)
          
          // Sort by date (newest first within each year)
          entriesWithPhotos.sort((a, b) => 
            new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
          )
          
          // Group by year
          const grouped = entriesWithPhotos.reduce((acc, entry) => {
            const year = getYear(parseISO(entry.entry_date))
            
            if (!acc[year]) {
              acc[year] = []
            }
            acc[year].push(entry)
            return acc
          }, {} as Record<number, LogbookEntryWithDetails[]>)
          
          // Convert to array and sort years (newest first)
          const yearGroupsArray: YearGroup[] = Object.keys(grouped)
            .map(year => parseInt(year))
            .sort((a, b) => b - a)
            .map(year => ({
              year,
              entries: grouped[year],
              isExpanded: year === currentYear // Current year expanded by default
            }))
          
          setYearGroups(yearGroupsArray)
          setLogbookEntries(entriesWithPhotos)
        }
      } catch (error) {
        console.error('Error fetching logbook photos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (plantBedId) {
      fetchLogbookPhotos()
    }
  }, [plantBedId, currentYear])

  // Toggle year expansion
  const toggleYear = (year: number) => {
    setYearGroups(prev => prev.map(group => 
      group.year === year 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ))
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'd MMMM', { locale: nl })
    } catch {
      return dateString
    }
  }

  // Get season emoji based on date
  const getSeasonEmoji = (dateString: string) => {
    const month = new Date(dateString).getMonth() + 1
    if (month >= 3 && month <= 5) return '🌸' // Spring
    if (month >= 6 && month <= 8) return '☀️' // Summer
    if (month >= 9 && month <= 11) return '🍂' // Autumn
    return '❄️' // Winter
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto Tijdlijn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-green-100 dark:bg-green-900/30 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (logbookEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto Tijdlijn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-muted-foreground">Nog geen foto's in het logboek</p>
            <p className="text-sm text-muted-foreground mt-1">
              Voeg foto's toe aan je logboek entries om ze hier te zien
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Foto Tijdlijn
            </CardTitle>
            <Badge variant="secondary">
              {logbookEntries.length} foto's
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {yearGroups.map((yearGroup) => (
            <div key={yearGroup.year} className="border rounded-lg overflow-hidden">
              {/* Year Header */}
              <button
                onClick={() => toggleYear(yearGroup.year)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {yearGroup.isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-lg">
                    {yearGroup.year}
                  </span>
                  {yearGroup.year === currentYear && (
                    <Badge variant="default" className="text-xs">
                      Huidig jaar
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {yearGroup.entries.length} foto's
                  </Badge>
                </div>
              </button>

              {/* Year Content - Photo Grid */}
              {yearGroup.isExpanded && (
                <div className="p-4 bg-background">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {yearGroup.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="group relative cursor-pointer"
                        onClick={() => {
                          setSelectedPhoto(entry)
                          setShowFullscreen(true)
                        }}
                      >
                        {/* Photo Thumbnail */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-blue-400 transition-all">
                          <img
                            src={entry.photo_url}
                            alt={entry.notes}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Date Badge */}
                        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDate(entry.entry_date)}
                        </div>
                        
                        {/* Season Indicator */}
                        <div className="absolute top-2 right-2 text-lg">
                          {getSeasonEmoji(entry.entry_date)}
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                          <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline View for Mobile */}
                  <div className="mt-6 lg:hidden">
                    <div className="border-l-2 border-gray-200 pl-4 space-y-6">
                      {yearGroup.entries.map((entry, index) => (
                        <div key={entry.id} className="relative">
                          {/* Timeline Dot */}
                          <div className="absolute -left-6 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                          
                          {/* Entry Card */}
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedPhoto(entry)
                              setShowFullscreen(true)
                            }}
                          >
                            <div className="text-sm text-muted-foreground mb-1">
                              {format(parseISO(entry.entry_date), 'd MMMM yyyy', { locale: nl })}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex gap-3">
                                <img
                                  src={entry.photo_url}
                                  alt={entry.notes}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm text-foreground line-clamp-3">
                                    {entry.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fullscreen Photo Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Logboek Foto</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              {/* Full Size Photo */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.notes}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              
              {/* Photo Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(parseISO(selectedPhoto.entry_date), 'dd MMMM yyyy', { locale: nl })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{format(parseISO(selectedPhoto.entry_date), 'HH:mm', { locale: nl })}</span>
                  </div>
                  <span className="text-lg">{getSeasonEmoji(selectedPhoto.entry_date)}</span>
                </div>
                
                {/* Notes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Notities</h4>
                                          <p className="text-foreground whitespace-pre-wrap">{selectedPhoto.notes}</p>
                </div>
                
                {/* Metadata */}
                {selectedPhoto.plant_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">
                      🌱 {selectedPhoto.plant_name}
                    </Badge>
                    {selectedPhoto.plant_variety && (
                      <Badge variant="outline">
                        {selectedPhoto.plant_variety}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}