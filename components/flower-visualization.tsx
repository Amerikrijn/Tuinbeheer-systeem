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

      // Render all flowers as regular flowers (no more flower fields)
      // Use exact position and size from database if available
      if (hasCustomSize && 'position_x' in plant && plant.position_x !== undefined && 'position_y' in plant && plant.position_y !== undefined) {
        // Use exact database values for consistent positioning between views
        const flowerSize = Math.min(plantWidth, plantHeight)
        
        // Scale positions to fit the container while maintaining relative positions
        const scaleX = (containerWidth - padding * 2) / Math.max(plantWidth, 100) // Minimum reference width
        const scaleY = (containerHeight - padding * 2) / Math.max(plantHeight, 100) // Minimum reference height
        const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down if needed
        
        const scaledX = plant.position_x * scale
        const scaledY = plant.position_y * scale
        const scaledSize = Math.max(16, flowerSize * scale) // Minimum 16px for visibility
        
        // Ensure the flower stays within container bounds with better constraint
        const x = Math.max(padding, Math.min(scaledX + padding, containerWidth - scaledSize - padding))
        const y = Math.max(padding, Math.min(scaledY + padding, containerHeight - scaledSize - padding))

        instances.push({
          id: `${plant.id}-main`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: plant.emoji,
          size: Math.max(16, scaledSize), // Ensure minimum visibility
          x,
          y,
          opacity: 1,
          rotation: 0, // Keep consistent rotation
          isMainFlower: true,
          canFillContainer: scaledSize > 40
        })
      } else {
        // For plants without custom positioning, create a single centered flower
        const baseSize = Math.min(50, Math.max(20, Math.min(usableWidth, usableHeight) / 4))
        
        instances.push({
          id: `${plant.id}-main`,
          name: plant.name,
          color: plant.color || '#FF69B4',
          emoji: plant.emoji,
          size: baseSize,
          x: (containerWidth - baseSize) / 2,
          y: (containerHeight - baseSize) / 2,
          opacity: 1,
          rotation: 0,
          isMainFlower: true,
          canFillContainer: containerWidth > 80 && containerHeight > 80
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
            left: flower.x,
            top: flower.y,
            width: flower.size,
            height: flower.size,
            opacity: flower.opacity,
            transform: `rotate(${flower.rotation}deg)`,
            zIndex: flower.isMainFlower ? 10 : 8,
          }}
        >
          {/* Flower as rounded square */}
          <div
            className="w-full h-full flex items-center justify-center border border-white/30 rounded-lg shadow-lg"
            style={{
              backgroundColor: flower.color,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)',
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