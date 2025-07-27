"use client"

import React from 'react'
import type { PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"

interface UnifiedPlantvakProps {
  plantBed: PlantBedWithPlants
  plants: PlantWithPosition[]
  containerWidth: number
  containerHeight: number
  mode: 'garden-overview' | 'detail-view'
  isInteractive?: boolean
  onFlowerClick?: (flowerId: string) => void
  onFlowerMove?: (flowerId: string, newPercentX: number, newPercentY: number) => void
}

interface FlowerData {
  id: string
  name: string
  color: string
  emoji: string
  x: number
  y: number
  size: number
}

export function UnifiedPlantvakSystem({ 
  plantBed, 
  plants, 
  containerWidth, 
  containerHeight, 
  mode,
  isInteractive = false,
  onFlowerClick,
  onFlowerMove 
}: UnifiedPlantvakProps) {
  const [draggedFlower, setDraggedFlower] = React.useState<string | null>(null)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  
  // Convert plants to properly scaled positions
  const flowers: FlowerData[] = plants.map(plant => {
    // Convert percentage positions (0-100) to actual pixels within container
    const x = (plant.position_x / 100) * containerWidth
    const y = (plant.position_y / 100) * containerHeight
    
    // Scale flower size based on mode and container size
    let flowerSize: number
    if (mode === 'garden-overview') {
      // Small flowers for overview, but not too tiny
      flowerSize = Math.max(16, Math.min(containerWidth, containerHeight) * 0.08)
    } else {
      // Larger flowers for detail view, scale with container
      flowerSize = Math.max(40, Math.min(containerWidth, containerHeight) * 0.12)
    }
    
    return {
      id: plant.id,
      name: plant.name,
      color: plant.color || '#FF69B4',
      emoji: plant.emoji || '🌸',
      x,
      y,
      size: flowerSize
    }
  })

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* Plantvak background */}
      <div className={`absolute inset-0 rounded-lg border-2 ${
        mode === 'garden-overview' 
          ? 'border-green-400 bg-green-50/30' 
          : 'border-green-600 bg-green-50/50'
      }`}>
        
        {/* Grid overlay for detail view */}
        {mode === 'detail-view' && (
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #10b98120 1px, transparent 1px),
                linear-gradient(to bottom, #10b98120 1px, transparent 1px)
              `,
              backgroundSize: `${containerWidth / 10}px ${containerHeight / 10}px`,
            }}
          />
        )}

        {/* Flowers positioned */}
        {flowers.map(({ id, name, color, emoji, x, y, size }) => {
          const isDragging = draggedFlower === id
          return (
            <div
              key={id}
              className={`absolute rounded-full flex items-center justify-center ${
                isInteractive 
                  ? 'cursor-pointer hover:scale-110 transition-transform' 
                  : ''
              } ${
                isDragging ? 'z-50 scale-110 shadow-2xl' : ''
              }`}
              style={{
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                backgroundColor: color + '40',
                border: `2px solid ${color}`,
              }}
              onClick={() => onFlowerClick?.(id)}
              onMouseDown={(e) => {
                if (!isInteractive || mode !== 'detail-view') return
                e.preventDefault()
                e.stopPropagation()
                
                const rect = e.currentTarget.getBoundingClientRect()
                setDragOffset({
                  x: e.clientX - rect.left - size / 2,
                  y: e.clientY - rect.top - size / 2
                })
                setDraggedFlower(id)
              }}
              onMouseMove={(e) => {
                if (!draggedFlower || draggedFlower !== id) return
                e.preventDefault()
                
                const containerRect = e.currentTarget.parentElement?.getBoundingClientRect()
                if (!containerRect) return
                
                const newX = e.clientX - containerRect.left - dragOffset.x
                const newY = e.clientY - containerRect.top - dragOffset.y
                
                // Convert to percentage
                const newPercentX = Math.max(0, Math.min(100, (newX / containerWidth) * 100))
                const newPercentY = Math.max(0, Math.min(100, (newY / containerHeight) * 100))
                
                onFlowerMove?.(id, newPercentX, newPercentY)
              }}
              onMouseUp={() => {
                setDraggedFlower(null)
                setDragOffset({ x: 0, y: 0 })
              }}
              title={`${name}`}
            >
              {/* Flower content */}
              <div className="text-center">
                <div style={{ fontSize: Math.max(8, size * 0.4) }}>
                  {emoji}
                </div>
                {mode === 'detail-view' && size > 30 && (
                  <div 
                    className="text-xs font-medium text-gray-800 mt-1"
                    style={{ fontSize: Math.max(6, size * 0.2) }}
                  >
                    {name}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Plantvak info */}
        <div className={`absolute ${
          mode === 'garden-overview' ? 'bottom-1 left-1' : 'top-2 left-2'
        } bg-white/90 px-2 py-1 rounded text-xs font-medium shadow-sm`}>
          <div className="text-green-800">{plantBed.name}</div>
          {mode === 'garden-overview' && (
            <div className="text-green-600">{plants.length} 🌸</div>
          )}
        </div>
      </div>
    </div>
  )
}

// New unified garden overview component
export function UnifiedGardenOverview({ 
  plantBeds, 
  containerWidth, 
  containerHeight,
  onPlantvakClick 
}: {
  plantBeds: PlantBedWithPlants[]
  containerWidth: number
  containerHeight: number
  onPlantvakClick?: (bedId: string) => void
}) {
  return (
    <div 
      className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-lg border border-green-200"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {plantBeds.map((bed, index) => {
        // Better sizing for plantvakken in garden overview
        const bedWidth = Math.max(200, containerWidth * 0.6) // Use 60% of container width
        const bedHeight = Math.max(150, containerHeight * 0.4) // Use 40% of container height
        
        // Better positioning - spread them out more logically
        const posX = bed.position_x || (50 + (index * 100))
        const posY = bed.position_y || (50 + (index * 80))
        
        return (
          <div
            key={bed.id}
            className="absolute cursor-pointer hover:shadow-lg transition-shadow hover:scale-105"
            style={{
              left: Math.min(posX, containerWidth - bedWidth - 20), // Keep within bounds
              top: Math.min(posY, containerHeight - bedHeight - 20),
            }}
            onClick={() => onPlantvakClick?.(bed.id)}
          >
            <UnifiedPlantvakSystem
              plantBed={bed}
              plants={bed.plants.filter(p => 
                p.position_x !== undefined && 
                p.position_y !== undefined &&
                p.visual_width !== undefined &&
                p.visual_height !== undefined
              ) as PlantWithPosition[]}
              containerWidth={bedWidth}
              containerHeight={bedHeight}
              mode="garden-overview"
            />
          </div>
        )
      })}
    </div>
  )
}

// New unified plantvak detail component
export function UnifiedPlantvakDetail({ 
  plantBed, 
  plants, 
  containerWidth, 
  containerHeight,
  onFlowerClick,
  onFlowerMove 
}: {
  plantBed: PlantBedWithPlants
  plants: PlantWithPosition[]
  containerWidth: number
  containerHeight: number
  onFlowerClick?: (flowerId: string) => void
  onFlowerMove?: (flowerId: string, newPercentX: number, newPercentY: number) => void
}) {
  return (
    <UnifiedPlantvakSystem
      plantBed={plantBed}
      plants={plants}
      containerWidth={containerWidth}
      containerHeight={containerHeight}
      mode="detail-view"
      isInteractive={true}
      onFlowerClick={onFlowerClick}
      onFlowerMove={onFlowerMove}
    />
  )
}
