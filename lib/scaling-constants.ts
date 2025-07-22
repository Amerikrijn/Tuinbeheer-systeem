// Scaling constants for consistent garden and plant bed visualization
// These constants ensure that the scale between garden view and plant bed view is consistent

// Base scaling: 1 meter = 80 pixels (good balance between detail and overview)
export const METERS_TO_PIXELS = 80

// Garden view constants - increased for better plant bed positioning flexibility
export const GARDEN_CANVAS_WIDTH = 1000
export const GARDEN_CANVAS_HEIGHT = 800
export const GARDEN_GRID_SIZE = 20
export const PLANTVAK_MIN_WIDTH = 80  // 1m minimum
export const PLANTVAK_MIN_HEIGHT = 80 // 1m minimum

// Plant bed view constants  
export const PLANTVAK_CANVAS_PADDING = 100 // Extra space around the plant bed content
export const FLOWER_SIZE_SMALL = 35   // Small flowers (was 20)
export const FLOWER_SIZE_MEDIUM = 45  // Medium flowers (was 30)
export const FLOWER_SIZE_LARGE = 55   // Large flowers (was 40)
export const FLOWER_NAME_HEIGHT = 30  // Space for flower names below (was 25)

// Utility functions
export const metersToPixels = (meters: number): number => meters * METERS_TO_PIXELS
export const pixelsToMeters = (pixels: number): number => pixels / METERS_TO_PIXELS

export const parsePlantBedDimensions = (sizeString: string) => {
  if (!sizeString) return null
  
  // Try multiple patterns to match different formats
  // Support formats like: "1,2 x 8", "1.2 x 8", "1,2x8", "1.2×8", etc.
  const match = sizeString?.replace(/,/g, '.').match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/)
  
  // If no match, try to extract just numbers (e.g. "8m" becomes 8x8)
  if (!match) {
    const singleMatch = sizeString?.replace(/,/g, '.').match(/(\d+(?:\.\d+)?)/)
    if (singleMatch) {
      const size = parseFloat(singleMatch[1])
      return {
        lengthMeters: size,
        widthMeters: size,
        lengthPixels: metersToPixels(size),
        widthPixels: metersToPixels(size)
      }
    }
  }
  
  if (match) {
    const length = parseFloat(match[1])
    const width = parseFloat(match[2])
    return {
      lengthMeters: length,
      widthMeters: width,
      lengthPixels: metersToPixels(length),
      widthPixels: metersToPixels(width)
    }
  }
  
  console.warn("Could not parse plant bed dimensions from:", sizeString)
  return null
}

export const calculatePlantBedCanvasSize = (sizeString: string) => {
  const dimensions = parsePlantBedDimensions(sizeString)
  if (dimensions) {
    // Ensure canvas is large enough to accommodate flower fields and expansion
    const minWidth = 500  // Increased minimum for better flower field support
    const minHeight = 400 // Increased minimum for better flower field support
    
    return {
      width: Math.max(minWidth, dimensions.lengthPixels + PLANTVAK_CANVAS_PADDING * 1.5),
      height: Math.max(minHeight, dimensions.widthPixels + PLANTVAK_CANVAS_PADDING * 1.5 + FLOWER_NAME_HEIGHT)
    }
  }
  return { width: 700, height: 550 } // Larger default canvas for better flower support
}