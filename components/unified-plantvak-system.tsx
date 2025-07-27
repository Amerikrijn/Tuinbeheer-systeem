"use client"

import React from 'react'
import type { PlantBedWithPlants, PlantWithPosition } from "@/lib/supabase"

// UNIFIED COORDINATE SYSTEM
// All flower positions are stored as percentages (0-100) within plantvak bounds
// This ensures perfect consistency between garden overview and detail views

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

interface FlowerPosition {
  id: string
  name: string
  color: string
  emoji?: string
  percentX: number  // 0-100% within plantvak bounds
  percentY: number  // 0-100% within plantvak bounds
  size: number
}

// Convert database position to percentage within plantvak
function dbPositionToPercent(dbX: number, dbY: number, plantvakWidth: number, plantvakHeight: number): { percentX: number, percentY: number } {
  return {
    percentX: Math.max(0, Math.min(100, (dbX / plantvakWidth) * 100)),
    percentY: Math.max(0, Math.min(100, (dbY / plantvakHeight) * 100))
  }
}

// Convert percentage to actual pixel position within container
function percentToPixels(percentX: number, percentY: number, containerWidth: number, containerHeight: number): { x: number, y: number } {
  return {
    x: (percentX / 100) * containerWidth,
    y: (percentY / 100) * containerHeight
  }
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
  
  // Convert all plants to unified percentage-based positions
  const flowerPositions: FlowerPosition[] = plants.map(plant => {
    // For now, assume plantvak dimensions - this should come from plantBed.size parsing
    const plantvakWidthPixels = 400  // This should be calculated from plantBed.size
    const plantvakHeightPixels = 300
    
    const { percentX, percentY } = dbPositionToPercent(
      plant.position_x, 
      plant.position_y, 
      plantvakWidthPixels, 
      plantvakHeightPixels
    )

    return {
      id: plant.id,
      name: plant.name,
      color: plant.color || '#FF69B4',
      emoji: plant.emoji || '🌸',
      percentX,
      percentY,
      size: mode === 'garden-overview' ? 
        Math.max(8, Math.min(containerWidth, containerHeight) * 0.15) : 
        plant.visual_width || 40
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

        {/* Flowers positioned by percentage */}
        {flowerPositions.map(flower => {
          const { x, y } = percentToPixels(flower.percentX, flower.percentY, containerWidth, containerHeight)
          const isDragging = draggedFlower === flower.id
          
          return (
            <div
              key={flower.id}
              className={`absolute rounded-lg flex items-center justify-center ${
                isInteractive 
                  ? 'cursor-pointer hover:scale-110 transition-transform' 
                  : ''
              } ${
                isDragging ? 'z-50 scale-110 shadow-2xl' : ''
              }`}
              style={{
                left: x - flower.size / 2,
                top: y - flower.size / 2,
                width: flower.size,
                height: flower.size,
                backgroundColor: flower.color + '40',
                border: `2px solid ${flower.color}`,
              }}
              onClick={() => onFlowerClick?.(flower.id)}
              onMouseDown={(e) => {
                if (!isInteractive || mode !== 'detail-view') return
                e.preventDefault()
                e.stopPropagation()
                
                const rect = e.currentTarget.getBoundingClientRect()
                setDragOffset({
                  x: e.clientX - rect.left - flower.size / 2,
                  y: e.clientY - rect.top - flower.size / 2
                })
                setDraggedFlower(flower.id)
              }}
              onMouseMove={(e) => {
                if (!draggedFlower || draggedFlower !== flower.id) return
                e.preventDefault()
                
                const containerRect = e.currentTarget.parentElement?.getBoundingClientRect()
                if (!containerRect) return
                
                const newX = e.clientX - containerRect.left - dragOffset.x
                const newY = e.clientY - containerRect.top - dragOffset.y
                
                // Convert to percentage
                const newPercentX = Math.max(0, Math.min(100, (newX / containerWidth) * 100))
                const newPercentY = Math.max(0, Math.min(100, (newY / containerHeight) * 100))
                
                onFlowerMove?.(flower.id, newPercentX, newPercentY)
              }}
              onMouseUp={() => {
                setDraggedFlower(null)
                setDragOffset({ x: 0, y: 0 })
              }}
              title={`${flower.name} (${flower.percentX.toFixed(1)}%, ${flower.percentY.toFixed(1)}%)`}
            >
              {/* Flower content */}
              <div className="text-center">
                <div style={{ fontSize: Math.max(8, flower.size * 0.4) }}>
                  {flower.emoji}
                </div>
                {mode === 'detail-view' && flower.size > 30 && (
                  <div 
                    className="text-xs font-medium text-gray-800 mt-1"
                    style={{ fontSize: Math.max(6, flower.size * 0.2) }}
                  >
                    {flower.name}
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
      className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-lg"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {plantBeds.map(bed => {
        // Calculate bed dimensions (this should use proper scaling from bed.size)
        const bedWidth = bed.visual_width || 160
        const bedHeight = bed.visual_height || 120
        
        return (
          <div
            key={bed.id}
            className="absolute cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              left: bed.position_x || 100,
              top: bed.position_y || 100,
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
