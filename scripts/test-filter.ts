#!/usr/bin/env ts-node

/**
 * Test script to verify the month filter logic
 */

// Test data
const testPlants = [
  { name: 'Zinnia', bloom_period: 'Juni-Oktober' },
  { name: 'Marigold', bloom_period: 'Mei-Oktober' },
  { name: 'Petunia', bloom_period: 'Mei-Oktober' },
  { name: 'Cosmos', bloom_period: 'Juli-Oktober' },
  { name: 'Dahlia', bloom_period: 'Juli-Oktober' },
  { name: 'Tulp', bloom_period: 'Maart-Mei' },
  { name: 'Unknown', bloom_period: '' },
  { name: 'NoBloom', bloom_period: undefined },
]

// Parse month range helper
function parseMonthRange(period?: string): number[] {
  if (!period) return []
  
  const monthNames: { [key: string]: number } = {
    'januari': 1, 'februari': 2, 'maart': 3, 'april': 4,
    'mei': 5, 'juni': 6, 'juli': 7, 'augustus': 8,
    'september': 9, 'oktober': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mrt': 3, 'apr': 4, 'jun': 6,
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
    if (months.length > 12) break
  }
  months.push(endMonth)
  return months
}

// Get sowing months (2-3 months before blooming)
function getSowingMonths(bloomPeriod?: string): number[] {
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

const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

console.log('🌸 Testing Month Filter Logic\n')
console.log('Test Plants:')
testPlants.forEach(plant => {
  console.log(`- ${plant.name}: ${plant.bloom_period || '(no bloom data)'}`)
})

console.log('\n📅 Testing Bloom Filter:')
for (let month = 1; month <= 12; month++) {
  const bloomingPlants = testPlants.filter(plant => {
    const bloomMonths = parseMonthRange(plant.bloom_period)
    return bloomMonths.includes(month)
  })
  
  if (bloomingPlants.length > 0) {
    console.log(`${monthNames[month - 1]}: ${bloomingPlants.map(p => p.name).join(', ')}`)
  }
}

console.log('\n🌱 Testing Sowing Filter:')
for (let month = 1; month <= 12; month++) {
  const sowingPlants = testPlants.filter(plant => {
    const sowMonths = getSowingMonths(plant.bloom_period)
    return sowMonths.includes(month)
  })
  
  if (sowingPlants.length > 0) {
    console.log(`${monthNames[month - 1]}: ${sowingPlants.map(p => p.name).join(', ')}`)
  }
}

console.log('\n✅ Filter test complete!')