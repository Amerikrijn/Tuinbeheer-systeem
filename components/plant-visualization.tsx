"use client"

import React from 'react'
import { Flower2 } from 'lucide-react'

interface Plant {
  id: string
  name: string
  variety?: string | null
  position_x: number
  position_y: number
  size: number
  color: string
  planted_at?: string | null
  expected_harvest?: string | null
  notes?: string | null
}

interface PlantVisualizationProps {
  plants: Plant[]
  bedWidth: number
  bedHeight: number
  onPlantClick?: (plant: Plant) => void
  isInteractive?: boolean
}

export function PlantVisualization({
  plants,
  bedWidth,
  bedHeight,
  onPlantClick,
  isInteractive = false
}: PlantVisualizationProps) {
  // Calculate scale to fit the visualization in the container
  const containerWidth = 800 // Max width in pixels
  const containerHeight = 600 // Max height in pixels
  
  const scaleX = containerWidth / bedWidth
  const scaleY = containerHeight / bedHeight
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down if needed
  
  const visualWidth = bedWidth * scale
  const visualHeight = bedHeight * scale

  return (
    <div className="relative w-full overflow-auto">
      <div 
        className="relative mx-auto border-4 border-green-700 bg-amber-50 dark:bg-amber-900/20"
        style={{
          width: `${visualWidth}px`,
          height: `${visualHeight}px`,
          minHeight: '300px'
        }}
      >
        {/* Grid lines for reference */}
        <svg 
          className="absolute inset-0 pointer-events-none opacity-20"
          width={visualWidth}
          height={visualHeight}
        >
          {/* Vertical lines every 50cm */}
          {Array.from({ length: Math.floor(bedWidth / 50) + 1 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 50 * scale}
              y1={0}
              x2={i * 50 * scale}
              y2={visualHeight}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-400"
            />
          ))}
          {/* Horizontal lines every 50cm */}
          {Array.from({ length: Math.floor(bedHeight / 50) + 1 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * 50 * scale}
              x2={visualWidth}
              y2={i * 50 * scale}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-400"
            />
          ))}
        </svg>

        {/* Plants */}
        {plants.map((plant) => {
          const x = plant.position_x * scale
          const y = plant.position_y * scale
          const size = Math.max(plant.size * scale, 20) // Minimum visual size
          
          return (
            <div
              key={plant.id}
              className={`absolute flex items-center justify-center transition-all ${
                isInteractive 
                  ? 'cursor-pointer hover:scale-110 hover:z-10' 
                  : ''
              }`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: plant.color,
                borderRadius: '50%',
                border: '2px solid rgba(0, 0, 0, 0.2)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => isInteractive && onPlantClick?.(plant)}
              title={`${plant.name}${plant.variety ? ` - ${plant.variety}` : ''}`}
            >
              <Flower2 
                className="text-white opacity-60" 
                style={{ 
                  width: `${size * 0.6}px`, 
                  height: `${size * 0.6}px` 
                }}
              />
            </div>
          )
        })}

        {/* Scale indicator */}
        <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded text-xs">
          {bedWidth} × {bedHeight} cm
        </div>
      </div>

      {/* Plant legend if there are plants */}
      {plants.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Planten in dit vak:</h4>
          <div className="flex flex-wrap gap-2">
            {plants.map((plant) => (
              <div 
                key={plant.id}
                className="flex items-center gap-2 text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded"
              >
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: plant.color }}
                />
                <span>{plant.name}</span>
                {plant.variety && (
                  <span className="text-muted-foreground">({plant.variety})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}