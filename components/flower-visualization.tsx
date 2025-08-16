"use client"

import React, { useState, useEffect } from 'react'
import type { PlantBedWithPlants, Plant, PlantWithPosition } from "@/lib/supabase"
import { parsePlantBedDimensions } from "@/lib/scaling-constants"
import { getPlantEmoji } from "@/lib/get-plant-emoji"
import { Flower, FlowerInstance } from "./flower"

interface FlowerVisualizationProps {
  plantBed: PlantBedWithPlants
  plants: Plant[] | PlantWithPosition[]
  containerWidth: number
  containerHeight: number
}

export function FlowerVisualization({ plantBed, plants, containerWidth, containerHeight }: FlowerVisualizationProps) {
  const [flowerInstances, setFlowerInstances] = useState<FlowerInstance[]>([])

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
      {flowerInstances.map((flower) => (
        <Flower key={flower.id} flower={flower} />
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

