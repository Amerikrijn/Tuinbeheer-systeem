"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, AlertCircle, Settings, Flower, Info } from "lucide-react"

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
  variety: string
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
  const [showSuggestions, setShowSuggestions] = React.useState(false)

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
    setShowSuggestions(value.length > 0)
  }

  const handleNameFocus = () => {
    setShowSuggestions(data.name.length > 0)
  }

  const handleNameBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const selectFlower = (flower: typeof STANDARD_FLOWERS[0]) => {
    onChange({
      ...data,
      name: flower.name,
      emoji: flower.emoji,
      color: data.color || flower.color,
      isStandardFlower: true,
    })
    setShowSuggestions(false)
  }

  // Count filled optional fields
  const filledOptionalFields = React.useMemo(() => {
    const optionalFields = [
      'scientificName', 'variety', 'plantingDate', 'expectedHarvestDate', 'notes',
      'careInstructions', 'wateringFrequency', 'fertilizerSchedule'
    ]
    return optionalFields.filter(field => {
      const value = data[field as keyof PlantFormData]
      return value && value.toString().trim() !== '' && value !== 'partial-sun' && value !== 'gezond' && value !== '4'
    }).length
  }, [data])

  return (
    <form onSubmit={onSubmit} onReset={onReset} className=""space-y-6">
      {/* Required Fields Card */}
      <Card className=""border-2 border-green-200 bg-green-50 dark:bg-green-950/30">
        <CardHeader className=""pb-4">
          <CardTitle className=""flex items-center gap-2 text-green-800">
            <Flower className=""h-5 w-5" />
            Basis Plantgegevens
            <span className=""text-sm font-normal text-green-600 dark:text-green-400">(verplicht)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className=""space-y-6">
          {/* Plant Name with suggestions */}
          <div className=""space-y-2">
            <Label htmlFor="name" className=""text-sm font-medium text-foreground flex items-center gap-1">
              Plantnaam
              <span className=""text-red-500 dark:text-red-400">*</span>
            </Label>
            <div className=""relative">
              <Input
                id="name"
                placeholder="Typ een plantnaam of kies uit de lijst..."
                value={data.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={handleNameFocus}
                onBlur={handleNameBlur}
                className={{`${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-500 focus:border-green-500"} text-base`}
                required
                autoComplete="off"
              />
              <ChevronDown className=""absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              
              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className=""absolute z-20 w-full mt-1 bg-background border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {STANDARD_FLOWERS
                    .filter(flower => 
                      flower.name.toLowerCase().includes(data.name.toLowerCase())
                    )
                    .slice(0, 6)
                    .map((flower) => (
                      <div
                        key={flower.name}
                        className=""px-4 py-3 cursor-pointer hover:bg-green-50 dark:bg-green-950 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => selectFlower(flower)}
                      >
                        <span className=""text-xl">{flower.emoji}</span>
                        <div>
                          <span className=""font-medium">{flower.name}</span>
                          <div className=""text-xs text-muted-foreground">Standaard plant</div>
                        </div>
                      </div>
                    ))}
                  {data.name && !STANDARD_FLOWERS.some(f => 
                    f.name.toLowerCase().includes(data.name.toLowerCase())
                  ) && (
                    <div className=""px-4 py-3 text-muted-foreground text-sm border-b border-gray-100 dark:border-gray-700">
                      <div className=""flex items-center gap-2">
                        <span className=""text-lg">{DEFAULT_FLOWER_EMOJI}</span>
                        <span>"{data.name}" als nieuwe plant</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.name && (
              <div className=""flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 p-2 rounded-md">
                <AlertCircle className=""h-4 w-4 flex-shrink-0" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Color */}
          <div className=""space-y-2">
            <Label htmlFor="color" className=""text-sm font-medium text-foreground flex items-center gap-1">
              Kleur
              <span className=""text-red-500 dark:text-red-400">*</span>
            </Label>
            <Input
              id="color"
              placeholder="Bijv. Rood, Geel, Wit, Roze"
              value={data.color}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              className={{`${errors.color ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-500 focus:border-green-500"} text-base`}
              required
              autoComplete="off"
            />
            {errors.color && (
              <div className=""flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 p-2 rounded-md">
                <AlertCircle className=""h-4 w-4 flex-shrink-0" />
                {errors.color}
              </div>
            )}
          </div>

          {/* Height */}
          <div className=""space-y-2">
            <Label htmlFor="height" className=""text-sm font-medium text-foreground flex items-center gap-1">
              Hoogte (cm)
              <span className=""text-red-500 dark:text-red-400">*</span>
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="Bijv. 30, 60, 150"
              value={data.height}
              onChange={(e) => handleFieldChange('height', e.target.value)}
              className={{`${errors.height ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-500 focus:border-green-500"} text-base`}
              required
              min="1"
              max="500"
              autoComplete="off"
            />
            {errors.height && (
              <div className=""flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 p-2 rounded-md">
                <AlertCircle className=""h-4 w-4 flex-shrink-0" />
                {errors.height}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields (Collapsible) */}
      {showAdvanced && (
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
                    <Card className=""cursor-pointer hover:shadow-md transition-colors duration-150 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 dark:bg-green-950/20">
          <CardHeader className=""pb-4">
            <div className=""flex items-center justify-between">
              <div className=""flex items-center gap-2">
                <Settings className=""h-5 w-5 text-green-700 dark:text-green-300" />
                <CardTitle className=""text-green-800 dark:text-green-200">
                  Aanvullende Informatie
                  <span className=""text-sm font-normal text-muted-foreground ml-2">(optioneel)</span>
                </CardTitle>
                {filledOptionalFields > 0 && (
                  <span className=""bg-green-100 dark:bg-green-900 text-green-800 text-xs px-2 py-1 rounded-full border border-green-300 dark:border-green-700">
                    {filledOptionalFields} ingevuld
                  </span>
                )}
              </div>
              <div className=""flex items-center gap-2">
                <span className=""text-sm text-muted-foreground">
                  {isAdvancedOpen ? 'Inklappen' : 'Uitklappen'}
                </span>
                {isAdvancedOpen ? (
                  <ChevronUp className=""h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className=""h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent className=""mt-4">
            <Card className=""border-gray-200 dark:border-gray-600">
              <CardContent className=""pt-6 space-y-6">
                {/* Scientific Information Section */}
                <div className=""space-y-4">
                  <div className=""flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <Info className=""h-4 w-4 text-muted-foreground" />
                    <h4 className=""font-medium text-foreground">Wetenschappelijke Informatie</h4>
                  </div>
                  <div className=""grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className=""space-y-2">
                      <Label htmlFor="scientificName" className=""text-sm font-medium text-foreground">
                        Wetenschappelijke naam
                      </Label>
                      <Input
                        id="scientificName"
                        placeholder="Bijv. Rosa rubiginosa"
                        value={data.scientificName}
                        onChange={(e) => handleFieldChange('scientificName', e.target.value)}
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                        autoComplete="off"
                      />
                    </div>

                    <div className=""space-y-2 md:col-span-2">
                      <Label htmlFor="variety" className=""text-sm font-medium text-foreground">
                        Variëteit
                      </Label>
                      <Input
                        id="variety"
                        placeholder="Bijv. Red Eden, Double Delight"
                        value={data.variety}
                        onChange={(e) => handleFieldChange('variety', e.target.value)}
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                {/* Growing Information Section */}
                <div className=""space-y-4">
                  <div className=""flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <Flower className=""h-4 w-4 text-muted-foreground" />
                    <h4 className=""font-medium text-foreground">Groei Informatie</h4>
                  </div>
                  <div className=""grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className=""space-y-2">
                      <Label htmlFor="plantsPerSqm" className=""text-sm font-medium text-foreground">
                        Planten per m²
                      </Label>
                      <Input
                        id="plantsPerSqm"
                        type="number"
                        placeholder="Bijv. 4"
                        value={data.plantsPerSqm}
                        onChange={(e) => handleFieldChange('plantsPerSqm', e.target.value)}
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                        min="1"
                        max="100"
                        autoComplete="off"
                      />
                    </div>

                    <div className=""space-y-2">
                      <Label htmlFor="sunPreference" className=""text-sm font-medium text-foreground">
                        Zonvoorkeur
                      </Label>
                      <Select 
                        value={data.sunPreference} 
                        onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') => 
                          handleFieldChange('sunPreference', value)
                        }
                      >
                        <SelectTrigger className=""border-gray-300 dark:border-gray-500 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-sun">☀️ Volle zon</SelectItem>
                          <SelectItem value="partial-sun">⛅ Halfschaduw</SelectItem>
                          <SelectItem value="shade">🌤️ Schaduw</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Planning Section */}
                <div className=""space-y-4">
                  <div className=""flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className=""h-4 w-4 text-muted-foreground">📅</span>
                    <h4 className=""font-medium text-foreground">Planning & Status</h4>
                  </div>
                  <div className=""grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className=""space-y-2">
                      <Label htmlFor="plantingDate" className=""text-sm font-medium text-foreground">
                        Plantdatum
                      </Label>
                      <Input
                        id="plantingDate"
                        type="date"
                        value={data.plantingDate}
                        onChange={(e) => handleFieldChange('plantingDate', e.target.value)}
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                      />
                    </div>

                    <div className=""space-y-2">
                      <Label htmlFor="expectedHarvestDate" className=""text-sm font-medium text-foreground">
                        Bloeiperiode
                      </Label>
                      <Input
                        id="expectedHarvestDate"
                        type="text"
                        value={data.expectedHarvestDate}
                        onChange={(e) => handleFieldChange('expectedHarvestDate', e.target.value)}
                        placeholder="Bijvoorbeeld: Mei-September"
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                      />
                    </div>

                    <div className=""space-y-2 md:col-span-2">
                      <Label htmlFor="status" className=""text-sm font-medium text-foreground">
                        Status
                      </Label>
                      <Select 
                        value={data.status} 
                        onValueChange={(value: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst") => 
                          handleFieldChange('status', value)
                        }
                      >
                        <SelectTrigger className=""border-gray-300 dark:border-gray-500 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gezond">✅ Gezond</SelectItem>
                          <SelectItem value="aandacht_nodig">⚠️ Aandacht nodig</SelectItem>
                          <SelectItem value="ziek">🤒 Ziek</SelectItem>
                          <SelectItem value="dood">💀 Dood</SelectItem>
                          <SelectItem value="geoogst">🌸 Geoogst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Care Instructions Section */}
                <div className=""space-y-4">
                  <div className=""flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className=""h-4 w-4 text-muted-foreground">🌿</span>
                    <h4 className=""font-medium text-foreground">Verzorging</h4>
                  </div>
                  <div className=""space-y-4">
                    <div className=""space-y-2">
                      <Label htmlFor="notes" className=""text-sm font-medium text-foreground">
                        Opmerkingen
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Bijv. Mooi in combinatie met lavendel, bloeit van mei tot oktober..."
                        value={data.notes}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500 min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    <div className=""space-y-2">
                      <Label htmlFor="careInstructions" className=""text-sm font-medium text-foreground">
                        Verzorgingsinstructies
                      </Label>
                      <Textarea
                        id="careInstructions"
                        placeholder="Bijv. Wekelijks water geven, maandelijks bemesten, dode bladeren wegknippen..."
                        value={data.careInstructions}
                        onChange={(e) => handleFieldChange('careInstructions', e.target.value)}
                        className=""border-gray-300 dark:border-gray-500 focus:border-blue-500 min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    <div className=""grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className=""space-y-2">
                        <Label htmlFor="wateringFrequency" className=""text-sm font-medium text-foreground">
                          Water frequentie (dagen)
                        </Label>
                        <Input
                          id="wateringFrequency"
                          type="number"
                          placeholder="Bijv. 3"
                          value={data.wateringFrequency}
                          onChange={(e) => handleFieldChange('wateringFrequency', e.target.value)}
                          className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                          min="1"
                          max="365"
                          autoComplete="off"
                        />
                      </div>

                      <div className=""space-y-2">
                        <Label htmlFor="fertilizerSchedule" className=""text-sm font-medium text-foreground">
                          Bemestingsschema
                        </Label>
                        <Input
                          id="fertilizerSchedule"
                          placeholder="Bijv. Wekelijks, Maandelijks"
                          value={data.fertilizerSchedule}
                          onChange={(e) => handleFieldChange('fertilizerSchedule', e.target.value)}
                          className=""border-gray-300 dark:border-gray-500 focus:border-blue-500"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Submit buttons */}
      <div className=""flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
        <Button 
          type="submit" 
          disabled={isSubmitting || !data.name.trim() || !data.color.trim() || !data.height.trim()}
          className=""flex-1 bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white dark:text-black"
          size="lg"
        >
          {isSubmitting ? (
            <div className=""flex items-center gap-2">
              <div className=""w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              Bezig...
            </div>
          ) : (
            submitLabel
          )}
        </Button>
        {onReset && (
          <Button type="reset" variant="outline" size="lg">
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
    variety: "",
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