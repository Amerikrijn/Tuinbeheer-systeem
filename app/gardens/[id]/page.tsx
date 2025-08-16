"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useNavigation } from "@/hooks/use-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Leaf } from "lucide-react"
import { getGarden, getPlantBedsWithPlants } from "@/lib/database"
import type { Garden, PlantBedWithPlants } from "@/lib/supabase"
import { FlowerVisualization } from "@/components/flower-visualization"

interface Dimensions {
  width: number
  height: number
}

function PlantBedCard({ bed }: { bed: PlantBedWithPlants }) {
  const [dims, setDims] = useState<Dimensions>({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => {
      const element = document.getElementById(`bed-${bed.id}`)
      if (element) {
        setDims({ width: element.clientWidth, height: element.clientHeight })
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [bed.id])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{bed.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div id={`bed-${bed.id}`} className="relative w-full h-64 border rounded-md">
          <FlowerVisualization
            plantBed={bed}
            plants={bed.plants}
            containerWidth={dims.width}
            containerHeight={dims.height}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function GardenPage() {
  const params = useParams()
  const { goBack } = useNavigation()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [gardenData, bedsData] = await Promise.all([
          getGarden(params.id as string),
          getPlantBedsWithPlants(params.id as string),
        ])
        setGarden(gardenData)
        setPlantBeds(bedsData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return <div className="container mx-auto p-6">Laden...</div>
  }

  if (!garden) {
    return <div className="container mx-auto p-6">Tuin niet gevonden</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Terug
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Leaf className="h-8 w-8 text-green-600" />
          {garden.name}
        </h1>
      </div>
      {plantBeds.map((bed) => (
        <PlantBedCard key={bed.id} bed={bed} />
      ))}
    </div>
  )
}

