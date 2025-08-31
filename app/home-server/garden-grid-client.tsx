'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Trash2, Loader2, TreePine } from 'lucide-react'
import type { GardenWithDetails } from '@/lib/services/server/garden.service'

interface GardenGridClientProps {
  initialGardens: GardenWithDetails[]
  currentPage: number
  totalPages: number
}

export function GardenGridClient({ 
  initialGardens, 
  currentPage, 
  totalPages 
}: GardenGridClientProps) {
  const router = useRouter()
  const [gardens, setGardens] = useState(initialGardens)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (gardenId: string, gardenName: string) => {
    if (!confirm(`Weet u zeker dat u "${gardenName}" wilt verwijderen?`)) {
      return
    }
    
    setDeletingId(gardenId)
    
    try {
      const response = await fetch(`/api/gardens/${gardenId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setGardens(prev => prev.filter(g => g.id !== gardenId))
        router.refresh() // Refresh server data
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (page: number) => {
    router.push(`/home-server?page=${page}`)
  }

  if (gardens.length === 0) {
    return (
      <div className="text-center py-12">
        <TreePine className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Geen tuinen gevonden</h3>
        <p className="text-muted-foreground mb-4">
          Maak uw eerste tuin aan om te beginnen
        </p>
        <Button asChild>
          <Link href="/gardens/new">Nieuwe tuin aanmaken</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {gardens.map((garden) => (
          <Link 
            key={garden.id} 
            href={`/gardens/${garden.id}`}
            className="block h-full"
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer relative">
              {deletingId === garden.id && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-lg flex items-center justify-center z-10">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {garden.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{garden.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {garden.total_plant_count || 0}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plantvakken</span>
                    <span className="font-medium">{garden.plant_bed_count || 0}</span>
                  </div>
                  
                  {garden.plant_beds && garden.plant_beds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {garden.plant_beds.slice(0, 3).map((bed) => (
                        <Badge 
                          key={bed.id} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {bed.letter_code}
                        </Badge>
                      ))}
                      {garden.plant_beds.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{garden.plant_beds.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {garden.length && garden.width 
                      ? `${garden.length}m × ${garden.width}m`
                      : 'Geen afmetingen'}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDelete(garden.id, garden.name)
                    }}
                    disabled={deletingId === garden.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Vorige
          </Button>
          
          <div className="flex items-center px-4">
            Pagina {currentPage} van {totalPages}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Volgende
          </Button>
        </div>
      )}
    </>
  )
}