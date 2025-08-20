// Uitgebreide Nederlandse bloemen database met foto's en plant-compatible velden
// Alle velden komen overeen met de Plant interface uit lib/types/index.ts

export interface FlowerTemplate {
  // Basis informatie
  name: string
  scientific_name: string
  latin_name?: string
  variety?: string
  
  // Uiterlijk
  color: string
  plant_color?: string
  height: number // in cm
  plant_height?: number // in cm
  stem_length?: number
  emoji?: string
  
  // Groei eigenschappen
  plants_per_sqm: number // aantal planten per vierkante meter
  sun_preference: 'full-sun' | 'partial-sun' | 'shade'
  category: string
  bloom_period: string
  
  // Verzorging
  care_instructions: string
  watering_frequency: number // dagen tussen water geven
  fertilizer_schedule: string
  
  // Extra info
  notes?: string
  imageUrl: string // Unsplash of andere royalty-free bron
  planting_months: number[] // 1-12 voor maanden
  harvest_months?: number[] // voor eetbare bloemen
  
  // Nederlandse info
  dutchName: string
  description: string
  companionPlants?: string[]
  soilType: string
}

export const FLOWER_DATABASE: FlowerTemplate[] = [
  // ZONNEBLOEMEN
  {
    name: 'Zonnebloem',
    dutchName: 'Zonnebloem',
    scientific_name: 'Helianthus annuus',
    latin_name: 'Helianthus annuus',
    variety: 'Mammoth',
    color: '#FFD700',
    plant_color: 'Geel',
    height: 200,
    plant_height: 200,
    stem_length: 150,
    emoji: '🌻',
    plants_per_sqm: 4,
    sun_preference: 'full-sun',
    category: 'Eenjarig',
    bloom_period: 'Juli - September',
    care_instructions: 'Plant na laatste vorst. Steun grote variëteiten. Draai bloemen naar de zon.',
    watering_frequency: 3,
    fertilizer_schedule: 'Tweewekelijks tijdens groei',
    notes: 'Trekt bijen en vogels aan. Eetbare zaden.',
    imageUrl: 'https://images.unsplash.com/photo-1566275529824-cca6d008f3da?w=400',
    planting_months: [4, 5],
    harvest_months: [9, 10],
    description: 'Iconische grote gele bloemen die de zon volgen',
    companionPlants: ['Komkommer', 'Mais', 'Pompoen'],
    soilType: 'Goed gedraineerd, vruchtbaar'
  },
  
  // TULPEN
  {
    name: 'Tulp',
    dutchName: 'Tulp',
    scientific_name: 'Tulipa',
    latin_name: 'Tulipa gesneriana',
    variety: 'Triumph',
    color: '#FF0000',
    plant_color: 'Rood',
    height: 40,
    plant_height: 40,
    stem_length: 35,
    emoji: '🌷',
    plants_per_sqm: 50,
    sun_preference: 'full-sun',
    category: 'Bolgewas',
    bloom_period: 'Maart - Mei',
    care_instructions: 'Plant bollen in oktober-november, 10-15cm diep. Verwijder uitgebloeide bloemen.',
    watering_frequency: 5,
    fertilizer_schedule: 'Bij opkomst en na bloei',
    notes: 'Nederlands icoon. Honderden variëteiten beschikbaar.',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400',
    planting_months: [10, 11],
    description: 'Het symbool van Nederland, verkrijgbaar in alle kleuren',
    companionPlants: ['Narcis', 'Hyacint', 'Vergeet-mij-nietje'],
    soilType: 'Goed gedraineerd, zandig'
  },
  
  // ROZEN
  {
    name: 'Roos',
    dutchName: 'Roos',
    scientific_name: 'Rosa',
    latin_name: 'Rosa × hybrida',
    variety: 'Floribunda',
    color: '#FF69B4',
    plant_color: 'Roze',
    height: 80,
    plant_height: 80,
    stem_length: 60,
    emoji: '🌹',
    plants_per_sqm: 3,
    sun_preference: 'full-sun',
    category: 'Struik',
    bloom_period: 'Juni - Oktober',
    care_instructions: 'Snoei in maart. Verwijder uitgebloeide bloemen. Mulch in winter.',
    watering_frequency: 4,
    fertilizer_schedule: 'Maandelijks tijdens groeiseizoen',
    notes: 'Koningin van de bloemen. Let op ziektes zoals meeldauw.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    planting_months: [3, 4, 10, 11],
    description: 'Klassieke tuinbloem met heerlijke geur',
    companionPlants: ['Lavendel', 'Salie', 'Knoflook'],
    soilType: 'Rijk, goed gedraineerd, licht zuur'
  },
  
  // LAVENDEL
  {
    name: 'Lavendel',
    dutchName: 'Lavendel',
    scientific_name: 'Lavandula angustifolia',
    latin_name: 'Lavandula angustifolia',
    variety: 'Hidcote',
    color: '#9370DB',
    plant_color: 'Paars',
    height: 60,
    plant_height: 60,
    stem_length: 40,
    emoji: '💜',
    plants_per_sqm: 4,
    sun_preference: 'full-sun',
    category: 'Vaste plant',
    bloom_period: 'Juni - Augustus',
    care_instructions: 'Snoei na bloei. Goede drainage essentieel. Winterhard tot -15°C.',
    watering_frequency: 7,
    fertilizer_schedule: 'Eenmaal per jaar in voorjaar',
    notes: 'Aromatisch, trekt bijen aan, afweer tegen muggen',
    imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400',
    planting_months: [4, 5, 9, 10],
    description: 'Geurige mediterrane plant, perfect voor borders',
    companionPlants: ['Roos', 'Salie', 'Rozemarijn'],
    soilType: 'Goed gedraineerd, kalkrijk, zandig'
  },
  
  // DAHLIA
  {
    name: 'Dahlia',
    dutchName: 'Dahlia',
    scientific_name: 'Dahlia pinnata',
    latin_name: 'Dahlia × hortensis',
    variety: 'Bishop of Llandaff',
    color: '#DC143C',
    plant_color: 'Rood',
    height: 100,
    plant_height: 100,
    stem_length: 70,
    emoji: '🌺',
    plants_per_sqm: 3,
    sun_preference: 'full-sun',
    category: 'Knolgewas',
    bloom_period: 'Juli - Oktober',
    care_instructions: 'Plant na laatste vorst. Knollen opgraven voor winter. Steun nodig.',
    watering_frequency: 3,
    fertilizer_schedule: 'Tweewekelijks tijdens bloei',
    notes: 'Spectaculaire bloemen, uitstekend als snijbloem',
    imageUrl: 'https://images.unsplash.com/photo-1602028915047-37269d1a70f4?w=400',
    planting_months: [5],
    description: 'Spectaculaire zomerbloemen in vele vormen en kleuren',
    companionPlants: ['Zinnia', 'Cosmos', 'Salvia'],
    soilType: 'Rijk, vochtig maar goed gedraineerd'
  },
  
  // HORTENSIA
  {
    name: 'Hortensia',
    dutchName: 'Hortensia',
    scientific_name: 'Hydrangea macrophylla',
    latin_name: 'Hydrangea macrophylla',
    variety: 'Endless Summer',
    color: '#4169E1',
    plant_color: 'Blauw',
    height: 150,
    plant_height: 150,
    stem_length: 40,
    emoji: '💙',
    plants_per_sqm: 1,
    sun_preference: 'partial-sun',
    category: 'Struik',
    bloom_period: 'Juni - September',
    care_instructions: 'Zure grond voor blauwe bloemen, kalk voor roze. Snoei oude bloemen in voorjaar.',
    watering_frequency: 2,
    fertilizer_schedule: 'Maandelijks in groeiseizoen',
    notes: 'Kleur afhankelijk van pH bodem. Droogbloemen mogelijk.',
    imageUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400',
    planting_months: [3, 4, 10, 11],
    description: 'Grote bolronde bloemen, kleur varieert met bodem pH',
    companionPlants: ['Hosta', 'Varen', 'Astilbe'],
    soilType: 'Vochtig, humusrijk, zuur voor blauw'
  },
  
  // NARCIS
  {
    name: 'Narcis',
    dutchName: 'Narcis',
    scientific_name: 'Narcissus',
    latin_name: 'Narcissus pseudonarcissus',
    variety: 'Dutch Master',
    color: '#FFFF00',
    plant_color: 'Geel',
    height: 35,
    plant_height: 35,
    stem_length: 30,
    emoji: '🌼',
    plants_per_sqm: 40,
    sun_preference: 'partial-sun',
    category: 'Bolgewas',
    bloom_period: 'Maart - April',
    care_instructions: 'Plant in september-oktober. Laat blad afsterven voor energie opslag.',
    watering_frequency: 5,
    fertilizer_schedule: 'Na bloei voor bolgroei',
    notes: 'Eerste voorjaarsbloei, verwildert gemakkelijk',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400',
    planting_months: [9, 10],
    description: 'Vrolijke voorjaarsbode, verwildert prachtig',
    companionPlants: ['Tulp', 'Krokus', 'Blauwe druif'],
    soilType: 'Goed gedraineerd, vruchtbaar'
  },
  
  // KLAPROOS
  {
    name: 'Klaproos',
    dutchName: 'Klaproos',
    scientific_name: 'Papaver rhoeas',
    latin_name: 'Papaver rhoeas',
    variety: 'Flanders Field',
    color: '#FF0000',
    plant_color: 'Rood',
    height: 60,
    plant_height: 60,
    stem_length: 50,
    emoji: '🌺',
    plants_per_sqm: 20,
    sun_preference: 'full-sun',
    category: 'Eenjarig',
    bloom_period: 'Mei - Juli',
    care_instructions: 'Zaai direct buiten, verplanten moeilijk. Zaait zichzelf uit.',
    watering_frequency: 5,
    fertilizer_schedule: 'Niet nodig',
    notes: 'Symbool van herdenking, trekt bijen aan',
    imageUrl: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400',
    planting_months: [3, 4, 9],
    description: 'Delicate wilde bloem, symbool van herinnering',
    companionPlants: ['Korenbloem', 'Kamille', 'Grassen'],
    soilType: 'Arm tot matig vruchtbaar'
  },
  
  // PIOENROOS
  {
    name: 'Pioenroos',
    dutchName: 'Pioenroos',
    scientific_name: 'Paeonia lactiflora',
    latin_name: 'Paeonia lactiflora',
    variety: 'Sarah Bernhardt',
    color: '#FFB6C1',
    plant_color: 'Lichtroze',
    height: 90,
    plant_height: 90,
    stem_length: 60,
    emoji: '🌸',
    plants_per_sqm: 1,
    sun_preference: 'partial-sun',
    category: 'Vaste plant',
    bloom_period: 'Mei - Juni',
    care_instructions: 'Plant ondiep, ogen max 5cm onder grond. Steun bij zware bloemen.',
    watering_frequency: 4,
    fertilizer_schedule: 'Vroeg voorjaar en na bloei',
    notes: 'Kan 50+ jaar oud worden, mieren helpen knoppen openen',
    imageUrl: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400',
    planting_months: [9, 10, 11],
    description: 'Weelderige romantische bloemen, kunnen generaties meegaan',
    companionPlants: ['Iris', 'Salvia', 'Geranium'],
    soilType: 'Rijk, goed gedraineerd, neutraal'
  },
  
  // COSMEA
  {
    name: 'Cosmea',
    dutchName: 'Cosmea',
    scientific_name: 'Cosmos bipinnatus',
    latin_name: 'Cosmos bipinnatus',
    variety: 'Sensation Mix',
    color: '#FF1493',
    plant_color: 'Roze mix',
    height: 120,
    plant_height: 120,
    stem_length: 80,
    emoji: '🌸',
    plants_per_sqm: 9,
    sun_preference: 'full-sun',
    category: 'Eenjarig',
    bloom_period: 'Juni - Oktober',
    care_instructions: 'Knijp jonge planten voor vertakking. Verwijder uitgebloeide bloemen.',
    watering_frequency: 4,
    fertilizer_schedule: 'Weinig bemesting nodig',
    notes: 'Gemakkelijk uit zaad, zaait zichzelf uit',
    imageUrl: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400',
    planting_months: [4, 5],
    description: 'Luchtige bloemen die dansen in de wind',
    companionPlants: ['Zinnia', 'Dahlia', 'Verbena'],
    soilType: 'Arm tot matig vruchtbaar'
  }
]

