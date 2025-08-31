

import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

// ===================================================================
// SUPABASE CLIENT INITIALIZATION
// ===================================================================

// Get Supabase configuration from hardcoded config (not env vars)
const config = getSupabaseConfig();
const supabaseUrl = config.url;
const supabaseAnonKey = config.anonKey;

// Track active requests for cleanup
const activeRequests = new Map<string, AbortController>();
let requestCounter = 0;

// Cleanup function for pending requests
export function cleanupPendingRequests() {
  console.log(`🧹 Cleaning up ${activeRequests.size} pending requests`);
  activeRequests.forEach(controller => {
    try {
      controller.abort();
    } catch (e) {
      // Ignore abort errors
    }
  });
  activeRequests.clear();
}

// Clean up on page navigation (for Next.js)
if (typeof window !== 'undefined') {
  // Clean up when navigating away
  window.addEventListener('beforeunload', cleanupPendingRequests);
  
  // Clean up on route change (Next.js specific)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    cleanupPendingRequests();
    return originalPushState.apply(history, args);
  };
  
  history.replaceState = function(...args) {
    cleanupPendingRequests();
    return originalReplaceState.apply(history, args);
  };
}

// Create Supabase client with FIXED fetch implementation
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'tuinbeheer-auth', // Consistent storage key
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'tuinbeheer-systeem',
    },
    fetch: async (url, options = {}) => {
      // Generate unique request ID for each request
      requestCounter++;
      const requestId = `req-${Date.now()}-${requestCounter}`;
      
      // Create abort controller for this request
      const controller = new AbortController();
      
      // Store controller for cleanup
      activeRequests.set(requestId, controller);
      
      // Clean up old requests if too many are pending
      if (activeRequests.size > 10) {
        console.warn(`⚠️ ${activeRequests.size} requests pending - cleaning oldest`);
        const oldestKey = activeRequests.keys().next().value;
        const oldestController = activeRequests.get(oldestKey);
        if (oldestController) {
          oldestController.abort();
          activeRequests.delete(oldestKey);
        }
      }
      
      // Determine timeout based on request type
      const isHealthCheck = url.includes('/rest/v1/gardens?select=count');
      const timeoutMs = isHealthCheck ? 5000 : 15000; // Reduced from 20s to 15s
      const timeoutId = setTimeout(() => {
        controller.abort();
        activeRequests.delete(requestId);
      }, timeoutMs);
      
      const startTime = performance.now();
      
      try {
        // IMPORTANT: Keep all original options and headers
        // The apikey is already in options.headers from Supabase client
        const response = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            'X-Request-Id': requestId,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        activeRequests.delete(requestId);
        
        const responseTime = performance.now() - startTime;
        
        // Log performance metrics
        if (responseTime > 10000) {

        } else if (responseTime > 3000) {

        } else if (process.env.NODE_ENV === 'development' && responseTime > 1000) {

        }
        
        // Check response status
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');

          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        activeRequests.delete(requestId);
        const responseTime = performance.now() - startTime;
        
        if (error.name === 'AbortError') {
          console.warn(`⏱️ Request ${requestId} timed out after ${timeoutMs/1000}s`);
          throw new Error(`Verbinding time-out na ${timeoutMs/1000}s - probeer opnieuw`);
        }
        
        // Network errors
        if (!navigator.onLine) {
          throw new Error('Geen internetverbinding - controleer je netwerk');
        }
        
        console.error(`🚨 Supabase request failed after ${responseTime.toFixed(0)}ms:`, error.message);
        throw error;
      }
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Reduced from 10 to prevent connection overload
    },
  },
});

// Create admin client with service role key for admin operations
const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {

    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'tuinbeheer-systeem-admin',
      },
    },
  });
};

export const supabaseAdmin = getAdminClient();

// ===================================================================
// CONFIGURATION UTILITIES
// ===================================================================

export function getCurrentEnvironment() {
  return process.env.NODE_ENV || 'development';
}

export function getSupabaseUrl() {
  return supabaseUrl;
}

export function isTestEnvironment() {
  return process.env.NODE_ENV === 'test';
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === 'development';
}

// ===================================================================
// CONNECTION TESTING
// ===================================================================

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    return {
      success: true,
      environment: getCurrentEnvironment(),
      url: getSupabaseUrl(),
      message: 'Supabase connection successful'
    };
  } catch (error) {
    return {
      success: false,
      environment: getCurrentEnvironment(),
      url: getSupabaseUrl(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Supabase connection failed'
    };
  }
}

// ===================================================================
// EXISTING TYPES (Extended for Visual Garden Designer)
// ===================================================================

export interface Garden {
  id: string;
  name: string;
  description?: string;
  location: string; // Required in database
  total_area?: string;
  length?: string;
  width?: string;
  garden_type?: string;
  established_date?: string;
  notes?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  // Visual Garden Designer fields
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
  letter_code?: string; // Unique letter code (A, B, C, etc.) for plantvak identification
  location?: string;
  size?: string;
  soil_type?: string;
  sun_exposure?: 'full-sun' | 'partial-sun' | 'shade';
  description?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  // Visual Garden Designer fields
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
  scientific_name?: string;
  latin_name?: string;
  variety?: string;
  color?: string;
  plant_color?: string;
  height?: number;
  plant_height?: number;
  plants_per_sqm?: number;
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade';
  stem_length?: number;
  photo_url?: string;
  category?: string;
  bloom_period?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  status?: 'gezond' | 'aandacht_nodig' | 'ziek' | 'dood' | 'geoogst';
  notes?: string;
  care_instructions?: string;
  watering_frequency?: number;
  fertilizer_schedule?: string;
  // Visual designer properties
  position_x?: number;
  position_y?: number;
  visual_width?: number;
  visual_height?: number;
  emoji?: string;
  is_custom?: boolean;
  created_at: string;
  updated_at: string;
}

// Extended interface for visual designer
export interface PlantWithPosition extends Plant {
  position_x: number;
  position_y: number;
  visual_width: number;
  visual_height: number;
  emoji?: string;
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
// VISUAL GARDEN CONSTANTS
// ===================================================================

export const VISUAL_GARDEN_CONSTANTS = {
  // Canvas dimensions
  DEFAULT_CANVAS_WIDTH: 800,
  DEFAULT_CANVAS_HEIGHT: 600,
  MIN_CANVAS_WIDTH: 400,
  MAX_CANVAS_WIDTH: 2000,
  MIN_CANVAS_HEIGHT: 300,
  MAX_CANVAS_HEIGHT: 1500,

  // Grid settings
  DEFAULT_GRID_SIZE: 20,
  MIN_GRID_SIZE: 10,
  MAX_GRID_SIZE: 50,

  // Zoom settings
  DEFAULT_ZOOM: 1.0,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 3.0,

  // Plant bed settings
  DEFAULT_PLANT_BED_SIZE: 100,
  MAX_PLANT_BED_SIZE: 500,

  // Colors
  DEFAULT_COLORS: {
    BACKGROUND: '#f5f5f5',
    PLANT_BED: '#8fbc8f',
    GRID: '#e0e0e0',
    BORDER: '#666666'
  }
};

// ===================================================================
// EXPORT TYPES FOR EASY IMPORT
// ===================================================================

