


import { createClient } from '@supabase/supabase-js';

// Get configuration based on environment
function getSupabaseConfig() {
  // Check if we're in test environment
  const isTest = process.env.APP_ENV === 'test' || process.env.NODE_ENV === 'test';
  
  if (isTest) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL_TEST || 'https://dwsgwqosmihsfaxuheji.supabase.co',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
    };
  } else {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY'
    };
  }
}

function getCurrentEnvironment() {
  return process.env.APP_ENV === 'test' || process.env.NODE_ENV === 'test' ? 'test' : 'prod';
}

// Get environment-specific configuration
const config = getSupabaseConfig();

// Validate configuration
if (!config.url || !config.anonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ===================================================================
// SUPABASE CLIENT SETUP
// ===================================================================

export const supabase = createClient(config.url, config.anonKey);

// ===================================================================
// EXISTING TYPES (Extended for Visual Garden Designer)
// ===================================================================

export interface Garden {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // NEW: Visual Garden Designer fields
  canvas_width?: number;
  canvas_height?: number;
  grid_size?: number;
  default_zoom?: number;
  show_grid?: boolean;
  snap_to_grid?: boolean;
  background_color?: string;
}

export interface PlantBed {
  id: string;
  garden_id: string;
  name: string;
  description?: string;
  location?: string;
  size_m2?: number;
  created_at: string;
  updated_at: string;
  // NEW: Visual Garden Designer fields
  position_x?: number;
  position_y?: number;
  visual_width?: number;
  visual_height?: number;
  rotation?: number;
  z_index?: number;
  color_code?: string;
  visual_updated_at?: string;
}

export interface Plant {
  id: string;
  plant_bed_id: string;
  name: string;
  species?: string;
  description?: string;
  planted_date?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// NEW TYPES FOR VISUAL GARDEN DESIGNER
// ===================================================================

// Position and dimensions
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Canvas configuration
export interface CanvasConfig {
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  default_zoom: number;
  show_grid: boolean;
  snap_to_grid: boolean;
  background_color: string;
}

// Plant bed with visual properties
export interface PlantBedWithPosition extends PlantBed {
  position_x: number;
  position_y: number;
  visual_width: number;
  visual_height: number;
  rotation: number;
  z_index: number;
  color_code: string;
  visual_updated_at: string;
}

// Visual garden complete data
export interface VisualGardenData {
  garden_id: string;
  garden_name: string;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  default_zoom: number;
  show_grid: boolean;
  snap_to_grid: boolean;
  background_color: string;
  plant_bed_id: string;
  plant_bed_name: string;
  position_x: number;
  position_y: number;
  visual_width: number;
  visual_height: number;
  rotation: number;
  z_index: number;
  color_code: string;
  visual_updated_at: string;
  plant_count: number;
}

// Position update requests
export interface UpdatePositionRequest {
  position_x: number;
  position_y: number;
  visual_width?: number;
  visual_height?: number;
  rotation?: number;
  z_index?: number;
  color_code?: string;
}

export interface BulkUpdatePositionsRequest {
  positions: Array<{
    id: string;
    position_x: number;
    position_y: number;
    visual_width?: number;
    visual_height?: number;
    rotation?: number;
    z_index?: number;
    color_code?: string;
  }>;
}

// Canvas update requests
export interface UpdateCanvasConfigRequest {
  canvas_width?: number;
  canvas_height?: number;
  grid_size?: number;
  default_zoom?: number;
  show_grid?: boolean;
  snap_to_grid?: boolean;
  background_color?: string;
}

// Drag and drop state
export interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  dragOffset: Position;
  startPosition: Position;
  currentPosition: Position;
}

// Canvas state
export interface CanvasState {
  zoomLevel: number;
  gridSize: number;
  canvasSize: Size;
  isDragging: boolean;
  selectedPlantBed: string | null;
  plantBedPositions: Map<string, Position>;
  showGrid: boolean;
  snapToGrid: boolean;
}

// Collision detection
export interface CollisionBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===================================================================
// UTILITY TYPES
// ===================================================================

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Database operation results
export interface DatabaseResult<T> {
  data: T[];
  error: Error | null;
  count: number | null;
}

// Garden with plant beds
export interface GardenWithPlantBeds extends Garden {
  plant_beds: PlantBedWithPosition[];
}

// Plant bed with plants
export interface PlantBedWithPlants extends PlantBedWithPosition {
  plants: Plant[];
}

// Complete garden data
export interface CompleteGardenData extends Garden {
  plant_beds: PlantBedWithPlants[];
}

// Visual garden summary
export interface VisualGardenSummary {
  garden: Garden;
  plant_beds: PlantBedWithPosition[];
  canvas_config: CanvasConfig;
  statistics: {
    total_plant_beds: number;
    total_plants: number;
    total_area: number;
    canvas_utilization: number;
  };
}

// ===================================================================
// VALIDATION TYPES
// ===================================================================

// Position validation
export interface PositionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Canvas validation
export interface CanvasValidation {
  isValid: boolean;
  errors: string[];
  canvasSize: Size;
  maxElements: number;
}

// Collision validation
export interface CollisionValidation {
  hasCollision: boolean;
  collidingElements: string[];
  suggestedPosition?: Position;
}

// ===================================================================
// EVENT TYPES
// ===================================================================

// Drag events
export interface DragStartEvent {
  elementId: string;
  startPosition: Position;
  elementSize: Size;
}

export interface DragMoveEvent {
  elementId: string;
  currentPosition: Position;
  deltaPosition: Position;
}

export interface DragEndEvent {
  elementId: string;
  finalPosition: Position;
  wasValidDrop: boolean;
}

// Canvas events
export interface CanvasClickEvent {
  position: Position;
  elementId: string | null;
  isDoubleClick: boolean;
}

export interface CanvasZoomEvent {
  zoomLevel: number;
  zoomDelta: number;
  centerPoint: Position;
}

// ===================================================================
// COMPONENT PROPS TYPES
// ===================================================================

// Garden Canvas props
export interface GardenCanvasProps {
  gardenId: string;
  initialPlantBeds: PlantBedWithPosition[];
  canvasConfig: CanvasConfig;
  onSave: (positions: UpdatePositionRequest[]) => Promise<void>;
  onCanvasConfigChange: (config: UpdateCanvasConfigRequest) => Promise<void>;
  readonly?: boolean;
}

// Plant Bed Visual props
export interface PlantBedVisualProps {
  plantBed: PlantBedWithPosition;
  scale: number;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (event: DragStartEvent) => void;
  onDragMove: (event: DragMoveEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onSelect: (id: string) => void;
  readonly?: boolean;
}

// Zoom Controls props
export interface ZoomControlsProps {
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  onZoomReset: () => void;
}

// Grid Overlay props
export interface GridOverlayProps {
  gridSize: number;
  canvasSize: Size;
  scale: number;
  visible: boolean;
  color: string;
  opacity: number;
}

// ===================================================================
// DATABASE QUERY TYPES
// ===================================================================

// Query filters
export interface PlantBedFilter {
  garden_id?: string;
  position_bounds?: Bounds;
  z_index_range?: [number, number];
  color_codes?: string[];
  updated_after?: string;
}

export interface GardenFilter {
  canvas_size_min?: Size;
  canvas_size_max?: Size;
  grid_size_range?: [number, number];
  has_plant_beds?: boolean;
}

// Query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  include_count?: boolean;
}

// ===================================================================
// PERFORMANCE TYPES
// ===================================================================

// Performance metrics
export interface PerformanceMetrics {
  render_time: number;
  drag_response_time: number;
  save_operation_time: number;
  zoom_operation_time: number;
  total_plant_beds: number;
  canvas_size: Size;
  memory_usage: number;
}

// Viewport bounds for virtualization
export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

// ===================================================================
// HOOKS TYPES
// ===================================================================

// Drag and drop hook return type
export interface UseDragDropReturn {
  dragState: DragState;
  startDrag: (elementId: string, position: Position) => void;
  updateDrag: (position: Position) => void;
  endDrag: () => void;
  isDragging: boolean;
}

// Canvas state hook return type
export interface UseCanvasStateReturn {
  canvasState: CanvasState;
  updateZoom: (zoomLevel: number) => void;
  updateGridSize: (gridSize: number) => void;
  selectPlantBed: (id: string | null) => void;
  updatePlantBedPosition: (id: string, position: Position) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  resetCanvas: () => void;
}

// ===================================================================
// DATABASE FUNCTIONS
// ===================================================================

export type Database = {
  public: {
    Tables: {
      gardens: {
        Row: Garden;
        Insert: Omit<Garden, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Garden, 'id' | 'created_at'>>;
      };
      plant_beds: {
        Row: PlantBed;
        Insert: Omit<PlantBed, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlantBed, 'id' | 'created_at'>>;
      };
      plants: {
        Row: Plant;
        Insert: Omit<Plant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Plant, 'id' | 'created_at'>>;
      };
    };
    Views: {
      visual_garden_data: {
        Row: VisualGardenData;
      };
    };
    Functions: {
      check_plant_bed_collision: {
        Args: {
          p_garden_id: string;
          p_plant_bed_id: string;
          p_position_x: number;
          p_position_y: number;
          p_visual_width: number;
          p_visual_height: number;
        };
        Returns: boolean;
      };
      check_canvas_boundaries: {
        Args: {
          p_garden_id: string;
          p_position_x: number;
          p_position_y: number;
          p_visual_width: number;
          p_visual_height: number;
        };
        Returns: boolean;
      };
    };
  };
};

// ===================================================================
// EXPORT TYPES FOR EASY IMPORT
// ===================================================================

export type {
  Position,
  Size,
  Bounds,
  CanvasConfig,
  PlantBedWithPosition,
  VisualGardenData,
  UpdatePositionRequest,
  BulkUpdatePositionsRequest,
  UpdateCanvasConfigRequest,
  DragState,
  CanvasState,
  CollisionBounds,
  ApiResponse,
  DatabaseResult,
  GardenWithPlantBeds,
  PlantBedWithPlants,
  CompleteGardenData,
  VisualGardenSummary,
  PositionValidation,
  CanvasValidation,
  CollisionValidation,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  CanvasClickEvent,
  CanvasZoomEvent,
  GardenCanvasProps,
  PlantBedVisualProps,
  ZoomControlsProps,
  GridOverlayProps,
  PlantBedFilter,
  GardenFilter,
  QueryOptions,
  PerformanceMetrics,
  ViewportBounds,
  UseDragDropReturn,
  UseCanvasStateReturn,
  Database,
};

// ===================================================================
// CONSTANTS
// ===================================================================

export const VISUAL_GARDEN_CONSTANTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5.0,
  DEFAULT_ZOOM: 1.0,
  MIN_GRID_SIZE: 0.1,
  MAX_GRID_SIZE: 10.0,
  DEFAULT_GRID_SIZE: 1.0,
  MIN_CANVAS_WIDTH: 5,
  MAX_CANVAS_WIDTH: 1000,
  MIN_CANVAS_HEIGHT: 5,
  MAX_CANVAS_HEIGHT: 1000,
  DEFAULT_CANVAS_WIDTH: 20,
  DEFAULT_CANVAS_HEIGHT: 20,
  MIN_PLANT_BED_SIZE: 0.5,
  MAX_PLANT_BED_SIZE: 50,
  DEFAULT_PLANT_BED_SIZE: 2,
  DEFAULT_COLORS: {
    PLANT_BED: '#22c55e',
    FLOWER: '#f59e0b',
    VEGETABLE: '#22c55e',
    FRUIT: '#dc2626',
    HERB: '#8b5cf6',
    GRID: '#e5e7eb',
    BACKGROUND: '#f8fafc',
    SELECTED: '#3b82f6',
    DRAGGING: '#f59e0b',
  },
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 1000,
  DRAG_THRESHOLD: 5,
  SNAP_THRESHOLD: 0.2,
} as const;

// ===================================================================
// EXPORT UTILITY FUNCTIONS
// ===================================================================

export { getCurrentEnvironment, getSupabaseConfig };
