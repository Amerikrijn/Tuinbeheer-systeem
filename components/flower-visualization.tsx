"use client"

import React, { useState, useEffect } from 'react'
import type { PlantBedWithPlants, Plant, PlantWithPosition } from "@/lib/supabase"
import { parsePlantBedDimensions } from "@/lib/scaling-constants"

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

  // SIMPLE: Generate flower instances with consistent positioning
  useEffect(() => {
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []
    const dimensions = plantBed.size ? parsePlantBedDimensions(plantBed.size) : null
    
    plants.forEach((plant, plantIndex) => {
      // Check if this plant has custom positioning (from plantvak-view)
      const hasCustomPosition = 'position_x' in plant && 
                               plant.position_x !== undefined && 
                               plant.position_y !== undefined
      
      if (hasCustomPosition && dimensions) {
        // SIMPLE: Use direct pixel coordinates from plantvak-view
        // Plantvak-view stores absolute pixel positions, so we use them directly
        const flowerSize = Math.max(20, Math.min(40, Math.min(containerWidth, containerHeight) / 10))
        
        instances.push({
          id: `${plant.id}-flower`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: getPlantEmoji(plant.name, plant.emoji),
          size: flowerSize,
          x: Math.max(flowerSize/2, Math.min(plant.position_x!, containerWidth - flowerSize/2)),
          y: Math.max(flowerSize/2, Math.min(plant.position_y!, containerHeight - flowerSize/2)),
          opacity: 1,
          rotation: 0,
          isMainFlower: true
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
          isMainFlower: true
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
      {flowerInstances.map((flower: FlowerInstance, index: number) => (
        <div
          key={flower.id}
          className="absolute transition-all duration-500 ease-in-out"
          style={{
            left: flower.x - flower.size / 2,
            top: flower.y - flower.size / 2,
            width: flower.size,
            height: flower.size,
            opacity: flower.opacity,
            transform: `rotate(${flower.rotation}deg)`,
            zIndex: flower.isMainFlower ? 10 : 8,
          }}
        >
          {/* Simple flower box */}
          <div
            className="w-full h-full border-2 border-border rounded-lg bg-card/90 backdrop-blur-sm shadow-md flex flex-col items-center justify-center"
            style={{
              borderColor: `${flower.color}80`,
              backgroundColor: `${flower.color}25`,
            }}
          >
            {/* Flower emoji */}
            <span 
              className="select-none"
              style={{
                fontSize: Math.max(12, flower.size * 0.4),
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              }}
            >
              {flower.emoji}
            </span>
            
            {/* Flower name - only show if there's space */}
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

      {/* Subtle natural particles */}
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