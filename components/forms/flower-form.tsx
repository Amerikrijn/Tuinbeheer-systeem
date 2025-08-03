"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Leaf, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

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

export interface FlowerFormData {
  name: string
  color: string
  height: string
  // Optional fields
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

interface FlowerFormProps {
  initialData?: Partial<FlowerFormData>
  onSubmit: (data: FlowerFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  title?: string
  loading?: boolean
}

export function FlowerForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Opslaan",
  title = "Bloem informatie",
  loading = false 
}: FlowerFormProps) {
  const [formData, setFormData] = React.useState<FlowerFormData>({
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
    ...initialData
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.name.trim()) nextErrors.name = "Bloemnaam is verplicht"
    if (!formData.color.trim()) nextErrors.color = "Kleur is verplicht"
    if (!formData.height.trim()) nextErrors.height = "Lengte is verplicht"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }))
    
    // Check if it matches a standard flower
    const selectedFlower = STANDARD_FLOWERS.find(f => 
      f.name.toLowerCase() === value.toLowerCase()
    )
    if (selectedFlower) {
      setFormData(prev => ({
        ...prev,
        name: value,
        emoji: selectedFlower.emoji,
        color: selectedFlower.name, // Use flower name as color for simplicity
        isStandardFlower: true,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        name: value,
        emoji: prev.emoji === DEFAULT_FLOWER_EMOJI ? DEFAULT_FLOWER_EMOJI : prev.emoji,
        isStandardFlower: false,
      }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields - Always Visible */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Verplichte gegevens</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Bloemnaam */}
              <div className="space-y-2">
                <Label htmlFor="name">Bloemnaam *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Typ een bloemnaam..."
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                    required
                    autoComplete="off"
                  />
                  {/* Show suggestions only when typing and there's input */}
                  {formData.name && formData.name.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {STANDARD_FLOWERS
                        .filter(flower => 
                          flower.name.toLowerCase().includes(formData.name.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((flower) => (
                          <div
                            key={flower.name}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => handleNameChange(flower.name)}
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

              {/* Kleur */}
              <div className="space-y-2">
                <Label htmlFor="color">Kleur *</Label>
                <Input
                  id="color"
                  placeholder="Bijv. Rood, Geel, Wit"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
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

              {/* Lengte */}
              <div className="space-y-2">
                <Label htmlFor="height">Lengte (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Bijv. 50"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
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
            </div>
          </div>

          {/* Advanced/Optional Fields - Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full justify-between">
                Meer opties
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4">
              <h3 className="text-sm font-medium text-gray-900">Optionele gegevens</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Wetenschappelijke naam */}
                <div className="space-y-2">
                  <Label htmlFor="scientificName">Wetenschappelijke naam</Label>
                  <Input
                    id="scientificName"
                    placeholder="Bijv. Solanum lycopersicum"
                    value={formData.scientificName}
                    onChange={(e) => setFormData(prev => ({ ...prev, scientificName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Latijnse naam */}
                <div className="space-y-2">
                  <Label htmlFor="latinName">Latijnse naam</Label>
                  <Input
                    id="latinName"
                    placeholder="Bijv. Rosa gallica"
                    value={formData.latinName}
                    onChange={(e) => setFormData(prev => ({ ...prev, latinName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Variëteit */}
                <div className="space-y-2">
                  <Label htmlFor="variety">Variëteit</Label>
                  <Input
                    id="variety"
                    placeholder="Bijv. Cherry tomaat"
                    value={formData.variety}
                    onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Plant kleur */}
                <div className="space-y-2">
                  <Label htmlFor="plantColor">Plant kleur</Label>
                  <Input
                    id="plantColor"
                    placeholder="Bijv. Groen, Donkergroen"
                    value={formData.plantColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, plantColor: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Plant hoogte */}
                <div className="space-y-2">
                  <Label htmlFor="plantHeight">Plant hoogte (cm)</Label>
                  <Input
                    id="plantHeight"
                    type="number"
                    placeholder="Bijv. 80"
                    value={formData.plantHeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, plantHeight: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Planten per m² */}
                <div className="space-y-2">
                  <Label htmlFor="plantsPerSqm">Planten per m²</Label>
                  <Input
                    id="plantsPerSqm"
                    type="number"
                    placeholder="Bijv. 4"
                    value={formData.plantsPerSqm}
                    onChange={(e) => setFormData(prev => ({ ...prev, plantsPerSqm: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Zonvoorkeur */}
                <div className="space-y-2">
                  <Label htmlFor="sunPreference">Zonvoorkeur</Label>
                  <Select
                    value={formData.sunPreference}
                    onValueChange={(value: 'full-sun' | 'partial-sun' | 'shade') =>
                      setFormData(prev => ({ ...prev, sunPreference: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer zonvoorkeur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-sun">☀️ Volle zon</SelectItem>
                      <SelectItem value="partial-sun">⛅ Gedeeltelijke zon</SelectItem>
                      <SelectItem value="shade">🌳 Schaduw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "gezond" | "aandacht_nodig" | "ziek" | "dood" | "geoogst") =>
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gezond">🌱 Gezond</SelectItem>
                      <SelectItem value="aandacht_nodig">⚠️ Aandacht nodig</SelectItem>
                      <SelectItem value="ziek">🦠 Ziek</SelectItem>
                      <SelectItem value="dood">💀 Dood</SelectItem>
                      <SelectItem value="geoogst">🌾 Geoogst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plantdatum */}
                <div className="space-y-2">
                  <Label htmlFor="plantingDate">Plantdatum</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Verwachte oogstdatum */}
                <div className="space-y-2">
                  <Label htmlFor="expectedHarvestDate">Verwachte oogstdatum</Label>
                  <Input
                    id="expectedHarvestDate"
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedHarvestDate: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Bewatering frequentie */}
                <div className="space-y-2">
                  <Label htmlFor="wateringFrequency">Bewatering (keer per week)</Label>
                  <Input
                    id="wateringFrequency"
                    type="number"
                    placeholder="Bijv. 3"
                    value={formData.wateringFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, wateringFrequency: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Bemestingsschema */}
                <div className="space-y-2">
                  <Label htmlFor="fertilizerSchedule">Bemestingsschema</Label>
                  <Input
                    id="fertilizerSchedule"
                    placeholder="Bijv. Elke 2 weken"
                    value={formData.fertilizerSchedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, fertilizerSchedule: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                {/* Emoji */}
                <div className="space-y-2">
                  <Label htmlFor="emoji">Emoji</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <span className="text-2xl">{formData.emoji}</span>
                    <span className="text-sm text-gray-600">
                      {formData.isStandardFlower 
                        ? "Automatisch toegewezen voor standaard bloem" 
                        : "Standaard emoji voor aangepaste bloem"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Textarea fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="careInstructions">Verzorgingsinstructies</Label>
                  <textarea
                    id="careInstructions"
                    rows={3}
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Speciale verzorgingsinstructies..."
                    value={formData.careInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, careInstructions: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notities</Label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Aanvullende notities, observaties, etc..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading}>
              {loading ? "Opslaan…" : submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Annuleren
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}