// Scaling constants for consistent garden and plant bed visualization
// These constants ensure that the scale between garden view and plant bed view is consistent

// Base scaling: 1 meter = 80 pixels (good balance between detail and overview)
export const METERS_TO_PIXELS = 80

// Garden view constants
export const GARDEN_CANVAS_WIDTH = 800
export const GARDEN_CANVAS_HEIGHT = 600
export const GARDEN_GRID_SIZE = 20
export const PLANTVAK_MIN_WIDTH = 80  // 1m minimum
export const PLANTVAK_MIN_HEIGHT = 80 // 1m minimum

// Plant bed view constants  
export const PLANTVAK_CANVAS_PADDING = 100 // Extra space around the plant bed content
export const FLOWER_SIZE_SMALL = 20   // Small flowers
export const FLOWER_SIZE_MEDIUM = 30  // Medium flowers  
export const FLOWER_SIZE_LARGE = 40   // Large flowers
export const FLOWER_NAME_HEIGHT = 25  // Space for flower names below

// Utility functions
export const metersToPixels = (meters: number): number => meters * METERS_TO_PIXELS
export const pixelsToMeters = (pixels: number): number => pixels / METERS_TO_PIXELS

export const parsePlantBedDimensions = (sizeString: string) => {
  const match = sizeString?.match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/)
  if (match) {
    return {
      lengthMeters: parseFloat(match[1]),
      widthMeters: parseFloat(match[2]),
      lengthPixels: metersToPixels(parseFloat(match[1])),
      widthPixels: metersToPixels(parseFloat(match[2]))
    }
  }
  return null
}

export const calculatePlantBedCanvasSize = (sizeString: string) => {
  const dimensions = parsePlantBedDimensions(sizeString)
  if (dimensions) {
    return {
      width: Math.max(400, dimensions.lengthPixels + PLANTVAK_CANVAS_PADDING),
      height: Math.max(300, dimensions.widthPixels + PLANTVAK_CANVAS_PADDING + FLOWER_NAME_HEIGHT)
    }
  }
  return { width: 600, height: 450 }
}