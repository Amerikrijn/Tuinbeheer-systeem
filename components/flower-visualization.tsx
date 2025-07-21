"use client"

import React, { useState, useEffect, useMemo } from 'react'
import type { PlantBedWithPlants, Plant } from "@/lib/supabase"

interface FlowerVisualizationProps {
  plantBed: PlantBedWithPlants
  plants: Plant[]
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
    const area = containerWidth * containerHeight
    const baseFlowerSize = 24 // Base size in pixels
    const baseArea = baseFlowerSize * baseFlowerSize
    
    // More flowers for larger areas - exponential growth for playful effect
    const densityFactor = Math.sqrt(area / baseArea) * 0.8
    const playfulMultiplier = containerWidth > 200 && containerHeight > 200 ? 1.5 : 1
    return Math.max(1, Math.floor(densityFactor * playfulMultiplier))
  }, [containerWidth, containerHeight])

  // Check if we should show a single large flower that fills the container
  const shouldShowLargeFlower = useMemo(() => {
    return plants.length === 1 && containerWidth > 100 && containerHeight > 100
  }, [plants.length, containerWidth, containerHeight])

  // Generate flower instances based on plants and area
  useEffect(() => {
    if (plants.length === 0) {
      setFlowerInstances([])
      return
    }

    const instances: FlowerInstance[] = []
    const padding = 8 // Padding from edges
    const usableWidth = containerWidth - (padding * 2)
    const usableHeight = containerHeight - (padding * 2)

    if (shouldShowLargeFlower) {
      // Single large flower that can fill most of the container
      const plant = plants[0]
      const largeSize = Math.min(usableWidth * 0.8, usableHeight * 0.8)
      
      instances.push({
        id: `${plant.id}-main`,
        name: plant.name,
        color: plant.color || '#FF69B4',
        emoji: plant.emoji,
        size: largeSize,
        x: (containerWidth - largeSize) / 2,
        y: (containerHeight - largeSize) / 2,
        opacity: 1,
        rotation: 0,
        isMainFlower: true,
        canFillContainer: true
      })

      // Add smaller decorative flowers around the main one for playful effect
      const decorativeCount = Math.min(6, Math.floor(calculateFlowerCount / 2))
      for (let i = 0; i < decorativeCount; i++) {
        const angle = (i / decorativeCount) * 2 * Math.PI
        const radius = largeSize / 2 + 20 + (Math.random() * 15)
        const decorativeSize = 12 + (Math.random() * 8)
        
        const centerX = containerWidth / 2
        const centerY = containerHeight / 2
        const x = centerX + Math.cos(angle) * radius - decorativeSize / 2
        const y = centerY + Math.sin(angle) * radius - decorativeSize / 2
        
        // Keep within bounds
        if (x >= padding && y >= padding && 
            x + decorativeSize <= containerWidth - padding && 
            y + decorativeSize <= containerHeight - padding) {
          instances.push({
            id: `${plant.id}-deco-${i}`,
            name: plant.name,
            color: plant.color || '#FF69B4',
            emoji: plant.emoji,
            size: decorativeSize,
            x,
            y,
            opacity: 0.6 + (Math.random() * 0.3),
            rotation: Math.random() * 360,
            isMainFlower: false,
            canFillContainer: false
          })
        }
      }
    } else {
      // Multiple flowers - distribute nicely
      plants.forEach((plant, plantIndex) => {
        // Determine how many instances of this plant to show
        const instancesPerPlant = Math.max(1, Math.floor(calculateFlowerCount / plants.length))
        const extraInstances = calculateFlowerCount % plants.length
        const totalInstances = instancesPerPlant + (plantIndex < extraInstances ? 1 : 0)

        // Base flower size - can grow with plant bed size
        const baseSize = Math.min(40, Math.max(16, Math.min(usableWidth, usableHeight) / 4))
        
        for (let i = 0; i < totalInstances; i++) {
          // Create multiple sizes for visual interest
          const sizeVariation = i === 0 ? 1.3 : 0.7 + (Math.random() * 0.6) // Main flower is larger
          const flowerSize = baseSize * sizeVariation

          // Position flowers with some randomness but avoid overlaps
          let x, y
          let attempts = 0
          do {
            if (totalInstances === 1) {
              // Single flower - center it
              x = (usableWidth - flowerSize) / 2 + padding
              y = (usableHeight - flowerSize) / 2 + padding
            } else if (totalInstances === 2) {
              // Two flowers - side by side
              x = (i === 0 ? usableWidth * 0.25 : usableWidth * 0.75) - flowerSize / 2 + padding
              y = (usableHeight - flowerSize) / 2 + padding + (Math.random() - 0.5) * 20
            } else {
              // Multiple flowers - circular distribution with randomness
              const angle = (i / totalInstances) * 2 * Math.PI + (Math.random() - 0.5) * 0.8
              const radius = Math.min(usableWidth, usableHeight) / 4 + (Math.random() * 25)
              const centerX = usableWidth / 2 + padding
              const centerY = usableHeight / 2 + padding
              
              x = centerX + Math.cos(angle) * radius - flowerSize / 2
              y = centerY + Math.sin(angle) * radius - flowerSize / 2
            }
            
            // Keep within bounds
            x = Math.max(padding, Math.min(x, containerWidth - flowerSize - padding))
            y = Math.max(padding, Math.min(y, containerHeight - flowerSize - padding))
            attempts++
          } while (attempts < 10) // Prevent infinite loops

          instances.push({
            id: `${plant.id}-${i}`,
            name: plant.name,
            color: plant.color || '#FF69B4',
            emoji: plant.emoji,
            size: flowerSize,
            x,
            y,
            opacity: i === 0 ? 1 : 0.7 + (Math.random() * 0.3), // Main flower is fully opaque
            rotation: Math.random() * 360,
            isMainFlower: i === 0,
            canFillContainer: totalInstances === 1 && containerWidth > 80 && containerHeight > 80
          })
        }
      })
    }

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight, calculateFlowerCount, shouldShowLargeFlower])

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
            left: flower.x,
            top: flower.y,
            width: flower.size,
            height: flower.size,
            opacity: flower.opacity,
            transform: `rotate(${flower.rotation}deg)`,
            zIndex: flower.isMainFlower ? 10 : 5, // Main flower on top
          }}
        >
          {/* Flower as rounded square */}
          <div
            className={`w-full h-full flex items-center justify-center border border-white/30 ${
              flower.canFillContainer ? 'rounded-xl' : 'rounded-lg'
            } ${flower.isMainFlower ? 'shadow-lg' : 'shadow-sm'}`}
            style={{
              backgroundColor: flower.color,
              boxShadow: flower.isMainFlower 
                ? '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)'
                : '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Content - emoji or first letter of name */}
            <div
              className="text-white font-bold text-center leading-none select-none"
              style={{
                fontSize: Math.max(10, flower.size * 0.35),
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {flower.emoji || flower.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Glow effect for main flowers */}
          {flower.isMainFlower && (
            <div
              className="absolute inset-0 rounded-xl opacity-25 blur-md -z-10"
              style={{
                backgroundColor: flower.color,
                transform: 'scale(1.3)',
              }}
            />
          )}

          {/* Sparkle effects for visual interest */}
          {(flower.isMainFlower || Math.random() > 0.8) && (
            <>
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
            </>
          )}
        </div>
      ))}

      {/* Playful floating particles - more when container is larger */}
      {containerWidth > 100 && containerHeight > 100 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(Math.min(8, Math.floor(calculateFlowerCount / 2)))].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full opacity-40 animate-bounce"
              style={{
                width: 3 + Math.random() * 4,
                height: 3 + Math.random() * 4,
                backgroundColor: ['#FFD700', '#FF69B4', '#98FB98', '#87CEEB', '#DDA0DD'][Math.floor(Math.random() * 5)],
                left: Math.random() * (containerWidth - 8),
                top: Math.random() * (containerHeight - 8),
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
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
          
          {/* Floating hearts for extra cuteness */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`heart-${i}`}
              className="absolute text-pink-300 opacity-30 animate-pulse select-none"
              style={{
                fontSize: 12 + Math.random() * 8,
                left: Math.random() * (containerWidth - 20),
                top: Math.random() * (containerHeight - 20),
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              ♥
            </div>
          ))}
        </div>
      )}
    </div>
  )
}