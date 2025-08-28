"use client"

import React, { useState, useMemo } from 'react'
import { PlantBedWithPlants, PlantWithPosition } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { 
  Flower2, 
  Calendar, 
  Droplets,
  Info,
  ChevronDown,
  ChevronUp,
  Sun,
  CloudSun,
  Cloud
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PlantBedSummaryProps {
  plantBed: PlantBedWithPlants
  selectedMonth?: number // 1-12
  filterMode?: 'sowing' | 'blooming' | 'all'
  isHighlighted?: boolean
}

// Helper to parse bloom period strings like "Juni-September" or "Maart-Mei"
const parseMonthRange = (period?: string): number[] => {
  if (!period) return []
  
  const monthNames: { [key: string]: number } = {
    'januari': 1, 'februari': 2, 'maart': 3, 'april': 4,
    'mei': 5, 'juni': 6, 'juli': 7, 'augustus': 8,
    'september': 9, 'oktober': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mrt': 3, 'apr': 4, 'mei': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'dec': 12
  }
  
  const parts = period.toLowerCase().split('-')
  if (parts.length !== 2) return []
  
  const startMonth = monthNames[parts[0].trim()]
  const endMonth = monthNames[parts[1].trim()]
  
  if (!startMonth || !endMonth) return []
  
  const months: number[] = []
  let current = startMonth
  while (current !== endMonth) {
    months.push(current)
    current = current === 12 ? 1 : current + 1
    if (months.length > 12) break // Safety check
  }
  months.push(endMonth)
  
  return months
}

// Helper to get sowing month (typically 2-3 months before blooming)
const getSowingMonths = (bloomPeriod?: string): number[] => {
  const bloomMonths = parseMonthRange(bloomPeriod)
  if (bloomMonths.length === 0) return []
  
  const firstBloomMonth = bloomMonths[0]
  const sowingMonths: number[] = []
  
  // Calculate 2-3 months before first bloom
  for (let i = 2; i <= 3; i++) {
    let sowMonth = firstBloomMonth - i
    if (sowMonth <= 0) sowMonth += 12
    sowingMonths.push(sowMonth)
  }
  
  return sowingMonths
}

const getSunExposureIcon = (exposure?: string) => {
  switch (exposure) {
    case 'full-sun': return <Sun className="h-3 w-3 text-yellow-500" />
    case 'partial-sun': return <CloudSun className="h-3 w-3 text-orange-500" />
    case 'shade': return <Cloud className="h-3 w-3 text-gray-500" />
    default: return null
  }
}

const getMonthName = (month: number): string => {
  const names = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  return names[month - 1] || ''
}

export function PlantBedSummary({ 
  plantBed, 
  selectedMonth, 
  filterMode = 'all',
  isHighlighted = false 
}: PlantBedSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Group plants by unique name and aggregate info
  const plantGroups = useMemo(() => {
    const groups: Map<string, {
      name: string
      colors: Set<string>
      count: number
      emoji?: string
      bloomPeriod?: string
      sowingMonths: number[]
      bloomMonths: number[]
    }> = new Map()
    
    plantBed.plants.forEach(plant => {
      const key = plant.name
      if (!groups.has(key)) {
        groups.set(key, {
          name: plant.name,
          colors: new Set(),
          count: 0,
          emoji: plant.emoji,
          bloomPeriod: plant.bloom_period,
          sowingMonths: getSowingMonths(plant.bloom_period),
          bloomMonths: parseMonthRange(plant.bloom_period)
        })
      }
      
      const group = groups.get(key)!
      group.count++
      if (plant.color) group.colors.add(plant.color)
    })
    
    return Array.from(groups.values())
  }, [plantBed.plants])
  
  // Filter plants based on selected month and mode
  const filteredPlants = useMemo(() => {
    if (!selectedMonth || filterMode === 'all') return plantGroups
    
    return plantGroups.filter(group => {
      if (filterMode === 'sowing') {
        return group.sowingMonths.includes(selectedMonth)
      } else if (filterMode === 'blooming') {
        return group.bloomMonths.includes(selectedMonth)
      }
      return false // Changed from true to false - only show plants that match the filter
    })
  }, [plantGroups, selectedMonth, filterMode])
  
  // Check if this plant bed has relevant plants for the selected month
  const hasRelevantPlants = filteredPlants.length > 0
  
  if (plantBed.plants.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Flower2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs">Nog geen planten</p>
      </div>
    )
  }
  
  // Show message when no plants match the filter
  if (selectedMonth && filterMode !== 'all' && !hasRelevantPlants) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <div className="text-orange-600 mb-2">
          {filterMode === 'sowing' ? '🌱' : '🌸'}
        </div>
        <p className="text-xs">Geen planten voor {filterMode === 'sowing' ? 'zaaien' : 'bloei'}</p>
        <p className="text-xs">in deze maand</p>
      </div>
    )
  }
  
  return (
    <TooltipProvider>
      <div className={`space-y-2 ${isHighlighted ? 'ring-2 ring-green-400 rounded-lg p-2' : ''}`}>
        {/* Header with basic info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{plantBed.name}</span>
            {getSunExposureIcon(plantBed.sun_exposure)}
            <Badge variant="secondary" className="text-xs">
              {plantBed.plants.length} planten
            </Badge>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Compact view - show first 3 plants */}
        {!isExpanded && (
          <div className="space-y-1">
            {filteredPlants.slice(0, 3).map((group, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="text-lg">{group.emoji || '🌸'}</span>
                <span className="font-medium truncate flex-1">{group.name}</span>
                <div className="flex gap-1">
                  {Array.from(group.colors).slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                {group.count > 1 && (
                  <Badge variant="outline" className="text-xs px-1">
                    {group.count}x
                  </Badge>
                )}
              </div>
            ))}
            {filteredPlants.length > 3 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{filteredPlants.length - 3} meer...
              </p>
            )}
          </div>
        )}
        
        {/* Expanded view - show all plants with details */}
        {isExpanded && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {filteredPlants.map((group, idx) => (
              <div key={idx} className="border rounded-lg p-2 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{group.emoji || '🌸'}</span>
                    <div>
                      <p className="font-medium text-sm">{group.name}</p>
                      <div className="flex gap-1 mt-1">
                        {Array.from(group.colors).map((color, i) => (
                          <Tooltip key={i}>
                            <TooltipTrigger>
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{color}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                  {group.count > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {group.count}x
                    </Badge>
                  )}
                </div>
                
                {/* Timing info */}
                <div className="mt-2 space-y-1">
                  {group.sowingMonths.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      <span>Zaaien: {group.sowingMonths.map(getMonthName).join(', ')}</span>
                    </div>
                  )}
                  {group.bloomPeriod && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Bloeit: {group.bloomPeriod}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Month indicator when filtered */}
        {selectedMonth && hasRelevantPlants && (
          <div className="pt-1 border-t">
            <Badge 
              variant={filterMode === 'sowing' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {filterMode === 'sowing' ? '🌱 Zaaien' : '🌸 Bloeit'} in {getMonthName(selectedMonth)}
            </Badge>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}