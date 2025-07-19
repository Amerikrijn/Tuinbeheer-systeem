"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Sun,
  CloudSun,
  Cloud,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Home,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { getMockPlantBeds, type PlantBed } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PlantBedDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { goBack } = useNavigationHistory()
  const { toast } = useToast()
  const [plantBed, setPlantBed] = useState<PlantBed | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const loadPlantBed = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const beds = getMockPlantBeds()
        const bed = beds.find((b) => b.id === params.id)
        setPlantBed(bed || null)
      } catch (error) {
        console.error("Error loading plant bed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlantBed()
  }, [params.id])

  const handleDeletePlantBed = async () => {
    if (!plantBed) return

    setDeleteLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Plantvak verwijderd",
        description: `Plantvak ${plantBed.id} (${plantBed.name}) is succesvol verwijderd.`,
      })

      router.push("/admin/plant-beds")
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van het plantvak.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const getSunExposureIcon = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "partial-sun":
        return <CloudSun className="h-5 w-5 text-orange-500" />
      case "shade":
        return <Cloud className="h-5 w-5 text-gray-500" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  const getSunExposureText = (exposure: string) => {
    switch (exposure) {
      case "full-sun":
        return "Volle zon (6+ uur per dag)"
      case "partial-sun":
        return "Gedeeltelijke zon (3-6 uur per dag)"
      case "shade":
        return "Schaduw (< 3 uur per dag)"
      default:
        return "Onbekend"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!plantBed) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plantvak niet gevonden</h3>
          <p className="text-gray-600 mb-4">Het plantvak dat je zoekt bestaat niet of is verwijderd.</p>
          <Link href="/admin/plant-beds">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Overzicht
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Tuinbeheerscherm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/plant-beds")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Plantvakken Overzicht
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Badge variant="outline" className="text-2xl font-bold px-4 py-2">
                {plantBed.id}
              </Badge>
              {plantBed.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              {plantBed.location}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/plant-beds/${plantBed.id}/edit`}>
            <Button variant="outline" className="bg-transparent">
              <Edit className="h-4 w-4 mr-2" />
              Bewerk Plantvak
            </Button>
          </Link>
        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  {getSunExposureIcon(plantBed.sunExposure)}
                  <div>
                    <div className="font-medium">Zonlicht</div>
                    <div className="text-sm text-gray-600">{getSunExposureText(plantBed.sunExposure)}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium">Grootte</div>
                  <div className="text-sm text-gray-600">{plantBed.size}</div>
                </div>
                <div>
                  <div className="font-medium">Grondsoort</div>
                  <div className="text-sm text-gray-600">{plantBed.soilType}</div>
                </div>
              </div>

              {plantBed.description && (
                <>
                  <Separator />
                  <div>
                    <div className="font-medium mb-2">Beschrijving</div>
                    <div className="text-sm text-gray-600">{plantBed.description}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Plants Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Planten Overzicht ({plantBed.plants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plantBed.plants.length > 0 ? (
                <div className="space-y-3">
                  {plantBed.plants.map((plant) => (
                    <div key={plant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{plant.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {plant.color} • {plant.height}cm hoog • Geplant op{" "}
                          {new Date(plant.plantingDate).toLocaleDateString("nl-NL")}
                        </div>
                        {plant.notes && <div className="text-sm text-gray-500 mt-1">{plant.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{plant.status}</Badge>
                        <Link href={`/admin/plant-beds/${plantBed.id}/plants/${plant.id}/edit`}>
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
                  <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen planten</h3>
                  <p className="text-gray-600 mb-4">Dit plantvak heeft nog geen planten.</p>
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
              <CardTitle>Snelle Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/plant-beds/${plantBed.id}/edit`} className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Plantvak Bewerken
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                onClick={() => setDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Plantvak Verwijderen
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Plantvak ID</div>
                <div className="font-medium">{plantBed.id}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600">Aantal planten</div>
                <div className="font-medium">{plantBed.plants.length}</div>
              </div>

              <Separator />

              {plantBed.lastModifiedDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Laatst bewerkt
                  </div>
                  <div className="font-medium">{new Date(plantBed.lastModifiedDate).toLocaleDateString("nl-NL")}</div>
                  {plantBed.lastModifiedBy && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <User className="h-4 w-4" />
                      Door: {plantBed.lastModifiedBy}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Plantvak Verwijderen
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div>
                Weet je zeker dat je plantvak <strong>{plantBed.id}</strong> ({plantBed.name}) wilt verwijderen?
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Let op: Dit verwijdert ook alle planten!
                </div>
                <div className="text-red-700 text-sm">
                  Er zijn <strong>{plantBed.plants.length} planten</strong> in dit plantvak die ook permanent verwijderd
                  worden.
                </div>
              </div>
              <div className="text-sm text-gray-600">Deze actie kan niet ongedaan worden gemaakt.</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deleteLoading}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDeletePlantBed} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ja, Verwijderen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
