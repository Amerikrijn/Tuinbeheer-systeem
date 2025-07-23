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

  // Calculate how many flowers should be displayed based on plant bed size
  const calculateFlowerCount = useMemo(() => {
    // Base calculation: 2x2 vak = 6 bloemen
    // Dus per 100x100 pixels ongeveer 6 bloemen
    const baseArea = 100 * 100 // 2x2 reference size
    const baseBloemenCount = 6
    
    const currentArea = containerWidth * containerHeight
    const scaleFactor = currentArea / baseArea
    
    // Calculate flower count based on area scaling
    let flowerCount = Math.round(baseBloemenCount * scaleFactor)
    
    // Minimum and maximum bounds
    flowerCount = Math.max(2, flowerCount) // Minimum 2 bloemen
    flowerCount = Math.min(20, flowerCount) // Maximum 20 bloemen
    
    // If we have multiple plant types, distribute flowers among them
    if (plants.length > 1) {
      return Math.max(flowerCount, plants.length * 2) // At least 2 flowers per plant type
    }
    
    return flowerCount
  }, [containerWidth, containerHeight, plants.length])



  // Generate flower instances based on plants and area
  useEffect(() => {
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []
    const padding = 12 // Padding from edges - increased for better flower containment
    const usableWidth = containerWidth - (padding * 2)
    const usableHeight = containerHeight - (padding * 2)

    // Calculate flowers per plant type
    const flowersPerPlant = Math.max(1, Math.floor(calculateFlowerCount / plants.length))
    const extraFlowers = calculateFlowerCount % plants.length

    plants.forEach((plant, plantIndex) => {
      // How many flowers for this specific plant
      const flowerCountForThisPlant = flowersPerPlant + (plantIndex < extraFlowers ? 1 : 0)
      
      // Fixed flower size - larger to accommodate name text
      const flowerSize = Math.max(24, Math.min(40, Math.min(usableWidth, usableHeight) / 4))
      
      // Create multiple flowers for this plant
      for (let i = 0; i < flowerCountForThisPlant; i++) {
        // Simple grid-based positioning that ALWAYS stays within bounds
        let x, y
        
        if (flowerCountForThisPlant === 1) {
          // Single flower - center it perfectly
          x = containerWidth / 2
          y = containerHeight / 2
        } else {
          // Multiple flowers - use simple grid with guaranteed bounds
          const cols = Math.ceil(Math.sqrt(flowerCountForThisPlant))
          const rows = Math.ceil(flowerCountForThisPlant / cols)
          const col = i % cols
          const row = Math.floor(i / cols)
          
          // Calculate grid cell size with proper margins
          const cellWidth = usableWidth / cols
          const cellHeight = usableHeight / rows
          
          // Position in center of each grid cell
          x = padding + (col * cellWidth) + (cellWidth / 2)
          y = padding + (row * cellHeight) + (cellHeight / 2)
          
          // Add small random offset but keep within cell bounds
          const maxOffset = Math.min(8, cellWidth / 4, cellHeight / 4)
          const offsetX = ((plant.id.charCodeAt(0) + i * 37) % (maxOffset * 2)) - maxOffset
          const offsetY = ((plant.id.charCodeAt(0) + i * 53) % (maxOffset * 2)) - maxOffset
          
          x += offsetX
          y += offsetY
        }
        
        // FINAL SAFETY CHECK - absolutely ensure flowers stay within container
        const halfSize = flowerSize / 2
        x = Math.max(halfSize + padding, Math.min(x, containerWidth - halfSize - padding))
        y = Math.max(halfSize + padding, Math.min(y, containerHeight - halfSize - padding))
        
        // Create flower instance
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
          isMainFlower: i === 0, // First flower of each plant is "main"
          canFillContainer: false
        })
      }
    })

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight, calculateFlowerCount])

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
          {/* Small flower emoji without background */}
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              fontSize: Math.max(16, flower.size * 0.9),
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            }}
          >
            {/* Use flower emoji or create a simple flower symbol */}
            <span className="select-none">
              {flower.emoji && (flower.emoji.includes('🌸') || flower.emoji.includes('🌺') || flower.emoji.includes('🌻') || flower.emoji.includes('🌷') || flower.emoji.includes('🌹') || flower.emoji.includes('💐') || flower.emoji.includes('🌼')) 
                ? flower.emoji 
                : '🌸'}
            </span>
            
            {/* Flower name below the emoji */}
            <div 
              className="text-xs font-medium text-gray-700 mt-1 text-center select-none whitespace-nowrap"
              style={{
                fontSize: Math.max(8, flower.size * 0.3),
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                maxWidth: flower.size * 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
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
          {[...Array(Math.min(3, Math.floor(calculateFlowerCount / 6)))].map((_, i) => (
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