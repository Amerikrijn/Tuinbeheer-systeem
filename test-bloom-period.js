// Test script om te controleren of er planten zijn met bloom_period waarden
import { createClient } from '@supabase/supabase-js'

// Vervang deze waarden met je eigen Supabase configuratie
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBloomPeriod() {
  try {
    console.log('🔍 Testing bloom_period data...')
    
    // Test 1: Controleer of er planten zijn
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select('id, name, bloom_period')
      .limit(10)
    
    if (plantsError) {
      console.error('❌ Error fetching plants:', plantsError)
      return
    }
    
    console.log(`✅ Found ${plants?.length || 0} plants`)
    
    if (plants && plants.length > 0) {
      console.log('\n📋 Plant data:')
      plants.forEach((plant, index) => {
        console.log(`${index + 1}. ${plant.name} - bloom_period: ${plant.bloom_period || 'NULL'}`)
      })
    }
    
    // Test 2: Controleer planten met bloom_period
    const { data: plantsWithBloom, error: bloomError } = await supabase
      .from('plants')
      .select('id, name, bloom_period')
      .not('bloom_period', 'is', null)
      .limit(10)
    
    if (bloomError) {
      console.error('❌ Error fetching plants with bloom_period:', bloomError)
      return
    }
    
    console.log(`\n🌸 Found ${plantsWithBloom?.length || 0} plants with bloom_period`)
    
    if (plantsWithBloom && plantsWithBloom.length > 0) {
      console.log('\n📋 Plants with bloom_period:')
      plantsWithBloom.forEach((plant, index) => {
        console.log(`${index + 1}. ${plant.name} - ${plant.bloom_period}`)
      })
    } else {
      console.log('⚠️ No plants found with bloom_period values')
    }
    
    // Test 3: Controleer plant_beds met plants
    const { data: plantBeds, error: bedsError } = await supabase
      .from('plant_beds')
      .select(`
        *,
        plants(id, name, bloom_period)
      `)
      .eq('is_active', true)
      .limit(5)
    
    if (bedsError) {
      console.error('❌ Error fetching plant beds:', bedsError)
      return
    }
    
    console.log(`\n🛏️ Found ${plantBeds?.length || 0} plant beds`)
    
    if (plantBeds && plantBeds.length > 0) {
      console.log('\n📋 Plant beds with plants:')
      plantBeds.forEach((bed, index) => {
        console.log(`${index + 1}. ${bed.name} - ${bed.plants?.length || 0} plants`)
        if (bed.plants && bed.plants.length > 0) {
          bed.plants.forEach((plant, pIndex) => {
            console.log(`   ${pIndex + 1}. ${plant.name} - bloom_period: ${plant.bloom_period || 'NULL'}`)
          })
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testBloomPeriod()