// Helper functies voor de flowers pagina
export const getFlowerByName = (name: string): FlowerTemplate | undefined => {
  return FLOWER_DATABASE.find(f => 
    f.name.toLowerCase() === name.toLowerCase() || 
    f.dutchName.toLowerCase() === name.toLowerCase()
  )
}

export const getFlowersByCategory = (category: string): FlowerTemplate[] => {
  return FLOWER_DATABASE.filter(f => f.category.toLowerCase() === category.toLowerCase())
}

export const getFlowersBySunPreference = (pref: string): FlowerTemplate[] => {
  return FLOWER_DATABASE.filter(f => f.sun_preference === pref)
}

export const getPlantingFlowersForMonth = (month: number): FlowerTemplate[] => {
  return FLOWER_DATABASE.filter(f => f.planting_months.includes(month))
}

export const searchFlowers = (query: string): FlowerTemplate[] => {
  const q = query.toLowerCase()
  return FLOWER_DATABASE.filter(f => 
    f.name.toLowerCase().includes(q) ||
    f.dutchName.toLowerCase().includes(q) ||
    f.scientific_name.toLowerCase().includes(q) ||
    f.plant_color?.toLowerCase().includes(q) ||
    f.description.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  )
}

// Converteer FlowerTemplate naar Plant form data
export const flowerToPlantData = (flower: FlowerTemplate) => ({
  name: flower.name,
  scientific_name: flower.scientific_name,
  latin_name: flower.latin_name,
  variety: flower.variety,
  color: flower.color,
  plant_color: flower.plant_color,
  height: flower.height,
  plant_height: flower.plant_height,
  stem_length: flower.stem_length,
  plants_per_sqm: flower.plants_per_sqm,
  sun_preference: flower.sun_preference,
  category: flower.category,
  bloom_period: flower.bloom_period,
  care_instructions: flower.care_instructions,
  watering_frequency: flower.watering_frequency,
  fertilizer_schedule: flower.fertilizer_schedule,
  notes: flower.notes,
  emoji: flower.emoji,
  photo_url: flower.imageUrl
})

// Maanden helper
export const DUTCH_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
]

export const getMonthName = (month: number): string => {
  return DUTCH_MONTHS[month - 1] || ''
}