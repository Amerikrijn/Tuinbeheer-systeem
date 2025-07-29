// Core Domain Types
export interface Tuin {
  id: string
  name: string
  description?: string
  location: string
  total_area?: string
  length?: string
  width?: string
  garden_type?: string
  established_date?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Visual properties
  canvas_width?: number
  canvas_height?: number
  grid_size?: number
  default_zoom?: number
  show_grid?: boolean
  snap_to_grid?: boolean
  background_color?: string
}

export interface Plantvak {
  id: string
  garden_id: string
  name: string
  location?: string
  size?: string
  soil_type?: string
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade'
  description?: string
  is_active?: boolean
  created_at: string
  updated_at: string
  // Visual properties
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  rotation?: number
  z_index?: number
  color_code?: string
  visual_updated_at?: string
}

export interface Bloem {
  id: string
  plant_bed_id: string
  name: string
  scientific_name?: string
  latin_name?: string
  variety?: string
  color?: string
  plant_color?: string
  height?: number
  plant_height?: number // in cm
  stem_length?: number
  plants_per_sqm?: number // aantal planten per vierkante meter
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  photo_url?: string
  category?: string
  bloom_period?: string
  planting_date?: string
  expected_harvest_date?: string
  status?: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst'
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
  // Visual designer properties
  position_x?: number
  position_y?: number
  visual_width?: number
  visual_height?: number
  emoji?: string
  is_custom?: boolean
  created_at: string
  updated_at: string
}

// Form Data Types
export interface TuinFormData {
  name: string
  description?: string
  location: string
  total_area?: string
  length?: string
  width?: string
  garden_type?: string
  established_date?: string
  notes?: string
}

export interface PlantvakFormData {
  id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: 'full-sun' | 'partial-sun' | 'shade'
  description: string
}

export interface BloemFormData {
  name: string
  latin_name?: string
  scientific_name?: string
  variety?: string
  color?: string
  plant_color?: string
  height?: number
  plant_height?: number
  plants_per_sqm?: number
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  planting_date?: string
  expected_harvest_date?: string
  status: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst'
  notes?: string
  care_instructions?: string
  watering_frequency?: number
  fertilizer_schedule?: string
}

// Composite Types
export interface PlantvakWithBloemen extends Plantvak {
  plants: Bloem[]
}

export interface TuinWithPlantvakken extends Tuin {
  plant_beds: PlantvakWithBloemen[]
}

// Visual Garden Types
export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface PlantvakPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface CanvasConfig {
  canvas_width: number
  canvas_height: number
  grid_size: number
  default_zoom: number
  show_grid: boolean
  snap_to_grid: boolean
  background_color: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
}

// Search and Filter Types
export interface SearchFilters {
  query?: string
  status?: string
  category?: string
  sun_exposure?: string
  soil_type?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Database Operation Types
export interface DatabaseOperation {
  type: 'create' | 'update' | 'delete'
  table: 'gardens' | 'plant_beds' | 'plants'
  id?: string
  data?: any
}

// Legacy type aliases for backward compatibility
export type Garden = Tuin
export type PlantBed = Plantvak
export type Plant = Bloem
export type PlantBedFormData = PlantvakFormData
export type PlantFormData = BloemFormData
export type PlantBedWithPlants = PlantvakWithBloemen
export type PlantBedPosition = PlantvakPosition