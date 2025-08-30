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

// Helper to get sowing months - check actual planting_date first, then fallback to calculated
const getSowingMonths = (plant: PlantWithPosition): number[] => {
  // First check if plant has actual planting_date
  if (plant.planting_date) {
    const plantingDate = new Date(plant.planting_date)
    const plantingMonth = plantingDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
    return [plantingMonth]
  }
  
  // Fallback: calculate from bloom period (typically 2-3 months before blooming)
  const bloomMonths = parseMonthRange(plant.bloom_period)
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
    case 'shade': return <Cloud className="h-3 w-3 text-gray-500 dark:text-gray-400" />
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
      plants: PlantWithPosition[] // Store individual plants for detailed filtering
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
          sowingMonths: getSowingMonths(plant),
          bloomMonths: parseMonthRange(plant.bloom_period),
          plants: []
        })
      }
      
      const group = groups.get(key)!
      group.count++
      group.plants.push(plant)
      if (plant.color) group.colors.add(plant.color)
      
      // Update sowing months if this plant has a different planting_date
      const plantSowingMonths = getSowingMonths(plant)
      plantSowingMonths.forEach(month => {
        if (!group.sowingMonths.includes(month)) {
          group.sowingMonths.push(month)
        }
      })
    })
    
    return Array.from(groups.values())
  }, [plantBed.plants])
  
  // Helper to check if a plant matches the filter (same logic as main page)
  const plantMatchesFilter = (plant: PlantWithPosition): boolean => {
    if (!selectedMonth || filterMode === 'all') return true
    
    if (filterMode === 'blooming') {
      // Check if plant blooms in selected month based on bloom_period
      const bloomMonths = parseMonthRange(plant.bloom_period)
      return bloomMonths.includes(selectedMonth)
    } else if (filterMode === 'sowing') {
      // Check if plant has planting_date in selected month
      if (plant.planting_date) {
        const plantingDate = new Date(plant.planting_date)
        const plantingMonth = plantingDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
        return plantingMonth === selectedMonth
      }
      
      // Fallback: if no planting_date, calculate sowing months from bloom_period
      const bloomMonths = parseMonthRange(plant.bloom_period)
      if (bloomMonths.length === 0) return false
      
      const firstBloomMonth = bloomMonths[0]
      for (let i = 2; i <= 3; i++) {
        let sowMonth = firstBloomMonth - i
        if (sowMonth <= 0) sowMonth += 12
        if (sowMonth === selectedMonth) return true
      }
    }
    return false
  }

  // Filter plants based on selected month and mode
  const filteredPlants = useMemo(() => {
    if (!selectedMonth || filterMode === 'all') return plantGroups
    
    return plantGroups.filter(group => {
      // Check if any plant in this group matches the filter
      return group.plants.some(plant => plantMatchesFilter(plant))
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
  
  // Show message when no plants match the filter but bed has plants
  if (selectedMonth && filterMode !== 'all' && !hasRelevantPlants && plantBed.plants.length > 0) {
    return (
      <div className="space-y-2">
        {/* Header with basic info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{plantBed.name}</span>
            {getSunExposureIcon(plantBed.sun_exposure)}
            <Badge variant="secondary" className="text-xs">
              {plantBed.plants.length} planten
            </Badge>
            <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800">
              {filterMode === 'sowing' ? '🌱 Geen zaaitijd' : '🌸 Bloeit niet'}
            </Badge>
          </div>
        </div>
        <div className="text-center py-2 text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded">
          <div className="text-gray-400 dark:text-gray-500 mb-1">
            {filterMode === 'sowing' ? '🌱' : '🌸'}
          </div>
          <p className="text-xs">Niet actief in deze maand</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            {plantBed.plants.length} plant{plantBed.plants.length !== 1 ? 'en' : ''} in dit plantvak
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <TooltipProvider>
      <div className={{`space-y-2 ${isHighlighted ? 'ring-2 ring-green-400 rounded-lg p-2' : ''}`}>
        {/* Header with basic info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">{plantBed.name}</span>
            {getSunExposureIcon(plantBed.sun_exposure)}
            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-800 border-green-300 dark:border-green-700">
              {plantBed.plants.length} planten
            </Badge>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-900/30 rounded transition-colors duration-150"
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
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500"
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
                                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500"
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