export interface PlantBedFormData {
  id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: "full-sun" | "partial-sun" | "shade"
  description: string
}

export interface PlantFormData {
  name: string
  scientificName?: string
  variety?: string
  color?: string
  height?: number
  plantingDate?: string
  expectedHarvestDate?: string
  status: "healthy" | "needs_attention" | "diseased" | "dead" | "harvested"
  notes?: string
  careInstructions?: string
  wateringFrequency?: number
  fertilizerSchedule?: string
}

export interface PlantBedPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}
