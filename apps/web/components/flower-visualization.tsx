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

  // IMPROVED: Generate flower instances with proper visual hierarchy
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
        // IMPROVED: Better scaling between plantvak-view and garden-view
        // Plantvak-view uses a larger canvas, so we need to scale down for garden-view
        
        // Calculate the scale factor based on container size vs plantvak dimensions
        const plantvakWidth = dimensions.lengthPixels  // e.g. 800px for 10m
        const plantvakHeight = dimensions.widthPixels  // e.g. 160px for 2m
        
        // Scale factor to fit plantvak into garden container
        const scaleX = containerWidth / plantvakWidth
        const scaleY = containerHeight / plantvakHeight
        const scale = Math.min(scaleX, scaleY) // Use the smaller scale to maintain aspect ratio
        
        // Scale the position from plantvak-view to garden-view
        const scaledX = plant.position_x! * scale
        const scaledY = plant.position_y! * scale
        
        // IMPROVED: Much larger flower size for better visibility
        const flowerSize = Math.max(32, Math.min(64, Math.min(containerWidth, containerHeight) / 8))
        
        instances.push({
          id: `${plant.id}-flower`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: getPlantEmoji(plant.name, plant.emoji),
          size: flowerSize,
          x: Math.max(flowerSize/2, Math.min(scaledX, containerWidth - flowerSize/2)),
          y: Math.max(flowerSize/2, Math.min(scaledY, containerHeight - flowerSize/2)),
          opacity: 1,
          rotation: 0,
          isMainFlower: true
        })
      } else {
        // IMPROVED: Much larger grid layout for plants without positioning
        const flowerSize = Math.max(32, Math.min(64, Math.min(containerWidth, containerHeight) / 6))
        
        // Create a better grid layout for plants without positioning
        const cols = Math.ceil(Math.sqrt(plants.length))
        const rows = Math.ceil(plants.length / cols)
        const col = plantIndex % cols
        const row = Math.floor(plantIndex / cols)
        
        const padding = 40
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
          {/* IMPROVED: Clear flower visualization with better visual hierarchy */}
          <div
            className="w-full h-full border-3 border-gray-500 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center"
            style={{
              borderColor: `${flower.color}90`,
              backgroundColor: `${flower.color}20`,
              boxShadow: `0 4px 12px ${flower.color}40`,
            }}
          >
            {/* IMPROVED: Much larger, more visible flower emoji */}
            <span 
              className="select-none"
              style={{
                fontSize: Math.max(20, flower.size * 0.7),
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
              }}
            >
              {flower.emoji}
            </span>
            
            {/* IMPROVED: Always show flower name for better identification */}
            {flower.size > 20 && (
              <div 
                className="text-xs font-semibold text-gray-900 mt-1 text-center select-none"
                style={{
                  fontSize: Math.max(10, flower.size * 0.2),
                  maxWidth: flower.size * 0.9,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                {flower.name}
              </div>
            )}
          </div>

          {/* IMPROVED: Better glow effect for main flowers */}
          {flower.isMainFlower && (
            <div
              className="absolute inset-0 rounded-full opacity-40 blur-md -z-10"
              style={{
                backgroundColor: flower.color,
                transform: 'scale(1.6)',
              }}
            />
          )}
        </div>
      ))}

      {/* IMPROVED: More visible natural particles */}
      {containerWidth > 150 && containerHeight > 150 && plants.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.min(3, Math.floor(plants.length / 2)))].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute opacity-15 animate-pulse"
              style={{
                fontSize: '8px',
                left: Math.random() * (containerWidth - 16),
                top: Math.random() * (containerHeight - 16),
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            >
              {['🌿', '✨', '🌱'][Math.floor(Math.random() * 3)]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}