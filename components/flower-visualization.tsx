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
  subFlowers?: FlowerInstance[]
}

export function FlowerVisualization({ plantBed, plants, containerWidth, containerHeight }: FlowerVisualizationProps) {
  const [flowerInstances, setFlowerInstances] = useState<FlowerInstance[]>([])

  // Calculate how many sub-flowers should be inside each flower based on its size
  const calculateSubFlowerCount = (flowerSize: number) => {
    const area = flowerSize * flowerSize
    
    // Very small flowers: just the main flower
    if (flowerSize < 40) return 0
    
    // Small flowers: 1-2 sub-flowers
    if (flowerSize < 80) return Math.floor(area / 2000)
    
    // Medium flowers: 3-6 sub-flowers
    if (flowerSize < 120) return Math.floor(area / 1500)
    
    // Large flowers: 6-12 sub-flowers
    return Math.min(12, Math.floor(area / 1000))
  }

  // Generate flower instances - one per plant
  useEffect(() => {
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []
    const padding = 8
    const usableWidth = containerWidth - (padding * 2)
    const usableHeight = containerHeight - (padding * 2)

    plants.forEach((plant, plantIndex) => {
      // Check if this plant has custom sizing
      const hasCustomSize = 'visual_width' in plant && plant.visual_width && plant.visual_height
      const plantWidth = hasCustomSize ? plant.visual_width! : 0
      const plantHeight = hasCustomSize ? plant.visual_height! : 0

      let flowerSize: number
      let x: number
      let y: number

      if (hasCustomSize && 'position_x' in plant && plant.position_x !== undefined && 'position_y' in plant && plant.position_y !== undefined) {
        // Use exact database values for size and position
        flowerSize = Math.min(plantWidth, plantHeight)
        
        // Scale positions to fit the container
        const scaleX = usableWidth / Math.max(plantWidth, 100)
        const scaleY = usableHeight / Math.max(plantHeight, 100)
        const scale = Math.min(scaleX, scaleY, 1)
        
        const scaledSize = Math.max(20, flowerSize * scale)
        const scaledX = plant.position_x * scale
        const scaledY = plant.position_y * scale
        
        x = Math.max(padding, Math.min(scaledX + padding, containerWidth - scaledSize - padding))
        y = Math.max(padding, Math.min(scaledY + padding, containerHeight - scaledSize - padding))
        flowerSize = scaledSize
      } else {
        // Default positioning for multiple plants
        if (plants.length === 1) {
          // Single plant - center it and make it fill most of the container
          flowerSize = Math.min(usableWidth * 0.8, usableHeight * 0.8, 200)
          x = (containerWidth - flowerSize) / 2
          y = (containerHeight - flowerSize) / 2
        } else {
          // Multiple plants - distribute them
          const cols = Math.ceil(Math.sqrt(plants.length))
          const rows = Math.ceil(plants.length / cols)
          const col = plantIndex % cols
          const row = Math.floor(plantIndex / cols)
          
          const cellWidth = usableWidth / cols
          const cellHeight = usableHeight / rows
          
          flowerSize = Math.min(cellWidth * 0.7, cellHeight * 0.7, 80)
          x = padding + col * cellWidth + (cellWidth - flowerSize) / 2
          y = padding + row * cellHeight + (cellHeight - flowerSize) / 2
        }
      }

      // Create sub-flowers based on the main flower size
      const subFlowerCount = calculateSubFlowerCount(flowerSize)
      const subFlowers: FlowerInstance[] = []

      if (subFlowerCount > 0) {
        const subFlowerSize = Math.max(8, flowerSize * 0.15)
        const margin = subFlowerSize
        const usableFlowerWidth = flowerSize - (margin * 2)
        const usableFlowerHeight = flowerSize - (margin * 2)
        
        for (let i = 0; i < subFlowerCount; i++) {
          // Use deterministic positioning for consistency
          const seedValue = plant.id.charCodeAt(0) + i * 137.5 // Golden angle
          const angle = (seedValue * Math.PI / 180) % (2 * Math.PI)
          const radiusPercent = 0.2 + (((seedValue * 7) % 100) / 100) * 0.6 // 20-80% of available radius
          const maxRadius = Math.min(usableFlowerWidth, usableFlowerHeight) / 2
          const radius = radiusPercent * maxRadius
          
          const subX = flowerSize / 2 + Math.cos(angle) * radius - subFlowerSize / 2
          const subY = flowerSize / 2 + Math.sin(angle) * radius - subFlowerSize / 2
          
          // Ensure sub-flowers stay within flower bounds
          const clampedX = Math.max(margin, Math.min(subX, flowerSize - margin - subFlowerSize))
          const clampedY = Math.max(margin, Math.min(subY, flowerSize - margin - subFlowerSize))
          
          subFlowers.push({
            id: `${plant.id}-sub-${i}`,
            name: plant.name,
            color: plant.color || '#FF69B4',
            emoji: plant.emoji,
            size: subFlowerSize,
            x: clampedX,
            y: clampedY,
            opacity: 0.7 + (((seedValue * 3) % 30) / 100),
            rotation: (seedValue * 5) % 360,
            isMainFlower: false
          })
        }
      }

      // Create the main flower
      instances.push({
        id: `${plant.id}-main`,
        name: plant.name,
        color: plant.color || '#FF69B4',
        emoji: plant.emoji,
        size: flowerSize,
        x,
        y,
        opacity: 1,
        rotation: 0,
        isMainFlower: true,
        subFlowers
      })
    })

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight])

  // Render nothing if no plants
  if (plants.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flowerInstances.map((flower) => (
        <div
          key={flower.id}
          className="absolute transition-all duration-500 ease-in-out"
          style={{
            left: flower.x,
            top: flower.y,
            width: flower.size,
            height: flower.size,
            opacity: flower.opacity,
            transform: `rotate(${flower.rotation}deg)`,
            zIndex: 10,
          }}
        >
          {/* Main flower container */}
          <div
            className="w-full h-full flex items-center justify-center border border-white/30 rounded-lg shadow-lg relative"
            style={{
              backgroundColor: flower.color,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Main flower content - only show if no sub-flowers or flower is small */}
            {(!flower.subFlowers || flower.subFlowers.length === 0) && (
              <div
                className="text-white font-bold text-center leading-none select-none"
                style={{
                  fontSize: Math.max(12, flower.size * 0.4),
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                {flower.emoji || flower.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Sub-flowers inside the main flower */}
            {flower.subFlowers && flower.subFlowers.map((subFlower) => (
              <div
                key={subFlower.id}
                className="absolute"
                style={{
                  left: subFlower.x,
                  top: subFlower.y,
                  width: subFlower.size,
                  height: subFlower.size,
                  opacity: subFlower.opacity,
                  transform: `rotate(${subFlower.rotation}deg)`,
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center border border-white/40 rounded-md shadow-sm"
                  style={{
                    backgroundColor: subFlower.color,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  <div
                    className="text-white font-bold text-center leading-none select-none"
                    style={{
                      fontSize: Math.max(6, subFlower.size * 0.4),
                      textShadow: '0 1px 1px rgba(0,0,0,0.8)',
                    }}
                  >
                    {subFlower.emoji || subFlower.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Glow effect for main flower */}
          <div
            className="absolute inset-0 rounded-xl opacity-25 blur-md -z-10"
            style={{
              backgroundColor: flower.color,
              transform: 'scale(1.3)',
            }}
          />

          {/* Sparkle effects */}
          <div
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: flower.size * 0.2,
              left: flower.size * 0.3,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
          <div
            className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-pulse"
            style={{
              top: flower.size * 0.7,
              right: flower.size * 0.3,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        </div>
      ))}

      {/* Floating particles for atmosphere */}
      {containerWidth > 100 && containerHeight > 100 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.min(6, plants.length * 2))].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full opacity-40 animate-bounce"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                backgroundColor: ['#FFD700', '#FF69B4', '#98FB98', '#87CEEB', '#DDA0DD'][Math.floor(Math.random() * 5)],
                left: Math.random() * (containerWidth - 6),
                top: Math.random() * (containerHeight - 6),
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}