"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useNavigation } from "@/hooks/use-navigation"
import { useViewPreference } from "@/hooks/use-view-preference"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, TreePine, Plus, Search, Eye, Leaf, Sun, MapPin, Grid3X3, BookOpen, Trash2 } from "lucide-react"
import { getGarden, getPlantBeds, deletePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PlantBedsPage() {
  const { goBack, navigateTo } = useNavigation()
  const { isVisualView, toggleView } = useViewPreference()
  const params = useParams()
  const { toast } = useToast()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantBedToDelete, setPlantBedToDelete] = useState<PlantBedWithPlants | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [gardenData, plantBedsData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBeds(params.id as string),
        ])
        setGarden(gardenData)
        setPlantBeds(plantBedsData)
      } catch (error) {

        toast({
          title: "Fout",
          description: "Kon gegevens niet laden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, toast])

  const filteredPlantBeds = plantBeds.filter(
    (bed) =>
      bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (bed: PlantBedWithPlants) => {
    setPlantBedToDelete(bed)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!plantBedToDelete) return

    try {
      await deletePlantBed(plantBedToDelete.id)
      
      // Remove from local state
      setPlantBeds(prev => prev.filter(bed => bed.id !== plantBedToDelete.id))
      
      toast({
        title: "Plantvak verwijderd",
        description: `Plantvak ${plantBedToDelete.letter_code || plantBedToDelete.name} is succesvol verwijderd.`,
      })
    } catch (error) {

      toast({
        title: "Fout",
        description: "Kon het plantvak niet verwijderen.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPlantBedToDelete(null)
    }
  }

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return <Sun className="h-4 w-4 text-yellow-500" />
      case "partial-sun":
        return <Sun className="h-4 w-4 text-orange-500" />
      case "shade":
        return <Sun className="h-4 w-4 text-muted-foreground" />
      default:
        return <Sun className="h-4 w-4 text-muted-foreground/50" />
    }
  }

  const getSunExposureText = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return "Volle zon"
      case "partial-sun":
        return "Gedeeltelijke zon"
      case "shade":
        return "Schaduw"
      default:
        return "Onbekend"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Tuin niet gevonden</h3>
          <p className="text-muted-foreground mb-4">De tuin die je zoekt bestaat niet of is verwijderd.</p>
          <Link href="/gardens">
            <Button className="bg-green-600 dark:bg-green-700 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Tuinen
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
              Plantvakken - {garden.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              {garden.location}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isVisualView ? "default" : "outline"}
            size="sm"
            onClick={toggleView}
            className="px-2"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            {isVisualView ? "Lijst" : "Visueel"}
          </Button>
          <Link href={`/gardens/${garden.id}/plant-beds/new`}>
            <Button className="bg-green-600 dark:bg-green-700 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Plantvak
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
        <Input
          placeholder="Zoek plantvakken..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Plant Beds Grid */}
      {filteredPlantBeds.length > 0 ? (
        <div className={isVisualView 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
        }>
          {filteredPlantBeds.map((bed) => (
            <Card key={bed.id} className={`hover:shadow-md transition-shadow ${
              !isVisualView ? 'mb-2' : 'h-full flex flex-col'
            }`}>
              <CardContent className={`${isVisualView ? "p-4" : "p-3"} ${isVisualView ? "flex-1 flex flex-col" : ""}`}>
{isVisualView ? (
                  // Visual view - full content
                  <>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🌱</span>
                          <div>
                            <h3 className="font-medium text-foreground">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 font-bold rounded-full mr-2">
                                {bed.letter_code || bed.name}
                              </span>
                              Plantvak {bed.letter_code || bed.name}
                            </h3>
                            {bed.location && (
                              <p className="text-sm text-muted-foreground">{bed.location}</p>
                            )}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full border-2 ${bed.plants.length > 0 ? 'border-green-500 shadow-green-200' : 'border-gray-500 dark:border-gray-400 shadow-gray-200'}`}></div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        {bed.size && (
                          <div className="flex justify-between">
                            <span>Grootte:</span>
                            <span>{bed.size}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Planten:</span>
                          <span>{bed.plants.length}</span>
                        </div>
                        {bed.soil_type && (
                          <div className="flex justify-between">
                            <span>Grondtype:</span>
                            <span className="capitalize">{bed.soil_type}</span>
                          </div>
                        )}
                        {bed.sun_exposure && (
                          <div className="flex justify-between items-center">
                            <span>Zon:</span>
                            <div className="flex items-center gap-1">
                              {getSunExposureIcon(bed.sun_exposure)}
                              <span>{getSunExposureText(bed.sun_exposure)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Show flower emojis preview */}
                      {bed.plants.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mb-4">
                          {bed.plants.slice(0, 6).map((plant, index) => (
                            <span key={index} className="text-lg" title={plant.name}>
                              {plant.emoji || '🌸'}
                            </span>
                          ))}
                          {bed.plants.length > 6 && (
                            <span className="text-xs text-muted-foreground ml-1">+{bed.plants.length - 6}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // List view - compact content
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xl">🌱</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 text-sm font-bold rounded-full mr-2">
                            {bed.letter_code || bed.name}
                          </span>
                          Plantvak {bed.letter_code || bed.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{bed.plants.length} planten</span>
                          {bed.size && <span>Grootte: {bed.size}</span>}
                          {bed.sun_exposure && (
                            <div className="flex items-center gap-1">
                              {getSunExposureIcon(bed.sun_exposure)}
                              <span>{getSunExposureText(bed.sun_exposure)}</span>
                            </div>
                          )}
                        </div>
                        {bed.plants.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {bed.plants.slice(0, 4).map((plant, index) => (
                              <span key={index} className="text-sm" title={plant.name}>
                                {plant.emoji || '🌸'}
                              </span>
                            ))}
                            {bed.plants.length > 4 && (
                              <span className="text-xs text-muted-foreground ml-1">+{bed.plants.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full border-2 ml-3 flex-shrink-0 ${bed.plants.length > 0 ? 'border-green-500 shadow-green-200' : 'border-gray-500 dark:border-gray-400 shadow-gray-200'}`}></div>
                  </div>
                )}

{isVisualView ? (
                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigateTo(`/gardens/${garden.id}/plantvak-view/${bed.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijk
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigateTo(`/logbook/new?plant_bed_id=${bed.id}`)}
                      title="Logboek entry toevoegen"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(bed)}
                      title="Plantvak verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1 justify-end mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigateTo(`/gardens/${garden.id}/plantvak-view/${bed.id}`)}
                      className="px-2 h-7"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigateTo(`/logbook/new?plant_bed_id=${bed.id}`)}
                      className="px-2 h-7"
                      title="Logboek entry toevoegen"
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(bed)}
                      className="px-2 h-7"
                      title="Plantvak verwijderen"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">
            {searchTerm ? "Geen plantvakken gevonden" : "Nog geen plantvakken"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? `Geen plantvakken gevonden voor "${searchTerm}"`
              : "Begin met het toevoegen van je eerste plantvak"}
          </p>
          {!searchTerm && (
            <div className="flex gap-2 justify-center">
              <Link href="/plant-beds/new">
                <Button className="bg-green-600 dark:bg-green-700 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Plantvak Toevoegen
                </Button>
              </Link>
              <Link href={`/gardens/${garden.id}/plant-beds/new`}>
                <Button className="bg-green-600 dark:bg-green-700 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Eerste Plantvak Toevoegen
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {plantBeds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overzicht Plantvakken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{plantBeds.length}</div>
                <div className="text-sm text-muted-foreground">Totaal Plantvakken</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {plantBeds.reduce((sum, bed) => sum + Math.max(1, bed.plants.length), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Totaal Planten</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {plantBeds.length}
                </div>
                <div className="text-sm text-muted-foreground">Actieve Vakken</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">Bezettingsgraad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plantvak verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je plantvak <strong>{plantBedToDelete?.letter_code || plantBedToDelete?.name}</strong> wilt verwijderen?
              {plantBedToDelete?.plants && plantBedToDelete.plants.length > 0 && (
                <span className="block mt-2 text-red-600 dark:text-red-400">
                  Let op: Dit plantvak bevat {plantBedToDelete.plants.length} plant{plantBedToDelete.plants.length === 1 ? '' : 'en'}. 
                  Deze zullen ook worden verwijderd.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
