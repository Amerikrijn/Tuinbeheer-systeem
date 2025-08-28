#!/usr/bin/env ts-node

/**
 * Script to update existing plants with proper bloom_period data
 * from the Dutch flowers database
 */

import { supabase } from '../lib/supabase'
import { DUTCH_FLOWERS } from '../lib/dutch-flowers'

async function updateBloomPeriods() {
  console.log('🌸 Starting bloom period update...')
  
  try {
    // Fetch all plants
    const { data: plants, error: fetchError } = await supabase
      .from('plants')
      .select('id, name, bloom_period')
    
    if (fetchError) {
      console.error('Error fetching plants:', fetchError)
      return
    }
    
    if (!plants || plants.length === 0) {
      console.log('No plants found in database')
      return
    }
    
    console.log(`Found ${plants.length} plants to check`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    for (const plant of plants) {
      // Skip if plant already has a bloom_period
      if (plant.bloom_period && plant.bloom_period.trim() !== '') {
        skippedCount++
        continue
      }
      
      // Try to find matching Dutch flower data
      const dutchFlower = DUTCH_FLOWERS.find(f => 
        f.name.toLowerCase() === plant.name.toLowerCase() ||
        f.scientificName?.toLowerCase() === plant.name.toLowerCase() ||
        // Also check for partial matches
        plant.name.toLowerCase().includes(f.name.toLowerCase()) ||
        f.name.toLowerCase().includes(plant.name.toLowerCase())
      )
      
      if (dutchFlower) {
        // Update the plant with bloom period
        const { error: updateError } = await supabase
          .from('plants')
          .update({ bloom_period: dutchFlower.bloeiperiode })
          .eq('id', plant.id)
        
        if (updateError) {
          console.error(`Error updating plant ${plant.name}:`, updateError)
        } else {
          console.log(`✅ Updated ${plant.name} with bloom period: ${dutchFlower.bloeiperiode}`)
          updatedCount++
        }
      } else {
        console.log(`⚠️ No match found for: ${plant.name}`)
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`- Total plants: ${plants.length}`)
    console.log(`- Updated: ${updatedCount}`)
    console.log(`- Skipped (already had bloom_period): ${skippedCount}`)
    console.log(`- Not matched: ${plants.length - updatedCount - skippedCount}`)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
updateBloomPeriods()
  .then(() => {
    console.log('✨ Bloom period update complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })