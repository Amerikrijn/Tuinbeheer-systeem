"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, AlertCircle, Leaf, Sun, Palette, Calendar, Droplets, Scissors } from "lucide-react"

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

export interface BloemFormData {
  // Required fields
  name: string
  color: string
  height: string
  
  // Optional fields - Plant Information
  scientificName: string
  latinName: string
  variety: string
  plantColor: string
  plantHeight: string
  plantsPerSqm: string
  
  // Optional fields - Growing Conditions
  sunPreference: 'full-sun' | 'partial-sun' | 'shade'
  
  // Optional fields - Timeline
  plantingDate: string
  expectedHarvestDate: string
  
  // Optional fields - Care & Status
  status: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst"
  notes: string
  careInstructions: string
  wateringFrequency: string
  fertilizerSchedule: string
  
  // Internal fields
  emoji: string
  isStandardFlower: boolean
}

export interface BloemFormErrors {
  name?: string
  color?: string
  height?: string
  [key: string]: string | undefined
}

interface BloemFormProps {
  data: BloemFormData
  errors: BloemFormErrors
  onChange: (data: BloemFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onReset?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function BloemForm({
  data,
  errors,
  onChange,
  onSubmit,
  onReset,
  submitLabel = "Bloem toevoegen",
  isSubmitting = false,
  mode = 'create'
}: BloemFormProps) {
  const [plantInfoOpen, setPlantInfoOpen] = React.useState(false)
  const [growingConditionsOpen, setGrowingConditionsOpen] = React.useState(false)
  const [timelineOpen, setTimelineOpen] = React.useState(false)
  const [careStatusOpen, setCareStatusOpen] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const handleFieldChange = (field: keyof BloemFormData, value: string | boolean) => {
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
    setShowSuggestions(value.length > 0)
  }

  const selectSuggestion = (flower: typeof STANDARD_FLOWERS[0]) => {
    onChange({
      ...data,
      name: flower.name,
      emoji: flower.emoji,
      color: data.color || flower.color,
      isStandardFlower: true,
    })
    setShowSuggestions(false)
  }

  // Check if any optional fields have values to auto-expand sections
  React.useEffect(() => {
    if (mode === 'edit') {
      const hasPlantInfo = data.scientificName || data.latinName || data.variety || data.plantColor || data.plantHeight || data.plantsPerSqm
      const hasGrowingConditions = data.sunPreference !== 'partial-sun'
      const hasTimeline = data.plantingDate || data.expectedHarvestDate
      const hasCareStatus = data.status !== 'gezond' || data.notes || data.careInstructions || data.wateringFrequency || data.fertilizerSchedule
      
      setPlantInfoOpen(!!hasPlantInfo)
      setGrowingConditionsOpen(!!hasGrowingConditions)
      setTimelineOpen(!!hasTimeline)
      setCareStatusOpen(!!hasCareStatus)
    }
  }, [mode, data])

  return (
    <form onSubmit={onSubmit} onReset={onReset} className="space-y-6">
      {/* Required Fields - Always Visible */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Leaf className="h-5 w-5" />
            Verplichte Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plant Name with suggestions */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-green-800 font-medium">Bloemnaam *</Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Typ een bloemnaam of kies uit de lijst..."
                value={data.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(data.name.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className={`${errors.name ? "border-destructive" : "border-green-300 focus:border-green-500"} pr-8`}
                required
                autoComplete="off"
              />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              
              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {STANDARD_FLOWERS
                    .filter(flower => 
                      flower.name.toLowerCase().includes(data.name.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((flower) => (
                      <div
                        key={flower.name}
                        className="px-3 py-2 cursor-pointer hover:bg-green-50 flex items-center gap-2 border-b border-green-100 last:border-b-0"
                        onClick={() => selectSuggestion(flower)}
                      >
                        <span className="text-lg">{flower.emoji}</span>
                        <span className="font-medium">{flower.name}</span>
                        <div 
                          className="ml-auto w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: flower.color }}
                        />
                      </div>
                    ))}
                  {data.name && !STANDARD_FLOWERS.some(f => 
                    f.name.toLowerCase().includes(data.name.toLowerCase())
                  ) && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      Geen standaard bloemen gevonden. Je kunt een eigen naam invoeren.
                    </div>
                  )}
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
            <Label htmlFor="color" className="text-green-800 font-medium">Kleur *</Label>
            <Input
              id="color"
              placeholder="Bijv. Rood, Geel, Wit, Roze"
              value={data.color}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              className={errors.color ? "border-destructive" : "border-green-300 focus:border-green-500"}
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
            <Label htmlFor="height" className="text-green-800 font-medium">Hoogte (cm) *</Label>
            <Input
              id="height"
              type="number"
              placeholder="Bijv. 150"
              value={data.height}
              onChange={(e) => handleFieldChange('height', e.target.value)}
              className={errors.height ? "border-destructive" : "border-green-300 focus:border-green-500"}
              required
              autoComplete="off"
              min="1"
              max="500"
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

      {/* Optional Fields - Plant Information */}
      <Collapsible open={plantInfoOpen} onOpenChange={setPlantInfoOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between hover:bg-blue-50">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-blue-600" />
              <span>Plant Informatie</span>
              {(data.scientificName || data.latinName || data.variety || data.plantColor || data.plantHeight || data.plantsPerSqm) && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Ingevuld
                </span>
              )}
            </div>
            {plantInfoOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
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
                    min="1"
                    max="500"
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
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Optional Fields - Growing Conditions */}
      <Collapsible open={growingConditionsOpen} onOpenChange={setGrowingConditionsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between hover:bg-orange-50">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-orange-600" />
              <span>Groeiomstandigheden</span>
              {data.sunPreference !== 'partial-sun' && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Ingevuld
                </span>
              )}
            </div>
            {growingConditionsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="pt-6">
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
                    <SelectItem value="full-sun">☀️ Volle zon</SelectItem>
                    <SelectItem value="partial-sun">⛅ Halfschaduw</SelectItem>
                    <SelectItem value="shade">☁️ Schaduw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Optional Fields - Timeline */}
      <Collapsible open={timelineOpen} onOpenChange={setTimelineOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between hover:bg-purple-50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Tijdlijn</span>
              {(data.plantingDate || data.expectedHarvestDate) && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Ingevuld
                </span>
              )}
            </div>
            {timelineOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Optional Fields - Care & Status */}
      <Collapsible open={careStatusOpen} onOpenChange={setCareStatusOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between hover:bg-green-50">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-green-600" />
              <span>Verzorging & Status</span>
              {(data.status !== 'gezond' || data.notes || data.careInstructions || data.wateringFrequency || data.fertilizerSchedule) && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Ingevuld
                </span>
              )}
            </div>
            {careStatusOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
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
                    <SelectItem value="gezond">🟢 Gezond</SelectItem>
                    <SelectItem value="aandacht_nodig">🟡 Aandacht nodig</SelectItem>
                    <SelectItem value="ziek">🔴 Ziek</SelectItem>
                    <SelectItem value="dood">⚫ Dood</SelectItem>
                    <SelectItem value="geoogst">🔵 Geoogst</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Opmerkingen</Label>
                <Textarea
                  id="notes"
                  placeholder="Aanvullende opmerkingen over deze bloem..."
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
                    min="1"
                    max="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fertilizerSchedule">Bemestingsschema</Label>
                  <Input
                    id="fertilizerSchedule"
                    placeholder="Bijv. Wekelijks, Maandelijks"
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

      {/* Submit buttons */}
      <div className="flex gap-3 pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting || !data.name.trim() || !data.color.trim() || !data.height.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700"
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
export function createInitialBloemFormData(): BloemFormData {
  return {
    // Required fields
    name: "",
    color: "",
    height: "",
    
    // Optional fields - Plant Information
    scientificName: "",
    latinName: "",
    variety: "",
    plantColor: "",
    plantHeight: "",
    plantsPerSqm: "4",
    
    // Optional fields - Growing Conditions
    sunPreference: 'partial-sun',
    
    // Optional fields - Timeline
    plantingDate: "",
    expectedHarvestDate: "",
    
    // Optional fields - Care & Status
    status: "gezond",
    notes: "",
    careInstructions: "",
    wateringFrequency: "",
    fertilizerSchedule: "",
    
    // Internal fields
    emoji: DEFAULT_FLOWER_EMOJI,
    isStandardFlower: false,
  }
}