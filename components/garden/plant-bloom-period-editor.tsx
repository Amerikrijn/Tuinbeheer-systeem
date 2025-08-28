"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlantWithPosition } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Edit3, Save, X, Flower2 } from 'lucide-react'

interface PlantBloomPeriodEditorProps {
  plant: PlantWithPosition
  onUpdate: () => void
}

const MONTH_OPTIONS = [
  { value: 'januari', label: 'Januari' },
  { value: 'februari', label: 'Februari' },
  { value: 'maart', label: 'Maart' },
  { value: 'april', label: 'April' },
  { value: 'mei', label: 'Mei' },
  { value: 'juni', label: 'Juni' },
  { value: 'juli', label: 'Juli' },
  { value: 'augustus', label: 'Augustus' },
  { value: 'september', label: 'September' },
  { value: 'oktober', label: 'Oktober' },
  { value: 'november', label: 'November' },
  { value: 'december', label: 'December' }
]

export function PlantBloomPeriodEditor({ plant, onUpdate }: PlantBloomPeriodEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Parse existing bloom period
  React.useEffect(() => {
    if (plant.bloom_period) {
      const parts = plant.bloom_period.split('-')
      if (parts.length === 2) {
        setStartMonth(parts[0].trim().toLowerCase())
        setEndMonth(parts[1].trim().toLowerCase())
      } else {
        setStartMonth(plant.bloom_period.trim().toLowerCase())
      }
    }
  }, [plant.bloom_period])

  const handleSave = async () => {
    if (!startMonth) {
      toast({
        title: "Fout",
        description: "Selecteer tenminste een startmaand",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      let bloomPeriod = startMonth
      if (endMonth && endMonth !== startMonth) {
        bloomPeriod = `${startMonth}-${endMonth}`
      }

      const { error } = await supabase
        .from('plants')
        .update({ bloom_period: bloomPeriod })
        .eq('id', plant.id)

      if (error) {
        throw error
      }

      toast({
        title: "Succes",
        description: `Bloeiperiode voor ${plant.name} bijgewerkt`,
      })

      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating bloom period:', error)
      toast({
        title: "Fout",
        description: "Kon bloeiperiode niet bijwerken",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original values
    if (plant.bloom_period) {
      const parts = plant.bloom_period.split('-')
      if (parts.length === 2) {
        setStartMonth(parts[0].trim().toLowerCase())
        setEndMonth(parts[1].trim().toLowerCase())
      } else {
        setStartMonth(plant.bloom_period.trim().toLowerCase())
        setEndMonth('')
      }
    } else {
      setStartMonth('')
      setEndMonth('')
    }
  }

  const getMonthName = (month: string) => {
    const monthOption = MONTH_OPTIONS.find(m => m.value === month)
    return monthOption ? monthOption.label : month
  }

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flower2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Bloeiperiode bewerken voor {plant.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Startmaand</label>
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kies maand" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Eindmaand (optioneel)</label>
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Geen eindmaand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Geen eindmaand</SelectItem>
                    {MONTH_OPTIONS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isLoading || !startMonth}
                className="flex-1"
              >
                {isLoading ? 'Opslaan...' : 'Opslaan'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Annuleren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {plant.bloom_period ? (
        <Badge variant="outline" className="text-xs">
          🌸 {plant.bloom_period}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs text-gray-500">
          Geen bloeiperiode
        </Badge>
      )}
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0"
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  )
}