"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Calendar, MapPin, Leaf, ChevronLeft, ChevronRight, X } from "lucide-react"
import { LogbookService } from "@/lib/services/database.service"
import type { LogbookEntryWithDetails } from "@/lib/types/index"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"

interface PlantPhotoGalleryProps {
  plantId: string
  plantName: string
  className?: string
}

interface PhotoData {
  photos: LogbookEntryWithDetails[]
  totalCount: number
  hasMorePhotos: boolean
}

export function PlantPhotoGallery({ plantId, plantName, className }: PlantPhotoGalleryProps) {
  const [photoData, setPhotoData] = useState<PhotoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<LogbookEntryWithDetails | null>(null)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Load photos for the plant
  useEffect(() => {
    loadPlantPhotos()
  }, [plantId, currentYear])

  const loadPlantPhotos = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await LogbookService.getPlantPhotos(plantId, currentYear)
      
      if (!result.success) {
        setError(result.error || 'Fout bij laden van foto\'s')
        return
      }
      
      setPhotoData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoClick = (photo: LogbookEntryWithDetails) => {
    setSelectedPhoto(photo)
    setShowPhotoDialog(true)
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentYear(prev => prev + 1)
    }
  }

  const formatPhotoDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'd MMMM yyyy', { locale: nl })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className={{`${className} border-2 border-green-200 bg-green-50 dark:bg-green-950/30`}>
        <CardHeader>
          <CardTitle className=""flex items-center gap-2 text-green-800">
            <Camera className=""w-5 h-5 text-blue-600 dark:text-blue-400" />
            Foto's van {plantName}
          </CardTitle>
        </CardHeader>
                  <CardContent>
            <div className=""animate-pulse grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className=""aspect-square bg-green-100 dark:bg-green-900/30 rounded-lg" />
              ))}
            </div>
          </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={{`${className} border-2 border-green-200 bg-green-50 dark:bg-green-950/30`}>
        <CardHeader>
          <CardTitle className=""flex items-center gap-2 text-green-800">
            <Camera className=""w-5 h-5 text-blue-600 dark:text-blue-400" />
            Foto's van {plantName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=""text-center py-6">
            <Camera className=""w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className=""text-muted-foreground mb-3">Fout bij laden van foto's</p>
            <Button 
              variant="outline" 
              className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black border-green-600"
              onClick={loadPlantPhotos}
            >
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!photoData || photoData.photos.length === 0) {
    return (
      <Card className={{`${className} border-2 border-green-200 bg-green-50 dark:bg-green-950/30`}>
        <CardHeader>
          <CardTitle className=""flex items-center gap-2 text-green-800">
            <Camera className=""w-5 h-5 text-blue-600 dark:text-blue-400" />
            Foto's van {plantName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=""text-center py-6">
            <Camera className=""w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className=""text-muted-foreground">Nog geen foto's van deze plant</p>
            <p className=""text-sm text-muted-foreground mt-1">Foto's worden getoond wanneer je logboek entries toevoegt</p>
            <Button 
              variant="outline" 
              className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black border-green-600 mt-3"
              onClick={() => {
                // TODO: Navigate to logbook new entry form

              }}
            >
              Eerste foto toevoegen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={{`${className} border-2 border-green-200 bg-green-50 dark:bg-green-950/30`}>
        <CardHeader>
          <div className=""flex items-center justify-between">
            <CardTitle className=""flex items-center gap-2 text-green-800">
              <Camera className=""w-5 h-5 text-blue-600 dark:text-blue-400" />
              Foto's van {plantName}
            </CardTitle>
            
            {/* Year navigation */}
            <div className=""flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className=""border-green-300 dark:border-green-700 hover:bg-green-100"
                onClick={() => navigateYear('prev')}
                disabled={currentYear <= 2020}
              >
                <ChevronLeft className=""w-4 h-4" />
              </Button>
              
              <Badge variant="outline" className=""px-3 py-1 border-green-300 dark:border-green-700 bg-green-100 text-green-800">
                {currentYear}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                className=""border-green-300 dark:border-green-700 hover:bg-green-100"
                onClick={() => navigateYear('next')}
                disabled={currentYear >= new Date().getFullYear()}
              >
                <ChevronRight className=""w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className=""flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <span>{photoData.totalCount} foto's dit jaar</span>
            {photoData.hasMorePhotos && (
              <Badge variant="secondary" className=""text-xs bg-green-200 text-green-800">
                +{photoData.totalCount - 12} meer
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className=""grid grid-cols-2 md:grid-cols-3 gap-4">
            {photoData.photos.map((photo, index) => (
              <div
                key={photo.id}
                className=""group relative aspect-square cursor-pointer overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 min-h-[120px]"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.photo_url!}
                  alt={`Foto van ${plantName} op ${formatPhotoDate(photo.entry_date)}`}
                  className=""h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                
                {/* Overlay with date */}
                <div className=""absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                <div className=""absolute bottom-0 left-0 right-0 p-2 text-white dark:text-black text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className=""flex items-center gap-1">
                    <Calendar className=""w-3 h-3" />
                    {formatPhotoDate(photo.entry_date)}
                  </div>
                </div>
                
                {/* Click indicator */}
                <div className=""absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className=""w-6 h-6 text-white dark:text-black drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
          
          {/* More photos button */}
          {photoData.hasMorePhotos && (
            <div className=""mt-4 text-center">
              <Button
                variant="outline"
                className=""bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black border-green-600"
                onClick={() => {
                  // TODO: Navigate to logbook with plant filter

                }}
              >
                Alle {photoData.totalCount} foto's bekijken
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo detail dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className=""max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className=""flex items-center gap-2 text-green-800">
              <Camera className=""w-5 h-5 text-blue-600 dark:text-blue-400" />
              Foto van {plantName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className=""space-y-4">
              {/* Large photo */}
              <div className=""relative">
                <img
                  src={selectedPhoto.photo_url!}
                  alt={`Foto van ${plantName} op ${formatPhotoDate(selectedPhoto.entry_date)}`}
                  className=""w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
                
                {/* Close button */}
                <Button
                  variant="outline"
                  size="sm"
                  className=""absolute top-2 right-2 bg-background/90 hover:bg-background border-green-300 dark:border-green-700"
                  onClick={() => setShowPhotoDialog(false)}
                >
                  <X className=""w-4 h-4" />
                </Button>
              </div>
              
              {/* Photo details */}
              <div className=""grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className=""space-y-2">
                  <div className=""flex items-center gap-2">
                    <Calendar className=""w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className=""font-medium text-green-800">Datum:</span>
                    <span className=""text-green-700 dark:text-green-300">{formatPhotoDate(selectedPhoto.entry_date)}</span>
                  </div>
                  
                  <div className=""flex items-center gap-2">
                    <MapPin className=""w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className=""font-medium text-green-800">Locatie:</span>
                    <span className=""text-green-700 dark:text-green-300">{selectedPhoto.plant_bed_name}</span>
                  </div>
                  
                  <div className=""flex items-center gap-2">
                    <Leaf className=""w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className=""font-medium text-green-800">Plant:</span>
                    <span className=""text-green-700 dark:text-green-300">{selectedPhoto.plant_name || plantName}</span>
                  </div>
                </div>
                
                <div className=""space-y-2">
                  <div>
                    <span className=""font-medium text-green-800">Notities:</span>
                    <p className=""text-green-700 dark:text-green-300 mt-1 bg-green-50 dark:bg-green-950 p-2 rounded">
                      {selectedPhoto.notes || 'Geen notities toegevoegd'}
                    </p>
                  </div>
                  
                  {selectedPhoto.plant_variety && (
                    <div>
                      <span className=""font-medium text-green-800">Variëteit:</span>
                      <p className=""text-green-700 dark:text-green-300 mt-1 bg-green-50 dark:bg-green-950 p-2 rounded">
                        {selectedPhoto.plant_variety}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}