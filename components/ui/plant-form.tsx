"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

// Standard flower types with emojis
const STANDARD_FLOWERS = [
  { name: 'Roos', emoji: '🌹', color: '#FF69B4' },
  { name: 'Tulp', emoji: '🌷', color: '#FF4500' },
  { name: 'Zonnebloem', emoji: '🌻', color: '#FFD700' },
  { name: 'Lavendel', emoji: '🪻', color: '#9370DB' },
  { name: 'Dahlia', emoji: '🌺', color: '#FF1493' },
  { name: 'Chrysant', emoji: '🌼', color: '#FFA500' },
  { name: 'Narcis', emoji: '🌻', color: '#FFFF00' },
  { name: 'Iris', emoji: '🌸', color: '#4B0082' },
  { name: 'Petunia', emoji: '🌺', color: '#FF6B6B' },
  { name: 'Begonia', emoji: '🌸', color: '#FF8C69' },
  { name: 'Lelie', emoji: '🌺', color: '#FF69B4' },
  { name: 'Anjer', emoji: '🌸', color: '#FF1493' },
]

const DEFAULT_FLOWER_EMOJI = '🌼'

export interface PlantFormData {
  name: string
  color: string
  height: string
  // Optional advanced fields
  scientificName: string
  latinName: string
  variety: string
  plantColor: string
  plantHeight: string
  plantsPerSqm: string
  sunPreference: 'full-sun' | 'partial-sun' | 'shade'
  plantingDate: string
  expectedHarvestDate: string
  status: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  notes: string
  careInstructions: string
  wateringFrequency: string
  fertilizerSchedule: string
  emoji: string
  isStandardFlower: boolean
}

export interface PlantFormErrors {
  name?: string
  color?: string
  height?: string
  [key: string]: string | undefined
}

