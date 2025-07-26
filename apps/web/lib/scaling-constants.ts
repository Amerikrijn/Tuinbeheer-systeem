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

// Scaling modes for consistent positioning
export const SCALING_MODE = {
  GARDEN_TO_PLANTVAK: 'garden_to_plantvak',
  PLANTVAK_TO_GARDEN: 'plantvak_to_garden',
  DIRECT: 'direct'
} as const;

// Utility functions
export const metersToPixels = (meters: number): number => meters * METERS_TO_PIXELS
export const pixelsToMeters = (pixels: number): number => pixels / METERS_TO_PIXELS

export const parsePlantBedDimensions = (sizeString: string) => {
  // Try multiple patterns to match different formats
  const match = sizeString?.match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/)
  
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

// Position synchronization utilities
export const convertPlantPositionFromGardenToPlantvak = (
  gardenPosition: { x: number, y: number },
  plantBedDimensions: { lengthPixels: number, widthPixels: number },
  plantvakCanvasSize: { width: number, height: number }
) => {
  // Calculate the plantvak container's position within the canvas
  const plantvakStartX = (plantvakCanvasSize.width - plantBedDimensions.lengthPixels) / 2
  const plantvakStartY = (plantvakCanvasSize.height - plantBedDimensions.widthPixels) / 2
  
  // Convert absolute garden position to relative plantvak position
  return {
    x: gardenPosition.x + plantvakStartX,
    y: gardenPosition.y + plantvakStartY
  }
}

export const convertPlantPositionFromPlantvakToGarden = (
  plantvakPosition: { x: number, y: number },
  plantBedDimensions: { lengthPixels: number, widthPixels: number },
  plantvakCanvasSize: { width: number, height: number }
) => {
  // Calculate the plantvak container's position within the canvas
  const plantvakStartX = (plantvakCanvasSize.width - plantBedDimensions.lengthPixels) / 2
  const plantvakStartY = (plantvakCanvasSize.height - plantBedDimensions.widthPixels) / 2
  
  // Convert relative plantvak position to absolute garden position
  return {
    x: plantvakPosition.x - plantvakStartX,
    y: plantvakPosition.y - plantvakStartY
  }
}

// Validate that plantvak dimensions match between garden and detail view
export const validatePlantvakScaling = (
  gardenBedSize: { width: number, height: number },
  plantvakBedSize: { width: number, height: number },
  tolerance: number = 1
) => {
  const widthDiff = Math.abs(gardenBedSize.width - plantvakBedSize.width)
  const heightDiff = Math.abs(gardenBedSize.height - plantvakBedSize.height)
  
  return {
    isValid: widthDiff <= tolerance && heightDiff <= tolerance,
    widthDiff,
    heightDiff,
    message: widthDiff > tolerance || heightDiff > tolerance 
      ? `Plantvak scaling mismatch: width diff ${widthDiff.toFixed(1)}px, height diff ${heightDiff.toFixed(1)}px`
      : 'Plantvak scaling is consistent'
  }
}
