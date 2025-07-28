"use client"

import React, { useState, useEffect, useMemo } from 'react'
import type { PlantBedWithPlants, Plant, PlantWithPosition } from "@/lib/supabase"
import { parsePlantBedDimensions, PLANTVAK_CANVAS_PADDING } from "@/lib/scaling-constants"

interface FlowerVisualizationProps {
  plantBed: PlantBedWithPlants
  plants: Plant[] | PlantWithPosition[]
  containerWidth: number
  containerHeight: number
}

interface FlowerInstance {
  id: string
  name: string
  color: string
  emoji?: string
  size: number
  x: number
  y: number
  opacity: number
  rotation: number
  isMainFlower: boolean
  canFillContainer: boolean
}

export function FlowerVisualization({ plantBed, plants, containerWidth, containerHeight }: FlowerVisualizationProps) {
  const [flowerInstances, setFlowerInstances] = useState<FlowerInstance[]>([])

  // Helper function to get emoji based on plant name
  const getPlantEmoji = (name?: string, storedEmoji?: string): string => {
    // If plant already has a stored emoji, use it
    if (storedEmoji && storedEmoji.trim()) {
      return storedEmoji
    }
    
    const plantName = (name || '').toLowerCase()
    
    // Exacte matches voor eenjarige bloemen
    if (plantName.includes('zinnia')) return '🌻'
    if (plantName.includes('marigold') || plantName.includes('tagetes')) return '🌼'
    if (plantName.includes('impatiens')) return '🌸'
    if (plantName.includes('ageratum')) return '🌸'
    if (plantName.includes('salvia')) return '🌺'
    if (plantName.includes('verbena')) return '🌸'
    if (plantName.includes('lobelia')) return '🌸'
    if (plantName.includes('alyssum')) return '🤍'
    if (plantName.includes('cosmos')) return '🌸'
    if (plantName.includes('petunia')) return '🌺'
    if (plantName.includes('begonia')) return '🌸'
    if (plantName.includes('viooltje') || plantName.includes('viola')) return '🌸'
    if (plantName.includes('stiefmoedje') || plantName.includes('pansy')) return '🌸'
    if (plantName.includes('snapdragon') || plantName.includes('leeuwenbek')) return '🌸'
    if (plantName.includes('zonnebloem') || plantName.includes('sunflower')) return '🌻'
    if (plantName.includes('calendula') || plantName.includes('goudsbloem')) return '🌼'
    if (plantName.includes('nicotiana') || plantName.includes('siertabak')) return '🤍'
    if (plantName.includes('cleome') || plantName.includes('spinnenbloem')) return '🌸'
    if (plantName.includes('celosia') || plantName.includes('hanekam')) return '🌺'
    
    // Default fallback
    return '🌸'
  }

  // Generate flower instances based on plants - SYNCHRONIZED WITH PLANTVAK-VIEW
  useEffect(() => {
    console.log('🌻 FLOWER VISUALIZATION CALLED:', {
      plantsCount: plants.length,
      plantBedSize: plantBed.size,
      containerSize: { w: containerWidth, h: containerHeight }
    })
    
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []

    // Get plantvak dimensions to calculate consistent positioning
    const dimensions = plantBed.size ? parsePlantBedDimensions(plantBed.size) : null
    
    plants.forEach((plant, plantIndex) => {
      // Check if this plant has custom positioning (from plantvak-view)
      const hasCustomPosition = 'position_x' in plant && plant.position_x !== undefined && plant.position_y !== undefined
      const hasCustomSize = 'visual_width' in plant && plant.visual_width && plant.visual_height
      
      // DEBUG: Always log to see what's happening
      console.log('🌺 FLOWER DEBUG:', {
        plantName: plant.name,
        hasCustomPosition,
        hasCustomSize,
        hasDimensions: !!dimensions,
        position: { x: plant.position_x, y: plant.position_y },
        size: { w: plant.visual_width, h: plant.visual_height }
      })
      
      if (hasCustomPosition && hasCustomSize && dimensions) {
        // Use EXACT same canvas size calculation as plantvak-view getCanvasSize()
        const scaleFactor = 2 // Same as plantvak-view
        const plantvakCanvasWidth = dimensions.lengthPixels * scaleFactor
        const plantvakCanvasHeight = dimensions.widthPixels * scaleFactor
        
        // In plantvak-view, the canvas IS the plantvak (no padding/centering)
        // So plant positions are directly on the canvas
        const relativeX = plant.position_x!
        const relativeY = plant.position_y!
        
        // Convert to percentage within the plantvak CANVAS dimensions
        const percentageX = relativeX / plantvakCanvasWidth
        const percentageY = relativeY / plantvakCanvasHeight
        
        // Apply percentage to container dimensions
        const finalX = percentageX * containerWidth
        const finalY = percentageY * containerHeight
        
        // DEBUG: Log coordinate transformation for troubleshooting
        console.log('🌸 GARDEN VIEW COORDINATE TRANSFORM:', {
          plantName: plant.name,
          plantIndex: plantIndex + 1,
          originalPos: { x: plant.position_x, y: plant.position_y },
          plantvakCanvasSize: { w: plantvakCanvasWidth, h: plantvakCanvasHeight },
          relativePos: { x: relativeX, y: relativeY },
          percentage: { x: percentageX, y: percentageY },
          containerSize: { w: containerWidth, h: containerHeight },
          finalPos: { x: finalX, y: finalY }
        })
        
        // Scale the flower size proportionally to container size
        // Use the plantvak CANVAS dimensions (not real-world dimensions) for proper scaling
        const sizeScale = Math.min(containerWidth / plantvakCanvasWidth, containerHeight / plantvakCanvasHeight)
        const scaledSize = Math.max(16, (plant.visual_width! * sizeScale))
        
        // DEBUG: Log size scaling for troubleshooting
        console.log('🔍 GARDEN VIEW SIZE SCALING:', {
          plantName: plant.name,
          originalSize: plant.visual_width,
          plantvakCanvasSize: { w: plantvakCanvasWidth, h: plantvakCanvasHeight },
          containerSize: { w: containerWidth, h: containerHeight },
          sizeScale: sizeScale,
          scaledSize: scaledSize
        })
        
        instances.push({
          id: `${plant.id}-flower-sync`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: getPlantEmoji(plant.name, plant.emoji),
          size: scaledSize,
          x: Math.max(scaledSize/2, Math.min(finalX, containerWidth - scaledSize/2)),
          y: Math.max(scaledSize/2, Math.min(finalY, containerHeight - scaledSize/2)),
          opacity: 1,
          rotation: 0,
          isMainFlower: true,
          canFillContainer: false
        })
      } else {
        // Fallback for plants without custom positioning - use simple grid layout
        const flowerSize = Math.max(20, Math.min(40, Math.min(containerWidth, containerHeight) / 8))
        
        // Create a simple grid layout for plants without positioning
        const cols = Math.ceil(Math.sqrt(plants.length))
        const rows = Math.ceil(plants.length / cols)
        const col = plantIndex % cols
        const row = Math.floor(plantIndex / cols)
        
        const padding = 10
        const cellWidth = (containerWidth - padding * 2) / cols
        const cellHeight = (containerHeight - padding * 2) / rows
        
        const x = padding + (col * cellWidth) + (cellWidth / 2)
        const y = padding + (row * cellHeight) + (cellHeight / 2)
        
        instances.push({
          id: `${plant.id}-flower-grid`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: getPlantEmoji(plant.name, plant.emoji),
          size: flowerSize,
          x,
          y,
          opacity: 1,
          rotation: 0,
          isMainFlower: true,
          canFillContainer: false
        })
      }
    })

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight, plantBed.size])

  // Render nothing if no plants
  if (plants.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flowerInstances.map((flower, index) => (
        <div
          key={flower.id}
          className="absolute transition-all duration-500 ease-in-out"
          style={{
            left: flower.x - flower.size / 2, // Center the flower horizontally
            top: flower.y - flower.size / 2,  // Center the flower vertically
            width: flower.size,
            height: flower.size,
            opacity: flower.opacity,
            transform: `rotate(${flower.rotation}deg)`,
            zIndex: flower.isMainFlower ? 10 : 8,
          }}
        >
          {/* Individual flower box with border */}
          <div
            className="w-full h-full border-2 border-gray-400 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex flex-col items-center justify-center"
            style={{
              borderColor: `${flower.color}60`, // More visible border in flower color
              backgroundColor: `${flower.color}15`, // Slightly more visible background tint
            }}
          >
            {/* Use flower emoji with improved logic */}
            <span 
              className="select-none"
              style={{
                fontSize: Math.max(12, flower.size * 0.4),
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              }}
            >
              {flower.emoji}
            </span>
            
            {/* Flower name below the emoji - only show if there's space */}
            {flower.size > 30 && (
              <div 
                className="text-xs font-medium text-gray-800 mt-1 text-center select-none"
                style={{
                  fontSize: Math.max(6, flower.size * 0.2),
                  maxWidth: flower.size * 0.9,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.1'
                }}
              >
                {flower.name}
              </div>
            )}
          </div>

          {/* Glow effect for main flowers */}
          {flower.isMainFlower && (
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-sm -z-10"
              style={{
                backgroundColor: flower.color,
                transform: 'scale(1.5)',
              }}
            />
          )}
        </div>
      ))}

      {/* Subtle natural particles - reduced for cleaner look */}
      {containerWidth > 150 && containerHeight > 150 && plants.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.min(1, Math.floor(plants.length / 3)))].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute opacity-10 animate-pulse"
              style={{
                fontSize: '8px',
                left: Math.random() * (containerWidth - 16),
                top: Math.random() * (containerHeight - 16),
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            >
              {['🌿', '✨'][Math.floor(Math.random() * 2)]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}