"use client"

import React, { useState, useEffect, useMemo } from 'react'
import type { PlantBedWithPlants, Plant, PlantWithPosition } from "@/lib/supabase"

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

  // Calculate how many flowers should be displayed for each individual plant based on its size
  const calculateFlowersPerPlant = useMemo(() => {
    return (plantWidth: number, plantHeight: number) => {
      // Base calculation: 2x2 vak = 6 bloemen
      const baseArea = 100 * 100 // 2x2 reference size
      const baseBloemenCount = 6
      
      const plantArea = plantWidth * plantHeight
      const scaleFactor = plantArea / baseArea
      
      // Calculate flower count based on area scaling
      let flowerCount = Math.round(baseBloemenCount * scaleFactor)
      
      // Minimum and maximum bounds per plant
      flowerCount = Math.max(1, flowerCount) // Minimum 1 bloem per plant
      flowerCount = Math.min(15, flowerCount) // Maximum 15 bloemen per plant
      
      return flowerCount
    }
  }, [])



  // Generate flower instances based on plants and area
  useEffect(() => {
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []
    const padding = 8

    plants.forEach((plant, plantIndex) => {
      // Check if this plant has custom sizing (individual plant box)
      const hasCustomSize = 'visual_width' in plant && plant.visual_width && plant.visual_height
      
      if (hasCustomSize) {
        // Individual plant with its own box - use exact size and position
        const plantWidth = plant.visual_width!
        const plantHeight = plant.visual_height!
        const plantX = 'position_x' in plant && plant.position_x !== undefined ? plant.position_x : 0
        const plantY = 'position_y' in plant && plant.position_y !== undefined ? plant.position_y : 0
        
        // Calculate how many flowers should be in this specific plant box
        const flowersInThisPlant = calculateFlowersPerPlant(plantWidth, plantHeight)
        
        // Flower size within this plant box
        const flowerSize = Math.max(16, Math.min(32, Math.min(plantWidth, plantHeight) / Math.ceil(Math.sqrt(flowersInThisPlant)) / 1.2))
        
        // Create flowers within this plant's boundaries
        for (let i = 0; i < flowersInThisPlant; i++) {
          let x, y
          
          if (flowersInThisPlant === 1) {
            // Single flower - center it in the plant box
            x = plantX + plantWidth / 2
            y = plantY + plantHeight / 2
          } else {
            // Multiple flowers - grid within the plant box
            const cols = Math.ceil(Math.sqrt(flowersInThisPlant))
            const rows = Math.ceil(flowersInThisPlant / cols)
            const col = i % cols
            const row = Math.floor(i / cols)
            
            // Available space within the plant box (with padding)
            const availableWidth = plantWidth - (padding * 2)
            const availableHeight = plantHeight - (padding * 2)
            
            // Grid cell size
            const cellWidth = availableWidth / cols
            const cellHeight = availableHeight / rows
            
            // Position in center of each grid cell within the plant box
            x = plantX + padding + (col * cellWidth) + (cellWidth / 2)
            y = plantY + padding + (row * cellHeight) + (cellHeight / 2)
            
            // Small random offset within the cell
            const maxOffset = Math.min(6, cellWidth / 6, cellHeight / 6)
            const offsetX = ((plant.id.charCodeAt(0) + i * 37) % (maxOffset * 2)) - maxOffset
            const offsetY = ((plant.id.charCodeAt(0) + i * 53) % (maxOffset * 2)) - maxOffset
            
            x += offsetX
            y += offsetY
          }
          
          // Ensure flowers stay within the plant box boundaries
          const halfSize = flowerSize / 2
          x = Math.max(plantX + halfSize + padding, Math.min(x, plantX + plantWidth - halfSize - padding))
          y = Math.max(plantY + halfSize + padding, Math.min(y, plantY + plantHeight - halfSize - padding))
          
          instances.push({
            id: `${plant.id}-flower-${i}`,
            name: plant.name,
            color: plant.color || '#FF69B4',
            emoji: plant.emoji,
            size: flowerSize,
            x,
            y,
            opacity: 1,
            rotation: 0,
            isMainFlower: i === 0,
            canFillContainer: false
          })
        }
      } else {
        // Fallback for plants without custom positioning - center in container
        const flowerSize = Math.max(24, Math.min(40, Math.min(containerWidth, containerHeight) / 4))
        
        instances.push({
          id: `${plant.id}-flower-0`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: plant.emoji,
          size: flowerSize,
          x: containerWidth / 2,
          y: containerHeight / 2,
          opacity: 1,
          rotation: 0,
          isMainFlower: true,
          canFillContainer: false
        })
      }
    })

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight, calculateFlowersPerPlant])

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
            className="w-full h-full border-2 border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm flex flex-col items-center justify-center"
            style={{
              borderColor: `${flower.color}40`, // Semi-transparent border in flower color
              backgroundColor: `${flower.color}08`, // Very light background tint
            }}
          >
            {/* Use flower emoji or create a simple flower symbol */}
            <span 
              className="select-none"
              style={{
                fontSize: Math.max(12, flower.size * 0.4),
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              }}
            >
              {flower.emoji && (flower.emoji.includes('🌸') || flower.emoji.includes('🌺') || flower.emoji.includes('🌻') || flower.emoji.includes('🌷') || flower.emoji.includes('🌹') || flower.emoji.includes('💐') || flower.emoji.includes('🌼')) 
                ? flower.emoji 
                : '🌸'}
            </span>
            
            {/* Flower name below the emoji */}
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

          {/* Sparkle effects for visual interest */}
          {(flower.isMainFlower || Math.random() > 0.8) && (
            <>
              <div
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-60"
                style={{
                  top: flower.size * 0.2,
                  left: flower.size * 0.3,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
              <div
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-60"
                style={{
                  top: flower.size * 0.7,
                  right: flower.size * 0.3,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            </>
          )}
        </div>
      ))}

      {/* Subtle natural particles - like pollen or small leaves */}
      {containerWidth > 150 && containerHeight > 150 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.min(2, Math.floor(plants.length / 2)))].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute opacity-20 animate-pulse"
              style={{
                fontSize: '6px',
                left: Math.random() * (containerWidth - 16),
                top: Math.random() * (containerHeight - 16),
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {['🌿', '🍃', '✨'][Math.floor(Math.random() * 3)]}
            </div>
          ))}
        </div>
      )}

      {/* Extra playful elements for large containers */}
      {containerWidth > 200 && containerHeight > 200 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle gradient overlay for depth */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)'
            }}
          />
          
          {/* Floating butterflies and bees for natural garden feel */}
          {containerWidth > 200 && containerHeight > 200 && [...Array(1)].map((_, i) => (
            <div
              key={`nature-${i}`}
              className="absolute opacity-30 animate-bounce select-none"
              style={{
                fontSize: 8 + Math.random() * 4,
                left: Math.random() * (containerWidth - 20),
                top: Math.random() * (containerHeight - 20),
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${5 + Math.random() * 3}s`,
              }}
            >
              {['🦋', '🐝'][Math.floor(Math.random() * 2)]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}