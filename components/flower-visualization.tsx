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
  isFlowerField: boolean
  fieldSize?: number
}

export function FlowerVisualization({ plantBed, plants, containerWidth, containerHeight }: FlowerVisualizationProps) {
  const [flowerInstances, setFlowerInstances] = useState<FlowerInstance[]>([])

  // Calculate how many flowers should be displayed based on plant bed size
  const calculateFlowerCount = useMemo(() => {
    const area = containerWidth * containerHeight
    
    // Much more conservative flower count based on container area
    if (area <= 10000) {
      // Very small containers: 1-2 flowers
      return Math.min(2, Math.max(1, plants.length))
    } else if (area <= 25000) {
      // Small containers: 2-4 flowers
      return Math.min(4, Math.max(2, plants.length))
    } else if (area <= 50000) {
      // Medium containers: 3-6 flowers
      return Math.min(6, Math.max(3, plants.length))
    } else {
      // Large containers: 4-8 flowers max
      return Math.min(8, Math.max(4, plants.length))
    }
  }, [containerWidth, containerHeight, plants.length])

  // Check if we should show a single large flower field that fills the container
  const shouldShowFlowerField = useMemo(() => {
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

    plants.forEach((plant, plantIndex) => {
      // Check if this plant has custom sizing (from the detailed view)
      const hasCustomSize = 'visual_width' in plant && plant.visual_width && plant.visual_height
      const plantWidth = hasCustomSize ? plant.visual_width! : 0
      const plantHeight = hasCustomSize ? plant.visual_height! : 0

      // Determine if this should be a flower field (large single flower with sub-flowers)
      const isLargeFlowerField = hasCustomSize && (plantWidth > 100 || plantHeight > 100)
      const canBecomeFlowerField = containerWidth > 150 && containerHeight > 150

      if (isLargeFlowerField && canBecomeFlowerField) {
        // Create a flower field - main flower with sub-flowers inside
        const fieldSize = Math.min(
          Math.max(plantWidth, 60), 
          Math.min(usableWidth * 0.9, usableHeight * 0.9)
        )
        
        // Position the field
        const fieldX = hasCustomSize && 'position_x' in plant && plant.position_x !== undefined 
          ? Math.max(padding, Math.min(plant.position_x, containerWidth - fieldSize - padding))
          : (containerWidth - fieldSize) / 2
        const fieldY = hasCustomSize && 'position_y' in plant && plant.position_y !== undefined
          ? Math.max(padding, Math.min(plant.position_y, containerHeight - fieldSize - padding))
          : (containerHeight - fieldSize) / 2

        // Main flower field background
        instances.push({
          id: `${plant.id}-field`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: plant.emoji,
          size: fieldSize,
          x: fieldX,
          y: fieldY,
          opacity: 0.3, // Semi-transparent background
          rotation: 0,
          isMainFlower: true,
          canFillContainer: true,
          isFlowerField: true,
          fieldSize: fieldSize
        })

        // Calculate how many sub-flowers to show based on field size
        const fieldArea = fieldSize * fieldSize
        const baseFlowerArea = 30 * 30 // Base sub-flower size
        const maxSubFlowers = Math.floor(fieldArea / (baseFlowerArea * 2)) // Not too crowded
        const actualSubFlowers = Math.min(maxSubFlowers, Math.max(3, Math.floor(fieldSize / 40)))

                 // Create sub-flowers within the field with consistent positioning
         const margin = Math.max(10, fieldSize * 0.1) // Margin from field edges
         const usableFieldWidth = fieldSize - (margin * 2)
         const usableFieldHeight = fieldSize - (margin * 2)
         
         for (let i = 0; i < actualSubFlowers; i++) {
           // Use deterministic positioning based on plant ID and index for consistency
           const seedValue = plant.id.charCodeAt(0) + i * 137.5 // Golden angle for natural distribution
           const angle = (seedValue * Math.PI / 180) % (2 * Math.PI)
           const radiusPercent = 0.3 + (((seedValue * 7) % 100) / 100) * 0.4 // 30-70% of available radius
           const maxRadius = Math.min(usableFieldWidth, usableFieldHeight) / 2
           const radius = radiusPercent * maxRadius
           
           const subFlowerSize = Math.max(16, Math.min(30, fieldSize * 0.15)) // Size based on field size
           
           const subX = fieldX + fieldSize / 2 + Math.cos(angle) * radius - subFlowerSize / 2
           const subY = fieldY + fieldSize / 2 + Math.sin(angle) * radius - subFlowerSize / 2
           
           // Ensure sub-flowers stay within field bounds
           const clampedX = Math.max(fieldX + margin, Math.min(subX, fieldX + fieldSize - margin - subFlowerSize))
           const clampedY = Math.max(fieldY + margin, Math.min(subY, fieldY + fieldSize - margin - subFlowerSize))
           
           instances.push({
             id: `${plant.id}-sub-${i}`,
             name: plant.name,
             color: plant.color || '#FF69B4',
             emoji: plant.emoji,
             size: subFlowerSize,
             x: clampedX,
             y: clampedY,
             opacity: 0.8 + (((seedValue * 3) % 20) / 100), // Consistent opacity based on seed
             rotation: (seedValue * 5) % 360, // Consistent rotation
             isMainFlower: false,
             canFillContainer: false,
             isFlowerField: false
           })
         }

      } else if (shouldShowFlowerField && !hasCustomSize) {
        // Single large flower that can fill most of the container (original behavior)
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
          canFillContainer: true,
          isFlowerField: false
        })

        // Add smaller decorative flowers around the main one
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
              canFillContainer: false,
              isFlowerField: false
            })
          }
        }

      } else {
        // Regular flowers - use exact position and size from database if available
        if (hasCustomSize && 'position_x' in plant && plant.position_x !== undefined && 'position_y' in plant && plant.position_y !== undefined) {
          // Use exact database values for consistent positioning between views
          const flowerSize = Math.min(plantWidth, plantHeight)
          
          // Scale positions to fit the container while maintaining relative positions
          const scaleX = (containerWidth - padding * 2) / Math.max(plantWidth, 100) // Minimum reference width
          const scaleY = (containerHeight - padding * 2) / Math.max(plantHeight, 100) // Minimum reference height
          const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down if needed
          
          const scaledX = plant.position_x * scale
          const scaledY = plant.position_y * scale
          const scaledSize = Math.max(8, flowerSize * scale) // Minimum 8px for visibility
          
          // Ensure the flower stays within container bounds with better constraint
          const x = Math.max(padding, Math.min(scaledX + padding, containerWidth - scaledSize - padding))
          const y = Math.max(padding, Math.min(scaledY + padding, containerHeight - scaledSize - padding))

          instances.push({
            id: `${plant.id}-main`,
            name: plant.name,
            color: plant.color || '#FF69B4',
            emoji: plant.emoji,
            size: Math.max(8, scaledSize), // Ensure minimum visibility
            x,
            y,
            opacity: 1,
            rotation: 0, // Keep consistent rotation
            isMainFlower: true,
            canFillContainer: scaledSize > 40,
            isFlowerField: false
          })
        } else {
          // Multiple flowers - distribute nicely to fill the bed (fallback behavior)
          const instancesPerPlant = Math.max(1, Math.floor(calculateFlowerCount / plants.length))
          const extraInstances = calculateFlowerCount % plants.length
          const totalInstances = instancesPerPlant + (plantIndex < extraInstances ? 1 : 0)

          const baseSize = Math.min(35, Math.max(14, Math.min(usableWidth, usableHeight) / 6))
          
          for (let i = 0; i < totalInstances; i++) {
            const sizeVariation = i === 0 ? 1.4 : 0.6 + (((plant.id.charCodeAt(0) + i * 43) % 70) / 100)
            const flowerSize = baseSize * sizeVariation

            // Use improved positioning for better distribution
            let x, y
            if (totalInstances === 1) {
              x = (usableWidth - flowerSize) / 2 + padding
              y = (usableHeight - flowerSize) / 2 + padding
            } else if (totalInstances <= 4) {
              // Grid layout for small numbers
              const cols = Math.ceil(Math.sqrt(totalInstances))
              const rows = Math.ceil(totalInstances / cols)
              const col = i % cols
              const row = Math.floor(i / cols)
              
              x = padding + (col + 0.5) * (usableWidth / cols) - flowerSize / 2
              y = padding + (row + 0.5) * (usableHeight / rows) - flowerSize / 2
              
              // Add some natural variation
              const variation = 15
              x += ((plant.id.charCodeAt(0) + i * 37) % (variation * 2)) - variation
              y += ((plant.id.charCodeAt(0) + i * 53) % (variation * 2)) - variation
            } else {
              // Improved circular/spiral distribution for larger numbers
              const seedValue = plant.id.charCodeAt(0) + i * 137.5 // Golden angle
              const angle = (seedValue * Math.PI / 180) % (2 * Math.PI)
              const radiusPercent = 0.1 + (i / totalInstances) * 0.8 // Spiral outward
              const maxRadius = Math.min(usableWidth, usableHeight) / 2.5
              const radius = radiusPercent * maxRadius
              const centerX = usableWidth / 2 + padding
              const centerY = usableHeight / 2 + padding
              
              x = centerX + Math.cos(angle) * radius - flowerSize / 2
              y = centerY + Math.sin(angle) * radius - flowerSize / 2
            }
            
            // Keep within bounds with better constraint
            x = Math.max(padding, Math.min(x, containerWidth - flowerSize - padding))
            y = Math.max(padding, Math.min(y, containerHeight - flowerSize - padding))

            instances.push({
              id: `${plant.id}-${i}`,
              name: plant.name,
              color: plant.color || '#FF69B4',
              emoji: plant.emoji,
              size: flowerSize,
              x,
              y,
              opacity: i === 0 ? 1 : 0.7 + (((plant.id.charCodeAt(0) + i * 17) % 30) / 100),
              rotation: (plant.id.charCodeAt(0) + i * 91) % 360,
              isMainFlower: i === 0,
              canFillContainer: totalInstances === 1 && containerWidth > 80 && containerHeight > 80,
              isFlowerField: false
            })
          }
        }
      }
    })

    setFlowerInstances(instances)
  }, [plants, containerWidth, containerHeight, calculateFlowerCount, shouldShowFlowerField])

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
            zIndex: flower.isMainFlower ? 10 : flower.isFlowerField ? 5 : 8,
          }}
        >
          {/* Flower as rounded square */}
          <div
            className={`w-full h-full flex items-center justify-center border ${
              flower.isFlowerField 
                ? 'border-white/50 rounded-xl border-dashed' 
                : 'border-white/30 rounded-lg'
            } ${flower.isMainFlower ? 'shadow-lg' : 'shadow-sm'}`}
            style={{
              backgroundColor: flower.isFlowerField 
                ? `${flower.color}20` // Very transparent for field background
                : flower.color,
              boxShadow: flower.isMainFlower 
                ? '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)'
                : flower.isFlowerField
                ? 'inset 0 0 20px rgba(255,255,255,0.1)'
                : '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Content - emoji or first letter of name */}
            {!flower.isFlowerField && (
              <div
                className="text-white font-bold text-center leading-none select-none"
                style={{
                  fontSize: Math.max(10, flower.size * 0.35),
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                {flower.emoji || flower.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Field label */}
            {flower.isFlowerField && (
              <div className="text-center text-white/60 font-medium text-xs">
                {flower.name} Veld
              </div>
            )}
          </div>

          {/* Glow effect for main flowers */}
          {flower.isMainFlower && !flower.isFlowerField && (
            <div
              className="absolute inset-0 rounded-xl opacity-25 blur-md -z-10"
              style={{
                backgroundColor: flower.color,
                transform: 'scale(1.3)',
              }}
            />
          )}

          {/* Sparkle effects for visual interest */}
          {(flower.isMainFlower || Math.random() > 0.8) && !flower.isFlowerField && (
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