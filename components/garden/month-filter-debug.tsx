"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlantBedWithPlants, PlantWithPosition } from '@/lib/supabase'

interface MonthFilterDebugProps {
  plantBeds: PlantBedWithPlants[]
  selectedMonth?: number
  filterMode: 'all' | 'sowing' | 'blooming'
}

// Helper to parse month ranges (same as in PlantBedSummary)
const parseMonthRange = (period?: string): number[] => {
  if (!period || typeof period !== 'string') return []
  
  const cleanPeriod = period.trim().toLowerCase()
  if (cleanPeriod === '') return []
  
  const monthNames: { [key: string]: number } = {
    'januari': 1, 'februari': 2, 'maart': 3, 'april': 4,
    'mei': 5, 'juni': 6, 'juli': 7, 'augustus': 8,
    'september': 9, 'oktober': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mrt': 3, 'apr': 4, 'mei': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'dec': 12
  }
  
  const parts = cleanPeriod.split(/[-–—]/)
  if (parts.length !== 2) {
    const singleMonth = monthNames[cleanPeriod]
    if (singleMonth) return [singleMonth]
    return []
  }
  
  const startMonth = monthNames[parts[0].trim()]
  const endMonth = monthNames[parts[1].trim()]
  
  if (!startMonth || !endMonth) return []
  
  const months: number[] = []
  let current = startMonth
  while (current !== endMonth) {
    months.push(current)
    current = current === 12 ? 1 : current + 1
    if (months.length > 12) break
  }
  months.push(endMonth)
  return months
}

// Helper to get sowing months
const getSowingMonths = (bloomPeriod?: string): number[] => {
  const bloomMonths = parseMonthRange(bloomPeriod)
  if (bloomMonths.length === 0) return []
  
  const firstBloomMonth = bloomMonths[0]
  const sowingMonths: number[] = []
  
  for (let i = 2; i <= 3; i++) {
    let sowMonth = firstBloomMonth - i
    if (sowMonth <= 0) sowMonth += 12
    sowingMonths.push(sowMonth)
  }
  
  return sowingMonths
}

const getMonthName = (month: number): string => {
  const names = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  return names[month - 1] || ''
}

export function MonthFilterDebug({ plantBeds, selectedMonth, filterMode }: MonthFilterDebugProps) {
  // Analyze all plants and their bloom periods
  const plantAnalysis = plantBeds.flatMap(bed => 
    bed.plants.map(plant => ({
      bedName: bed.name,
      plantName: plant.name,
      bloomPeriod: plant.bloom_period,
      bloomMonths: parseMonthRange(plant.bloom_period),
      sowingMonths: getSowingMonths(plant.bloom_period),
      hasValidBloomPeriod: !!plant.bloom_period && parseMonthRange(plant.bloom_period).length > 0
    }))
  )

  const plantsWithBloomPeriod = plantAnalysis.filter(p => p.hasValidBloomPeriod)
  const plantsWithoutBloomPeriod = plantAnalysis.filter(p => !p.hasValidBloomPeriod)
  
  // Count plants that would match the current filter
  const matchingPlants = selectedMonth && filterMode !== 'all' 
    ? plantAnalysis.filter(p => {
        if (filterMode === 'blooming') {
          return p.bloomMonths.includes(selectedMonth)
        } else if (filterMode === 'sowing') {
          return p.sowingMonths.includes(selectedMonth)
        }
        return false
      })
    : []

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
          🐛 Maand Filter Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{plantAnalysis.length}</div>
            <div className="text-sm text-gray-600">Totaal planten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{plantsWithBloomPeriod.length}</div>
            <div className="text-sm text-gray-600">Met bloeiperiode</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{plantsWithoutBloomPeriod.length}</div>
            <div className="text-sm text-gray-600">Zonder bloeiperiode</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{matchingPlants.length}</div>
            <div className="text-sm text-gray-600">Matcht filter</div>
          </div>
        </div>

        {/* Current filter info */}
        {selectedMonth && (
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-medium mb-2">Huidige filter:</h4>
            <div className="flex gap-2">
              <Badge variant="outline">Maand: {getMonthName(selectedMonth)}</Badge>
              <Badge variant="outline">Mode: {filterMode}</Badge>
              <Badge variant="outline">Matcht: {matchingPlants.length} planten</Badge>
            </div>
          </div>
        )}

        {/* Plants without bloom period */}
        {plantsWithoutBloomPeriod.length > 0 && (
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-medium mb-2 text-red-700">
              ⚠️ Planten zonder bloeiperiode ({plantsWithoutBloomPeriod.length}):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {plantsWithoutBloomPeriod.slice(0, 10).map((plant, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{plant.plantName}</span>
                  <span className="text-gray-500">in {plant.bedName}</span>
                </div>
              ))}
              {plantsWithoutBloomPeriod.length > 10 && (
                <div className="text-gray-500 text-sm">
                  ... en {plantsWithoutBloomPeriod.length - 10} meer
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample plants with bloom period */}
        {plantsWithBloomPeriod.length > 0 && (
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-medium mb-2 text-green-700">
              ✅ Voorbeeld planten met bloeiperiode:
            </h4>
            <div className="space-y-2 text-sm">
              {plantsWithBloomPeriod.slice(0, 5).map((plant, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-medium">{plant.plantName}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      🌸 {plant.bloomPeriod}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      🌱 {plant.sowingMonths.map(getMonthName).join(', ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium mb-2 text-blue-800">💡 Aanbevelingen:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {plantsWithoutBloomPeriod.length > 0 && (
              <li>• Voeg bloeiperiode toe aan {plantsWithoutBloomPeriod.length} planten</li>
            )}
            {plantsWithBloomPeriod.length === 0 && (
              <li>• Geen planten hebben bloeiperiode - voeg deze toe om filtering te laten werken</li>
            )}
            {plantsWithBloomPeriod.length > 0 && (
              <li>• Maand filtering werkt voor {plantsWithBloomPeriod.length} planten</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}