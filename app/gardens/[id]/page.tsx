"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
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
  TreePine,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Leaf,
  Home,
  Eye,
} from "lucide-react"
import { getGarden, getPlantBeds, deleteGarden } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function GardenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const handleDeleteGarden = async () => {
    if (!garden) return

    setDeleteLoading(true)

    try {
      await deleteGarden(garden.id)

      toast({
        title: "Tuin verwijderd",
        description: `Tuin "${garden.name}" is succesvol verwijderd.`,
      })

      router.push("/gardens")
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de tuin.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
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

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tuin niet gevonden</h3>
          <p className="text-gray-600 mb-4">De tuin die je zoekt bestaat niet of is verwijderd.</p>
          <Link href="/gardens">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Overzicht
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalPlants = plantBeds.reduce((sum, bed) => sum + bed.plants.length, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/gardens")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Tuinen Overzicht
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TreePine className="h-8 w-8 text-green-600" />
              {garden.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              {garden.location}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/gardens/${garden.id}/edit`}>
            <Button variant="outline" className="bg-transparent">
              <Edit className="h-4 w-4 mr-2" />
              Bewerk Tuin
            </Button>
          </Link>
          <Link href={`/gardens/${garden.id}/plant-beds`}>
            <Button className="bg-green-600 hover:bg-green-700">
              <Leaf className="h-4 w-4 mr-2" />
              Plantvakken
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Garden Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-600" />
                Tuin Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(garden.total_area || (garden.length && garden.width)) && (
                  <div>
                    <div className="font-medium">Oppervlakte</div>
                    <div className="text-sm text-gray-600">
                      {garden.total_area || 
                        (garden.length && garden.width && 
                          `${(parseFloat(garden.length) * parseFloat(garden.width)).toFixed(1)} m²`
                        )
                      }
                    </div>
                  </div>
                )}
                {garden.length && garden.width && (
                  <div>
                    <div className="font-medium">Afmetingen</div>
                    <div className="text-sm text-gray-600">
                      {garden.length} × {garden.width} m
                    </div>
                  </div>
                )}
                {garden.garden_type && (
                  <div>
                    <div className="font-medium">Type</div>
                    <div className="text-sm text-gray-600">{garden.garden_type}</div>
                  </div>
                )}
              </div>

              {garden.description && (
                <>
                  <Separator />
                  <div>
                    <div className="font-medium mb-2">Beschrijving</div>
                    <div className="text-sm text-gray-600">{garden.description}</div>
                  </div>
                </>
              )}



              {garden.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="font-medium mb-2">Notities</div>
                    <div className="text-sm text-gray-600">{garden.notes}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Plant Beds Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-blue-600" />
                  Plantvakken Overzicht ({plantBeds.length})
                </CardTitle>
                <Link href={`/gardens/${garden.id}/plant-beds`}>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Alle Plantvakken
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {plantBeds.length > 0 ? (
                <div className="space-y-3">
                  {plantBeds.slice(0, 5).map((bed) => (
                    <div key={bed.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <Badge variant="outline">{bed.id}</Badge>
                          {bed.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {bed.location} • {bed.plants.length} planten
                        </div>
                      </div>
                      <Link href={`/gardens/${garden.id}/plant-beds/${bed.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Bekijk
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {plantBeds.length > 5 && (
                    <div className="text-center pt-2">
                      <Link href={`/gardens/${garden.id}/plant-beds`}>
                        <Button variant="outline" size="sm">
                          Bekijk alle {plantBeds.length} plantvakken
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen plantvakken</h3>
                  <p className="text-gray-600 mb-4">Begin met het toevoegen van je eerste plantvak aan deze tuin.</p>
                  <Link href={`/gardens/${garden.id}/plant-beds/new`}>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Plantvak Toevoegen
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
              <CardTitle>Snelle Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/gardens/${garden.id}/plant-beds`} className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Leaf className="h-4 w-4 mr-2" />
                  Plantvakken Beheren
                </Button>
              </Link>
              <Link href={`/gardens/${garden.id}/edit`} className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Tuin Bewerken
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                onClick={() => setDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tuin Verwijderen
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistieken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Aantal plantvakken</div>
                <div className="text-2xl font-bold text-green-600">{plantBeds.length}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600">Totaal planten</div>
                <div className="text-2xl font-bold text-blue-600">{totalPlants}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600">Bezettingsgraad</div>
                <div className="text-2xl font-bold text-purple-600">
                  {plantBeds.length > 0
                    ? Math.round((plantBeds.filter((bed) => bed.plants.length > 0).length / plantBeds.length) * 100)
                    : 0}
                  %
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {garden.established_date && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Opgericht
                  </div>
                  <div className="font-medium">{new Date(garden.established_date).toLocaleDateString("nl-NL")}</div>
                </div>
              )}

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  Laatst bewerkt
                </div>
                <div className="font-medium">{new Date(garden.updated_at).toLocaleDateString("nl-NL")}</div>
              </div>
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
              Tuin Verwijderen
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div>
                Weet je zeker dat je tuin <strong>"{garden.name}"</strong> wilt verwijderen?
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Let op: Dit verwijdert ook alle plantvakken en planten!
                </div>
                <div className="text-red-700 text-sm">
                  Er zijn <strong>{plantBeds.length} plantvakken</strong> en <strong>{totalPlants} planten</strong> in
                  deze tuin die ook permanent verwijderd worden.
                </div>
              </div>
              <div className="text-sm text-gray-600">Deze actie kan niet ongedaan worden gemaakt.</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deleteLoading}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDeleteGarden} disabled={deleteLoading}>
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
