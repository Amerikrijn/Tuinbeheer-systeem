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
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Leaf, RefreshCw, Home, AlertCircle } from "lucide-react"
import { getMockPlantBeds } from "@/lib/mock-data"

interface NewPlantBed {
  id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: string
  description: string
  notes: string
}

export default function ConfigurePlantBedPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [existingIds, setExistingIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [newPlantBed, setNewPlantBed] = useState<NewPlantBed>({
    id: "",
    name: "",
    location: "",
    size: "Medium (5-15m²)",
    soilType: "",
    sunExposure: "full-sun",
    description: "",
    notes: "",
  })

  useEffect(() => {
    // Load existing plant bed IDs to prevent duplicates
    const beds = getMockPlantBeds()
    setExistingIds(beds.map((bed) => bed.id.toLowerCase()))
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!newPlantBed.id.trim()) {
      newErrors.id = "Plant bed ID is required"
    } else if (!/^[A-Z0-9]+$/i.test(newPlantBed.id)) {
      newErrors.id = "ID can only contain letters and numbers"
    } else if (existingIds.includes(newPlantBed.id.toLowerCase())) {
      newErrors.id = "This ID already exists, choose a different ID"
    }

    if (!newPlantBed.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!newPlantBed.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!newPlantBed.soilType.trim()) {
      newErrors.soilType = "Soil type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Form incomplete",
        description: "Please check the marked fields and try again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Plant bed created!",
        description: `Plant bed ${newPlantBed.id.toUpperCase()} (${newPlantBed.name}) has been successfully created.`,
      })

      // Navigate back to plant beds overview
      router.push("/admin/plant-beds")
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the plant bed.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNewPlantBed({
      id: "",
      name: "",
      location: "",
      size: "Medium (5-15m²)",
      soilType: "",
      sunExposure: "full-sun",
      description: "",
      notes: "",
    })
    setErrors({})
  }

  const sizeOptions = ["Small (< 5m²)", "Medium (5-15m²)", "Large (15-30m²)", "Extra large (> 30m²)"]

  const soilTypeOptions = [
    "Clay soil",
    "Sandy soil",
    "Loam soil",
    "Peat soil",
    "Potting soil",
    "Clay soil with compost",
    "Sandy soil with compost",
    "Humus-rich soil",
  ]

  const sunExposureOptions = [
    { value: "full-sun", label: "Full sun (6+ hours per day)" },
    { value: "partial-sun", label: "Partial sun (3-6 hours per day)" },
    { value: "shade", label: "Shade (< 3 hours per day)" },
  ]

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
          onClick={() => router.push("/admin/plant-beds")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Plant Beds Overview
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plus className="h-8 w-8 text-green-600" />
            Configure New Plant Bed
          </h1>
          <p className="text-gray-600">Add a new plant bed to the garden</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Plant Bed Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="id">Plant Bed ID *</Label>
                    <Input
                      id="id"
                      value={newPlantBed.id}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        setNewPlantBed((prev) => ({ ...prev, id: value }))
                        if (errors.id) {
                          setErrors((prev) => ({ ...prev, id: "" }))
                        }
                      }}
                      placeholder="E.g. A, B, C1, D2"
                      className={errors.id ? "border-red-500" : ""}
                      maxLength={5}
                      required
                    />
                    {errors.id && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.id}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Unique identification for the plant bed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Plant Bed Name *</Label>
                    <Input
                      id="name"
                      value={newPlantBed.name}
                      onChange={(e) => {
                        setNewPlantBed((prev) => ({ ...prev, name: e.target.value }))
                        if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: "" }))
                        }
                      }}
                      placeholder="E.g. Rose bed, Herb garden, Vegetable beds"
                      className={errors.name ? "border-red-500" : ""}
                      required
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newPlantBed.location}
                      onChange={(e) => {
                        setNewPlantBed((prev) => ({ ...prev, location: e.target.value }))
                        if (errors.location) {
                          setErrors((prev) => ({ ...prev, location: "" }))
                        }
                      }}
                      placeholder="E.g. North side of garden, By the shed, Main entrance"
                      className={errors.location ? "border-red-500" : ""}
                      required
                    />
                    {errors.location && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.location}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select
                      value={newPlantBed.size}
                      onValueChange={(value) => setNewPlantBed((prev) => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type *</Label>
                    <Select
                      value={newPlantBed.soilType}
                      onValueChange={(value) => {
                        setNewPlantBed((prev) => ({ ...prev, soilType: value }))
                        if (errors.soilType) {
                          setErrors((prev) => ({ ...prev, soilType: "" }))
                        }
                      }}
                    >
                      <SelectTrigger className={errors.soilType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypeOptions.map((soil) => (
                          <SelectItem key={soil} value={soil}>
                            {soil}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.soilType && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.soilType}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="sunExposure">Sun Exposure</Label>
                    <Select
                      value={newPlantBed.sunExposure}
                      onValueChange={(value) => setNewPlantBed((prev) => ({ ...prev, sunExposure: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sun exposure" />
                      </SelectTrigger>
                      <SelectContent>
                        {sunExposureOptions.map((exposure) => (
                          <SelectItem key={exposure.value} value={exposure.value}>
                            {exposure.label}
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
                    value={newPlantBed.description}
                    onChange={(e) => setNewPlantBed((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="General description of the plant bed..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newPlantBed.notes}
                    onChange={(e) => setNewPlantBed((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes, special instructions, etc..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plant Bed
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset Form
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/admin/plant-beds")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Tips for Creating Plant Beds</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="space-y-2 text-sm">
                <li>• Use short, clear IDs (A, B, C1, etc.)</li>
                <li>• Choose descriptive names for easy identification</li>
                <li>• Consider sun exposure when planning plant placement</li>
                <li>• Note soil conditions for future plant selection</li>
                <li>• Add detailed notes for maintenance instructions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">ID:</div>
                <div className="font-medium">{newPlantBed.id || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Name:</div>
                <div className="font-medium">{newPlantBed.name || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Location:</div>
                <div className="font-medium">{newPlantBed.location || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Size:</div>
                <div className="font-medium">{newPlantBed.size}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Soil Type:</div>
                <div className="font-medium">{newPlantBed.soilType || "Not selected"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
