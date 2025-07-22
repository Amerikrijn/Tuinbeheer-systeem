"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  isFlowerField: boolean
  fieldSize?: number
  plantIndex: number
}

export function FlowerVisualization({ plantBed, plants, containerWidth, containerHeight }: FlowerVisualizationProps) {
  const [flowerInstances, setFlowerInstances] = useState<FlowerInstance[]>([])

  // Calculate how many flowers should be displayed based on plant bed size with better scaling
  const calculateFlowerCount = useMemo(() => {
    const area = containerWidth * containerHeight
    const baseFlowersPerPlant = Math.max(1, Math.floor(area / 8000)) // More flowers for larger areas
    
    // Scale based on both plant count and area
    if (plants.length === 1) {
      // Single plant gets multiple flowers based on area
      return Math.min(12, Math.max(3, Math.floor(area / 6000)))
    } else {
      // Multiple plants get distributed flowers
      return Math.min(plants.length * 3, Math.max(plants.length, Math.floor(area / 4000)))
    }
  }, [containerWidth, containerHeight, plants.length])

  // Better distribution algorithm
  const generateDistributedPositions = useCallback((count: number, padding: number) => {
    const positions: { x: number; y: number }[] = []
    const usableWidth = containerWidth - (padding * 2)
    const usableHeight = containerHeight - (padding * 2)
    
    if (count === 1) {
      positions.push({
        x: containerWidth / 2,
        y: containerHeight / 2
      })
    } else if (count <= 4) {
      // Grid layout for small numbers
      const cols = Math.ceil(Math.sqrt(count))
      const rows = Math.ceil(count / cols)
      
      for (let i = 0; i < count; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        
        const x = padding + (col + 0.5) * (usableWidth / cols)
        const y = padding + (row + 0.5) * (usableHeight / rows)
        
        // Add natural variation
        const variation = Math.min(20, usableWidth / 10)
        const offsetX = (Math.sin(i * 2.4) * variation)
        const offsetY = (Math.cos(i * 1.7) * variation)
        
        positions.push({
          x: Math.max(padding, Math.min(x + offsetX, containerWidth - padding)),
          y: Math.max(padding, Math.min(y + offsetY, containerHeight - padding))
        })
      }
    } else {
      // Improved organic distribution for larger numbers
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2
      const maxRadius = Math.min(usableWidth, usableHeight) / 2.5
      
      for (let i = 0; i < count; i++) {
        // Use golden spiral for natural distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians
        const angle = i * goldenAngle
        const radius = Math.sqrt(i / count) * maxRadius
        
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        
        // Ensure within bounds
        positions.push({
          x: Math.max(padding, Math.min(x, containerWidth - padding)),
          y: Math.max(padding, Math.min(y, containerHeight - padding))
        })
      }
    }
    
    return positions
  }, [containerWidth, containerHeight])

  // Generate flower instances with better distribution
  useEffect(() => {
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []
    const padding = 16 // More padding for names
    const nameHeight = 20 // Space reserved for flower names
    const usableHeight = containerHeight - nameHeight - padding

    // Calculate flowers per plant with better distribution
    const totalFlowers = calculateFlowerCount
    const baseFlowersPerPlant = Math.floor(totalFlowers / plants.length)
    const extraFlowers = totalFlowers % plants.length

    plants.forEach((plant, plantIndex) => {
      const flowersForThisPlant = baseFlowersPerPlant + (plantIndex < extraFlowers ? 1 : 0)
      
      // Check if this plant has custom sizing
      const hasCustomSize = 'visual_width' in plant && plant.visual_width && plant.visual_height
      const plantWidth = hasCustomSize ? plant.visual_width! : 0
      const plantHeight = hasCustomSize ? plant.visual_height! : 0

      if (hasCustomSize && 'position_x' in plant && plant.position_x !== undefined && 'position_y' in plant && plant.position_y !== undefined) {
        // Use exact database positioning but ensure it fits
        const flowerSize = Math.max(20, Math.min(60, Math.min(plantWidth, plantHeight)))
        
        const x = Math.max(padding, Math.min(plant.position_x, containerWidth - flowerSize - padding))
        const y = Math.max(padding, Math.min(plant.position_y, usableHeight - flowerSize))

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
          canFillContainer: false,
          isFlowerField: false,
          plantIndex
        })
      } else {
        // Distribute flowers for this plant across the available space
        const plantPositions = generateDistributedPositions(flowersForThisPlant, padding)
        
        plantPositions.forEach((pos, flowerIndex) => {
          const isMainFlower = flowerIndex === 0
          const baseSize = Math.max(16, Math.min(50, Math.min(containerWidth, usableHeight) / 8))
          const sizeMultiplier = isMainFlower ? 1.3 : 0.8 + (Math.sin(plantIndex * 2.1 + flowerIndex * 1.7) * 0.3)
          const flowerSize = baseSize * sizeMultiplier
          
          // Ensure flower fits
          const x = Math.max(padding, Math.min(pos.x - flowerSize / 2, containerWidth - flowerSize - padding))
          const y = Math.max(padding, Math.min(pos.y - flowerSize / 2, usableHeight - flowerSize))

          instances.push({
            id: `${plant.id}-${flowerIndex}`,
            name: plant.name,
            color: plant.color || '#FF69B4',
            emoji: plant.emoji,
            size: flowerSize,
            x,
            y,
            opacity: isMainFlower ? 1 : 0.7 + (Math.sin(plantIndex * 1.3 + flowerIndex * 2.1) * 0.2),
            rotation: (plantIndex * 45 + flowerIndex * 73) % 360,
            isMainFlower,
            canFillContainer: false,
            isFlowerField: false,
            plantIndex
          })
        })
      }
    })

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight, calculateFlowerCount, generateDistributedPositions])

  // Group flowers by plant for name display
  const plantGroups = useMemo(() => {
    const groups: { [key: number]: FlowerInstance[] } = {}
    flowerInstances.forEach(flower => {
      if (!groups[flower.plantIndex]) {
        groups[flower.plantIndex] = []
      }
      groups[flower.plantIndex].push(flower)
    })
    return groups
  }, [flowerInstances])

  // Render nothing if no plants
  if (plants.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Flowers */}
      {flowerInstances.map((flower, index) => (
        <div
          key={flower.id}
          className="absolute transition-all duration-700 ease-in-out hover:scale-110"
          style={{
            left: flower.x,
            top: flower.y,
            width: flower.size,
            height: flower.size,
            opacity: flower.opacity,
            transform: `rotate(${flower.rotation}deg)`,
            zIndex: flower.isMainFlower ? 15 : 10,
          }}
        >
          {/* Flower container with improved styling */}
          <div
            className={`w-full h-full flex items-center justify-center border-2 rounded-xl ${
              flower.isMainFlower 
                ? 'border-white/60 shadow-lg' 
                : 'border-white/40 shadow-md'
            } transition-all duration-300`}
            style={{
              backgroundColor: flower.color,
              boxShadow: flower.isMainFlower 
                ? `0 6px 20px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.4), 0 0 20px ${flower.color}40`
                : `0 3px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
          >
            {/* Flower content */}
            <div
              className="text-white font-bold text-center leading-none select-none drop-shadow-lg"
              style={{
                fontSize: Math.max(8, flower.size * 0.4),
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {flower.emoji || flower.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Enhanced glow effect for main flowers */}
          {flower.isMainFlower && (
            <div
              className="absolute inset-0 rounded-xl opacity-30 blur-lg -z-10 animate-pulse"
              style={{
                backgroundColor: flower.color,
                transform: 'scale(1.5)',
                animationDuration: '3s'
              }}
            />
          )}

          {/* Sparkle effects */}
          {flower.isMainFlower && (
            <>
              <div
                className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping"
                style={{
                  top: flower.size * 0.15,
                  left: flower.size * 0.25,
                  animationDelay: `${index * 0.3}s`,
                }}
              />
              <div
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: flower.size * 0.75,
                  right: flower.size * 0.25,
                  animationDelay: `${index * 0.5}s`,
                }}
              />
            </>
          )}
        </div>
      ))}

      {/* Flower names at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-1 px-2">
          {plants.map((plant, index) => {
            const plantFlowers = plantGroups[index] || []
            const mainFlower = plantFlowers.find(f => f.isMainFlower) || plantFlowers[0]
            
            if (!mainFlower) return null
            
            return (
              <div
                key={plant.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm border"
                style={{
                  backgroundColor: `${plant.color || '#FF69B4'}20`,
                  borderColor: `${plant.color || '#FF69B4'}40`,
                  color: plant.color || '#FF69B4'
                }}
              >
                <span className="text-xs">
                  {plant.emoji || '🌸'}
                </span>
                <span className="font-semibold max-w-16 truncate">
                  {plant.name}
                </span>
                {plantFlowers.length > 1 && (
                  <span className="text-xs opacity-75">
                    ×{plantFlowers.length}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Playful floating particles that scale with container size */}
      {containerWidth > 100 && containerHeight > 100 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.min(12, Math.floor((containerWidth * containerHeight) / 8000)))].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full opacity-40 animate-bounce"
              style={{
                width: 2 + Math.random() * 4,
                height: 2 + Math.random() * 4,
                backgroundColor: ['#FFD700', '#FF69B4', '#98FB98', '#87CEEB', '#DDA0DD', '#FFA07A'][Math.floor(Math.random() * 6)],
                left: Math.random() * (containerWidth - 8),
                top: Math.random() * (containerHeight - 25), // Avoid name area
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Magical atmosphere for larger containers */}
      {containerWidth > 200 && containerHeight > 200 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 30% 40%, rgba(255,182,193,0.6) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(152,251,152,0.4) 0%, transparent 50%)'
            }}
          />
          
          {/* Floating hearts and stars */}
          {[...Array(Math.min(6, Math.floor(containerWidth / 80)))].map((_, i) => (
            <div
              key={`magic-${i}`}
              className="absolute opacity-25 animate-pulse select-none"
              style={{
                fontSize: 8 + Math.random() * 6,
                left: Math.random() * (containerWidth - 20),
                top: Math.random() * (containerHeight - 30),
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                color: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD'][Math.floor(Math.random() * 4)]
              }}
            >
              {['♥', '✨', '⭐', '🦋'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}