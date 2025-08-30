"use client"

import React from 'react'

export interface FlowerInstance {
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
}

interface FlowerProps {
  flower: FlowerInstance
}

export function Flower({ flower }: FlowerProps) {
  return (
    <div
      data-testid="flower-instance"
      className="absolute transition-all duration-500 ease-in-out"
      style={{
        left: flower.x - flower.size / 2,
        top: flower.y - flower.size / 2,
        width: flower.size,
        height: flower.size,
        opacity: flower.opacity,
        transform: `rotate(${flower.rotation}deg)`,
        zIndex: flower.isMainFlower ? 10 : 8,
      }}
    >
      <div
        className="w-full h-full border-2 border-gray-400 dark:border-gray-600 rounded-lg bg-background/95 shadow-md flex flex-col items-center justify-center"
        style={{
          borderColor: `${flower.color}80`,
          backgroundColor: `${flower.color}25`,
        }}
      >
        <span
          className="select-none"
          style={{
            fontSize: Math.max(12, flower.size * 0.4),
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }}
        >
          {flower.emoji}
        </span>

        {flower.size > 30 && (
          <div
            className="text-xs font-medium text-gray-800 mt-1 text-center select-none"
            style={{
              fontSize: Math.max(6, flower.size * 0.2),
              maxWidth: flower.size * 0.9,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: '1.1',
            }}
          >
            {flower.name}
          </div>
        )}
      </div>

      {flower.isMainFlower && (
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm -z-10"
          style={{
            backgroundColor: flower.color,
            transform: 'scale(1.5)',
          }}
        />
      )}
    </div>
  )
}

