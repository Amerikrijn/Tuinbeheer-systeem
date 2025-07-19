"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Leaf, 
  TreePine, 
  Plus, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Sun,
  MapPin,
  Ruler,
  Shovel,
  Calendar,
  Eye,
  Settings
} from "lucide-react"
import { getGarden, getPlantBed, deletePlantBed } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"

export default function GardenPlantBedDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [garden, setGarden] = React.useState<Garden | null>(null)
  const [plantBed, setPlantBed] = React.useState<PlantBedWithPlants | null>(null)
  const [deleteDialog, setDeleteDialog] = React.useState(false)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [gardenData, plantBedData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBed(params.bedId as string),
        ])
        
        setGarden(gardenData)
        setPlantBed(plantBedData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het laden van de gegevens.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, params.bedId, toast])

  const handleDelete = async () => {
    if (!plantBed) return
    
    setDeleteLoading(true)
    try {
      await deletePlantBed(plantBed.id)
      
      toast({
        title: "Plantvak verwijderd",
        description: `Plantvak ${plantBed.id} (${plantBed.name}) is succesvol verwijderd.`,
      })
      
      router.push(`/gardens/${params.id}/plant-beds`)
    } catch (error) {
      console.error("Error deleting plant bed:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialog(false)
    }
  }

  const getSunExposureText = (sunExposure: string) => {
    switch (sunExposure) {
      case "full-sun":
        return "Volle zon (6+ uur)"
      case "partial-sun":
        return "Gedeeltelijke zon (3-6 uur)"
      case "shade":
        return "Schaduw (<3 uur)"
      default:
        return "Onbekend"
    }
  }

  const getSoilTypeText = (soilType: string) => {
    switch (soilType) {
      case "clay":
        return "Klei"
      case "sand":
        return "Zand"
      case "loam":
        return "Leem"
      case "mixed":
        return "Gemengd"
      default:
        return "Onbekend"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!garden || !plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <p className="text-gray-600 mb-4">Het plantvak dat je zoekt bestaat niet of is verwijderd.</p>
          <Link href={`/gardens/${params.id}/plant-beds`}>
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Plantvakken
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/gardens/${params.id}/plant-beds`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Plantvakken
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
              <Leaf className="h-8 w-8" />
              {plantBed.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Plantvak in {garden.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/edit`}>
            <Button variant="outline" className="bg-transparent">
              <Edit className="h-4 w-4 mr-2" />
              Bewerk Plantvak
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link href="/gardens" className="hover:text-green-600">Tuinen</Link>
        <span className="mx-2">→</span>
        <Link href={`/gardens/${garden.id}`} className="hover:text-green-600">{garden.name}</Link>
        <span className="mx-2">→</span>
        <Link href={`/gardens/${garden.id}/plant-beds`} className="hover:text-green-600">Plantvakken</Link>
        <span className="mx-2">→</span>
        <span className="font-medium">{plantBed.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plant Bed Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Plantvak Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plantBed.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Locatie:</span>
                    <span className="font-medium">{plantBed.location}</span>
                  </div>
                )}
                {plantBed.size && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Grootte:</span>
                    <span className="font-medium">{plantBed.size}</span>
                  </div>
                )}
                {plantBed.soil_type && (
                  <div className="flex items-center gap-2">
                    <Shovel className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Grondsoort:</span>
                    <span className="font-medium">{getSoilTypeText(plantBed.soil_type)}</span>
                  </div>
                )}
                {plantBed.sun_exposure && (
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Zonligging:</span>
                    <span className="font-medium">{getSunExposureText(plantBed.sun_exposure)}</span>
                  </div>
                )}
              </div>
              {plantBed.description && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Beschrijving:</div>
                  <p className="text-gray-800">{plantBed.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plants in this Plant Bed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  Planten ({plantBed.plants.length})
                </CardTitle>
                <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/plants/new`}>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Plant Toevoegen
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {plantBed.plants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plantBed.plants.map((plant) => (
                    <div key={plant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{plant.name}</h4>
                        <Badge 
                          variant={
                            plant.status === 'healthy' ? 'default' :
                            plant.status === 'needs_attention' ? 'secondary' : 'destructive'
                          }
                        >
                          {plant.status === 'healthy' ? 'Gezond' :
                           plant.status === 'needs_attention' ? 'Aandacht nodig' : 'Probleem'}
                        </Badge>
                      </div>
                      {plant.variety && (
                        <p className="text-sm text-gray-600 mb-2">Variëteit: {plant.variety}</p>
                      )}
                      {plant.notes && (
                        <p className="text-sm text-gray-700 mb-3">{plant.notes}</p>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/plants/${plant.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Bekijk
                          </Button>
                        </Link>
                        <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/plants/${plant.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Bewerk
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Dit plantvak heeft nog geen planten.</p>
                  <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/plants/new`}>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Plant Toevoegen
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/plants/new`}>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Plant Toevoegen
                </Button>
              </Link>
              
              <Link href={`/gardens/${params.id}/plant-beds/${plantBed.id}/edit`}>
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Plantvak Bewerken
                </Button>
              </Link>
              
              <Link href={`/gardens/${params.id}/plantvak-view`}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Visuele Weergave
                </Button>
              </Link>
              
              <Separator />
              
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialog(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Plantvak Verwijderen
              </Button>
            </CardContent>
          </Card>

          {/* Plant Bed Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Plantvak ID</div>
                <div className="font-mono text-sm">{plantBed.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Aantal Planten</div>
                <div className="font-medium">{plantBed.plants.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Aangemaakt</div>
                <div className="text-sm">{new Date(plantBed.created_at).toLocaleDateString('nl-NL')}</div>
              </div>
              {plantBed.updated_at && (
                <div>
                  <div className="text-sm text-gray-600">Laatst bijgewerkt</div>
                  <div className="text-sm">{new Date(plantBed.updated_at).toLocaleDateString('nl-NL')}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Weet je zeker dat je plantvak <strong>{plantBed.id}</strong> ({plantBed.name}) wilt verwijderen?
              </p>
              <p className="text-red-600 font-medium">
                Deze actie kan niet ongedaan worden gemaakt.
              </p>
              {plantBed.plants.length > 0 && (
                <p className="text-red-600">
                  Er zijn <strong>{plantBed.plants.length} planten</strong> in dit plantvak die ook permanent verwijderd
                  zullen worden.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Annuleren
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Definitief Verwijderen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}