interface PlantFormProps {
  data: PlantFormData
  errors: PlantFormErrors
  onChange: (data: PlantFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onReset?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  showAdvanced?: boolean
}

export function PlantForm({
  data,
  errors,
  onChange,
  onSubmit,
  onReset,
  submitLabel = "Plant toevoegen",
  isSubmitting = false,
  showAdvanced = true
}: PlantFormProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

  const handleFieldChange = (field: keyof PlantFormData, value: string | boolean) => {
    onChange({ ...data, [field]: value })
  }

  const handleNameChange = (value: string) => {
    // Check if it matches a standard flower
    const selectedFlower = STANDARD_FLOWERS.find(f => 
      f.name.toLowerCase() === value.toLowerCase()
    )
    
    if (selectedFlower) {
      onChange({
        ...data,
        name: value,
        emoji: selectedFlower.emoji,
        color: data.color || selectedFlower.color,
        isStandardFlower: true,
      })
    } else {
      onChange({
        ...data,
        name: value,
        emoji: data.emoji === DEFAULT_FLOWER_EMOJI ? DEFAULT_FLOWER_EMOJI : data.emoji,
        isStandardFlower: false,
      })
    }
  }

  return (
    <form onSubmit={onSubmit} onReset={onReset} className="space-y-6">
      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Basis Informatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plant Name with suggestions */}
          <div className="space-y-2">
            <Label htmlFor="name">Bloemnaam *</Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Typ een nieuwe bloem of kies uit de lijst..."
                value={data.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`${errors.name ? "border-destructive" : ""} pr-8`}
                required
                autoComplete="off"
              />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              
              {/* Suggestions dropdown */}
              {data.name && data.name.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {STANDARD_FLOWERS
                    .filter(flower => 
                      flower.name.toLowerCase().includes(data.name.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((flower) => (
                      <div
                        key={flower.name}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                          onChange({
                            ...data,
                            name: flower.name,
                            emoji: flower.emoji,
                            color: data.color || flower.color,
                            isStandardFlower: true,
                          })
                        }}
                      >
                        <span>{flower.emoji}</span>
                        <span>{flower.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {errors.name && (
              <div className="flex items-center gap-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Kleur *</Label>
            <Input
              id="color"
              placeholder="Bijv. Rood, Geel, Wit"
              value={data.color}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              className={errors.color ? "border-destructive" : ""}
              required
              autoComplete="off"
            />
            {errors.color && (
              <div className="flex items-center gap-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.color}
              </div>
            )}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">Hoogte (cm) *</Label>
            <Input
              id="height"
              type="number"
              placeholder="Bijv. 150"
              value={data.height}
              onChange={(e) => handleFieldChange('height', e.target.value)}
              className={errors.height ? "border-destructive" : ""}
              required
              autoComplete="off"
            />
            {errors.height && (
              <div className="flex items-center gap-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.height}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Fields (Collapsible) */}
      {showAdvanced && (
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              <span>Geavanceerde opties</span>
              {isAdvancedOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Aanvullende Informatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scientificName">Wetenschappelijke naam</Label>
                    <Input
                      id="scientificName"
                      placeholder="Bijv. Rosa rubiginosa"
                      value={data.scientificName}
                      onChange={(e) => handleFieldChange('scientificName', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latinName">Latijnse naam</Label>
                    <Input
                      id="latinName"
                      placeholder="Bijv. Rosa"
                      value={data.latinName}
                      onChange={(e) => handleFieldChange('latinName', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variety">Variëteit</Label>
                    <Input
                      id="variety"
                      placeholder="Bijv. Red Eden"
                      value={data.variety}
                      onChange={(e) => handleFieldChange('variety', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantColor">Plant kleur</Label>
                    <Input
                      id="plantColor"
                      placeholder="Bijv. Groen, Donkergroen"
                      value={data.plantColor}
                      onChange={(e) => handleFieldChange('plantColor', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantHeight">Plant hoogte (cm)</Label>
                    <Input
                      id="plantHeight"
                      type="number"
                      placeholder="Bijv. 80"
                      value={data.plantHeight}
                      onChange={(e) => handleFieldChange('plantHeight', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantsPerSqm">Planten per m²</Label>
                    <Input
                      id="plantsPerSqm"
                      type="number"
                      placeholder="Bijv. 4"
                      value={data.plantsPerSqm}
                      onChange={(e) => handleFieldChange('plantsPerSqm', e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sunPreference">Zonvoorkeur</Label>
                  <Select 
                    value={data.sunPreference} 
                    onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') => 
                      handleFieldChange('sunPreference', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-sun">Volle zon</SelectItem>
                      <SelectItem value="partial-sun">Halfschaduw</SelectItem>
                      <SelectItem value="shade">Schaduw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plantingDate">Plantdatum</Label>
                    <Input
                      id="plantingDate"
                      type="date"
                      value={data.plantingDate}
                      onChange={(e) => handleFieldChange('plantingDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedHarvestDate">Verwachte oogstdatum</Label>
                    <Input
                      id="expectedHarvestDate"
                      type="date"
                      value={data.expectedHarvestDate}
                      onChange={(e) => handleFieldChange('expectedHarvestDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={data.status} 
                    onValueChange={(value: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst") => 
                      handleFieldChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gezond">Gezond</SelectItem>
                      <SelectItem value="aandacht_nodig">Aandacht nodig</SelectItem>
                      <SelectItem value="ziek">Ziek</SelectItem>
                      <SelectItem value="dood">Dood</SelectItem>
                      <SelectItem value="geoogst">Geoogst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Opmerkingen</Label>
                  <Textarea
                    id="notes"
                    placeholder="Aanvullende opmerkingen over deze plant..."
                    value={data.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careInstructions">Verzorgingsinstructies</Label>
                  <Textarea
                    id="careInstructions"
                    placeholder="Specifieke verzorgingsinstructies..."
                    value={data.careInstructions}
                    onChange={(e) => handleFieldChange('careInstructions', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wateringFrequency">Water frequentie (dagen)</Label>
                    <Input
                      id="wateringFrequency"
                      type="number"
                      placeholder="Bijv. 3"
                      value={data.wateringFrequency}
                      onChange={(e) => handleFieldChange('wateringFrequency', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fertilizerSchedule">Bemestingsschema</Label>
                    <Input
                      id="fertilizerSchedule"
                      placeholder="Bijv. Wekelijks"
                      value={data.fertilizerSchedule}
                      onChange={(e) => handleFieldChange('fertilizerSchedule', e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Submit buttons */}
      <div className="flex gap-3 pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting || !data.name.trim() || !data.color.trim() || !data.height.trim()}
          className="flex-1"
        >
          {isSubmitting ? 'Bezig...' : submitLabel}
        </Button>
        {onReset && (
          <Button type="reset" variant="outline">
            Reset
          </Button>
        )}
      </div>
    </form>
  )
}

// Helper function to create initial form data
export function createInitialPlantFormData(): PlantFormData {
  return {
    name: "",
    color: "",
    height: "",
    scientificName: "",
    latinName: "",
    variety: "",
    plantColor: "",
    plantHeight: "",
    plantsPerSqm: "4",
    sunPreference: 'partial-sun',
    plantingDate: "",
    expectedHarvestDate: "",
    status: "gezond",
    notes: "",
    careInstructions: "",
    wateringFrequency: "",
    fertilizerSchedule: "",
    emoji: DEFAULT_FLOWER_EMOJI,
    isStandardFlower: false,
  }
}