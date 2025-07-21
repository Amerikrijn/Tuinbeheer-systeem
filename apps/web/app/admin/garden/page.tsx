"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, TreePine, RefreshCw, Save, Home, Calendar, User, MapPin, Ruler } from "lucide-react"
import { getMockGarden, getMockPlantBeds, type Garden } from "@/lib/mock-data"

interface EditGarden {
  name: string
  description: string
  totalArea: string
  length: string
  width: string
  location: string
  gardenType: string
  notes: string
}

export default function GardenPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [garden, setGarden] = useState<Garden | null>(null)

  const [editGarden, setEditGarden] = useState<EditGarden>({
    name: "",
    description: "",
    totalArea: "",
    length: "",
    width: "",
    location: "",
    gardenType: "",
    notes: "",
  })

  useEffect(() => {
    const loadGarden = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const gardenData = getMockGarden()
        setGarden(gardenData)
        setEditGarden({
          name: gardenData.name,
          description: gardenData.description,
          totalArea: gardenData.totalArea,
          length: gardenData.length,
          width: gardenData.width,
          location: gardenData.location,
          gardenType: gardenData.gardenType,
          notes: gardenData.notes || "",
        })
      } catch (error) {
        console.error("Error loading garden:", error)
      } finally {
        setPageLoading(false)
      }
    }

    loadGarden()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!editGarden.name || !editGarden.location) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Garden updated!",
        description: `${editGarden.name} has been successfully updated.`,
      })

      router.push("/gardens")
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the garden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const gardenTypeOptions = [
    "Community garden",
    "School garden",
    "Corporate garden",
    "Neighborhood garden",
    "Therapeutic garden",
    "Educational garden",
  ]



  // Calculate statistics
  const plantBeds = getMockPlantBeds()
  const totalPlants = plantBeds.reduce((sum, bed) => sum + bed.plants.length, 0)
  const totalBeds = plantBeds.length

  if (pageLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TreePine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Garden not found</h3>
          <p className="text-gray-600 mb-4">There was a problem loading the garden data.</p>
          <Button onClick={() => router.push("/gardens")} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gardens
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Garden Management
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/gardens")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Gardens Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TreePine className="h-8 w-8 text-green-600" />
            Garden Management
          </h1>
          <p className="text-gray-600">Manage general garden information and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                Garden Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Garden Name *</Label>
                    <Input
                      id="name"
                      value={editGarden.name}
                      onChange={(e) => setEditGarden((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Name of the garden"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={editGarden.location}
                      onChange={(e) => setEditGarden((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Address of the garden"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      value={editGarden.length}
                      onChange={(e) => setEditGarden((prev) => ({ ...prev, length: e.target.value }))}
                      placeholder="E.g. 30m"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      value={editGarden.width}
                      onChange={(e) => setEditGarden((prev) => ({ ...prev, width: e.target.value }))}
                      placeholder="E.g. 15m"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalArea">Total Area</Label>
                    <Input
                      id="totalArea"
                      value={editGarden.totalArea}
                      onChange={(e) => setEditGarden((prev) => ({ ...prev, totalArea: e.target.value }))}
                      placeholder="E.g. 450m², 0.5 hectare"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gardenType">Garden Type</Label>
                    <Select
                      value={editGarden.gardenType}
                      onValueChange={(value) => setEditGarden((prev) => ({ ...prev, gardenType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select garden type" />
                      </SelectTrigger>
                      <SelectContent>
                        {gardenTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editGarden.description}
                    onChange={(e) => setEditGarden((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="General description of the garden..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editGarden.notes}
                    onChange={(e) => setEditGarden((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes, special instructions, etc..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Garden
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/gardens")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                Current Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Number of plant beds</div>
                <div className="text-2xl font-bold text-green-600">{totalBeds}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600">Total plants</div>
                <div className="text-2xl font-bold text-blue-600">{totalPlants}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600">Area</div>
                <div className="font-medium">{garden.totalArea}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600">Garden type</div>
                <div className="font-medium">{garden.gardenType}</div>
              </div>
            </CardContent>
          </Card>

          {/* Garden Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                Garden Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  Established
                </div>
                <div className="font-medium">{new Date(garden.establishedDate).toLocaleDateString("en-US")}</div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <div className="font-medium text-sm">{garden.location}</div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  Last modified
                </div>
                <div className="font-medium">{new Date(garden.lastModifiedDate).toLocaleDateString("en-US")}</div>
                {garden.lastModifiedBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <User className="h-4 w-4" />
                    By: {garden.lastModifiedBy}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push(`/gardens/${garden?.id || ''}`)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Garden Layout
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push("/gardens")}
              >
                <TreePine className="h-4 w-4 mr-2" />
                All Gardens
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
