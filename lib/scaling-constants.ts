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
  // Try multiple patterns to match different formats, including units like "m", "meter", etc.
  const match = sizeString?.match(/(\d+(?:\.\d+)?)\s*m?\s*[xX×]\s*(\d+(?:\.\d+)?)\s*m?/)
  
  // If no match, try to extract just numbers (e.g. "8m" becomes 8x8)
  if (!match) {
    const singleMatch = sizeString?.match(/(\d+(?:\.\d+)?)/)
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
    return {
      lengthMeters: parseFloat(match[1]),
      widthMeters: parseFloat(match[2]),
      lengthPixels: metersToPixels(parseFloat(match[1])),
      widthPixels: metersToPixels(parseFloat(match[2]))
    }
  }
  
  console.warn("Could not parse plant bed dimensions from:", sizeString)
  return null
}

export const calculatePlantBedCanvasSize = (sizeString: string) => {
  const dimensions = parsePlantBedDimensions(sizeString)
  if (dimensions) {
    // Ensure canvas maintains proper aspect ratio and has enough space
    const padding = PLANTVAK_CANVAS_PADDING
    const minWidth = 600  // Increased minimum for better aspect ratio
    const minHeight = 450 // Increased minimum for better aspect ratio
    
    // Calculate canvas size maintaining aspect ratio of the plantvak
    const aspectRatio = dimensions.lengthPixels / dimensions.widthPixels
    let canvasWidth = Math.max(minWidth, dimensions.lengthPixels + padding * 2)
    let canvasHeight = Math.max(minHeight, dimensions.widthPixels + padding * 2)
    
    // Ensure minimum aspect ratio is maintained
    if (canvasWidth / canvasHeight < 1.2) {
      canvasWidth = canvasHeight * 1.2
    }
    
    return {
      width: canvasWidth,
      height: canvasHeight + FLOWER_NAME_HEIGHT
    }
  }
  return { width: 700, height: 550 } // Larger default canvas for better flower support
}