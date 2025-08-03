"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Leaf, 
  Sun, 
  CloudSun, 
  Cloud, 
  Ruler, 
  Palette, 
  Users, 
  Calendar,
  Droplets,
  Scissors,
  FileText,
  Info
} from "lucide-react"

export interface BloemDetailData {
  // Required fields
  name: string
  color: string
  height: number | string
  
  // Optional fields - Plant Information
  scientific_name?: string
  latin_name?: string
  variety?: string
  plant_color?: string
  plant_height?: number | string
  plants_per_sqm?: number | string
  
  // Optional fields - Growing Conditions
  sun_preference?: 'full-sun' | 'partial-sun' | 'shade'
  
  // Optional fields - Timeline
  planting_date?: string
  expected_harvest_date?: string
  
  // Optional fields - Care & Status
  status?: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  notes?: string
  care_instructions?: string
  watering_frequency?: number | string
  fertilizer_schedule?: string
  
  // Internal fields
  emoji?: string
}

interface BloemDetailViewProps {
  data: BloemDetailData
  showAllSections?: boolean
}

export function BloemDetailView({ data, showAllSections = false }: BloemDetailViewProps) {
  const getSunIcon = (preference?: string) => {
    switch (preference) {
      case 'full-sun': return <Sun className="w-4 h-4 text-yellow-500" />
      case 'partial-sun': return <CloudSun className="w-4 h-4 text-orange-500" />
      case 'shade': return <Cloud className="w-4 h-4 text-gray-500" />
      default: return <CloudSun className="w-4 h-4 text-gray-400" />
    }
  }

  const getSunLabel = (preference?: string) => {
    switch (preference) {
      case 'full-sun': return 'Volle zon'
      case 'partial-sun': return 'Halfschaduw'
      case 'shade': return 'Schaduw'
      default: return 'Onbekend'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'gezond': return 'bg-green-100 text-green-800'
      case 'aandacht_nodig': return 'bg-yellow-100 text-yellow-800'
      case 'ziek': return 'bg-red-100 text-red-800'
      case 'dood': return 'bg-gray-100 text-gray-800'
      case 'geoogst': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'gezond': return 'Gezond'
      case 'aandacht_nodig': return 'Aandacht nodig'
      case 'ziek': return 'Ziek'
      case 'dood': return 'Dood'
      case 'geoogst': return 'Geoogst'
      default: return 'Onbekend'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Check which sections have data
  const hasPlantInfo = data.scientific_name || data.latin_name || data.variety || data.plant_color || data.plant_height || data.plants_per_sqm
  const hasGrowingConditions = data.sun_preference
  const hasTimeline = data.planting_date || data.expected_harvest_date
  const hasCareStatus = (data.status && data.status !== 'gezond') || data.notes || data.care_instructions || data.watering_frequency || data.fertilizer_schedule

  return (
    <div className="space-y-6">
      {/* Basic Information - Always Visible */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Leaf className="w-5 h-5" />
            Basis Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {data.emoji && <span className="text-2xl">{data.emoji}</span>}
                <div>
                  <label className="text-sm font-medium text-green-700">Bloemnaam</label>
                  <p className="text-lg font-semibold text-green-900">{data.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-500" />
              <div>
                <label className="text-sm font-medium text-green-700">Kleur</label>
                <p className="font-medium text-green-900">{data.color}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-blue-500" />
              <div>
                <label className="text-sm font-medium text-green-700">Hoogte</label>
                <p className="font-medium text-green-900">{data.height} cm</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plant Information - Only show if has data or showAllSections */}
      {(hasPlantInfo || showAllSections) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="w-5 h-5" />
              Plant Informatie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.scientific_name || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Wetenschappelijke naam</label>
                  <p className="text-gray-900">{data.scientific_name || 'Niet ingevuld'}</p>
                </div>
              )}

              {(data.latin_name || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Latijnse naam</label>
                  <p className="text-gray-900 italic">{data.latin_name || 'Niet ingevuld'}</p>
                </div>
              )}

              {(data.variety || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Variëteit</label>
                  <p className="text-gray-900">{data.variety || 'Niet ingevuld'}</p>
                </div>
              )}

              {(data.plant_color || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Plant kleur</label>
                  <p className="text-gray-900">{data.plant_color || 'Niet ingevuld'}</p>
                </div>
              )}

              {(data.plant_height || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Plant hoogte</label>
                  <p className="text-gray-900">{data.plant_height ? `${data.plant_height} cm` : 'Niet ingevuld'}</p>
                </div>
              )}

              {(data.plants_per_sqm || showAllSections) && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Planten per m²</label>
                    <p className="text-gray-900">{data.plants_per_sqm ? `${data.plants_per_sqm} stuks` : 'Niet ingevuld'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growing Conditions - Only show if has data or showAllSections */}
      {(hasGrowingConditions || showAllSections) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Sun className="w-5 h-5" />
              Groeiomstandigheden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getSunIcon(data.sun_preference)}
              <div>
                <label className="text-sm font-medium text-gray-700">Zonvoorkeur</label>
                <p className="font-medium text-gray-900">{getSunLabel(data.sun_preference)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline - Only show if has data or showAllSections */}
      {(hasTimeline || showAllSections) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Calendar className="w-5 h-5" />
              Tijdlijn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.planting_date || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Plantdatum</label>
                  <p className="text-gray-900">{formatDate(data.planting_date) || 'Niet ingevuld'}</p>
                </div>
              )}

              {(data.expected_harvest_date || showAllSections) && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Verwachte oogstdatum</label>
                  <p className="text-gray-900">{formatDate(data.expected_harvest_date) || 'Niet ingevuld'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Care & Status - Only show if has data or showAllSections */}
      {(hasCareStatus || showAllSections) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Droplets className="w-5 h-5" />
              Verzorging & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.status || showAllSections) && (
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(data.status)}>
                    {getStatusLabel(data.status)}
                  </Badge>
                </div>
              </div>
            )}

            {(data.care_instructions || showAllSections) && (
              <div>
                <label className="text-sm font-medium text-gray-700">Verzorgingsinstructies</label>
                <p className="text-gray-900 mt-1">{data.care_instructions || 'Geen specifieke instructies'}</p>
              </div>
            )}

            {(data.notes || showAllSections) && (
              <div>
                <label className="text-sm font-medium text-gray-700">Opmerkingen</label>
                <p className="text-gray-900 mt-1">{data.notes || 'Geen opmerkingen'}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.watering_frequency || showAllSections) && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Water frequentie</label>
                    <p className="text-gray-900">{data.watering_frequency ? `Elke ${data.watering_frequency} dagen` : 'Niet ingevuld'}</p>
                  </div>
                </div>
              )}

              {(data.fertilizer_schedule || showAllSections) && (
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-green-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bemestingsschema</label>
                    <p className="text-gray-900">{data.fertilizer_schedule || 'Niet ingevuld'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}