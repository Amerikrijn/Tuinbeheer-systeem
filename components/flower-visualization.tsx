"use client"

import React from 'react'
import { Flower, FlowerInstance } from '@/components/flower'

interface Plant {
  id: string
  name: string
  color: string
  position_x?: number
  position_y?: number
}

interface PlantBed {
  id: string
  size: string
}

interface FlowerVisualizationProps {
  plantBed: PlantBed
  plants: Plant[]
  containerWidth: number
  containerHeight: number
}

export function FlowerVisualization({ 
  plantBed, 
  plants, 
  containerWidth, 
  containerHeight 
}: FlowerVisualizationProps) {
  if (!plants || plants.length === 0) {
    return null
  }

  const createFlowerInstance = (plant: Plant, index: number): FlowerInstance => {
    let x = 0
    let y = 0

    if (plant.position_x !== undefined && plant.position_y !== undefined) {
      // Use custom position
      x = plant.position_x
      y = plant.position_y
    } else {
      // Grid layout fallback
      const cols = Math.ceil(Math.sqrt(plants.length))
      const col = index % cols
      const row = Math.floor(index / cols)
      const cellWidth = containerWidth / cols
      const cellHeight = containerHeight / Math.ceil(plants.length / cols)
      
      x = col * cellWidth + cellWidth / 2
      y = row * cellHeight + cellHeight / 2
    }

    return {
      id: plant.id,
      name: plant.name,
      color: plant.color,
      emoji: '🌸',
      size: 20,
      x,
      y,
      opacity: 1,
      rotation: 0,
      isMainFlower: false
    }
  }

  const flowerInstances = plants.map((plant, index) => 
    createFlowerInstance(plant, index)
  )

  return (
    <div 
      className=""relative"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {flowerInstances.map((flower) => (
        <Flower key={flower.id} flower={flower} />
      ))}
    </div>
  )
}