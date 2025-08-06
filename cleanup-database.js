/**
 * DATABASE CLEANUP SCRIPT
 * Clean up orphaned data from deleted gardens
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

async function cleanupDatabase() {
  console.log('🧹 CLEANING UP DATABASE')
  console.log('='.repeat(30))

  try {
    // Get active gardens
    const { data: activeGardens } = await supabase
      .from('gardens')
      .select('*')
      .eq('is_active', true)

    console.log(`Found ${activeGardens?.length || 0} active gardens:`)
    activeGardens?.forEach(g => console.log(`  - ${g.name} (${g.id})`))

    const activeGardenIds = activeGardens?.map(g => g.id) || []

    if (activeGardenIds.length === 0) {
      console.log('❌ No active gardens found!')
      return
    }

    // Clean up plant beds from deleted gardens
    const { data: orphanedBeds } = await supabase
      .from('plant_beds')
      .select('*')
      .not('garden_id', 'in', `(${activeGardenIds.map(id => `'${id}'`).join(',')})`)

    if (orphanedBeds && orphanedBeds.length > 0) {
      console.log(`🗑️ Found ${orphanedBeds.length} orphaned plant beds`)
      
      const orphanedBedIds = orphanedBeds.map(b => b.id)
      
      // Delete plants in orphaned beds
      const { error: plantsError } = await supabase
        .from('plants')
        .delete()
        .in('plant_bed_id', orphanedBedIds)
      
      if (plantsError) console.log('❌ Error deleting orphaned plants:', plantsError.message)
      else console.log('✅ Deleted orphaned plants')

      // Delete tasks for orphaned plants
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .in('plant_id', '(select id from plants where plant_bed_id in (' + orphanedBedIds.map(id => `'${id}'`).join(',') + '))')
      
      // Delete logbook entries for orphaned beds
      const { error: logbookError } = await supabase
        .from('logbook_entries')
        .delete()
        .in('plant_bed_id', orphanedBedIds)
      
      if (logbookError) console.log('❌ Error deleting orphaned logbook entries:', logbookError.message)
      else console.log('✅ Deleted orphaned logbook entries')

      // Delete orphaned plant beds
      const { error: bedsError } = await supabase
        .from('plant_beds')
        .delete()
        .in('id', orphanedBedIds)
      
      if (bedsError) console.log('❌ Error deleting orphaned plant beds:', bedsError.message)
      else console.log('✅ Deleted orphaned plant beds')
    }

    // Clean up orphaned garden access
    const { error: accessError } = await supabase
      .from('user_garden_access')
      .delete()
      .not('garden_id', 'in', `(${activeGardenIds.map(id => `'${id}'`).join(',')})`)

    if (accessError) console.log('❌ Error cleaning garden access:', accessError.message)
    else console.log('✅ Cleaned up orphaned garden access')

    // Show final state
    const { data: finalPlants } = await supabase.from('plants').select('*')
    const { data: finalTasks } = await supabase.from('tasks').select('*')
    const { data: finalLogbook } = await supabase.from('logbook_entries').select('*')
    const { data: finalBeds } = await supabase.from('plant_beds').select('*')

    console.log('\n📊 CLEANED DATABASE STATE:')
    console.log(`🏡 Active gardens: ${activeGardens?.length || 0}`)
    console.log(`🌱 Plant beds: ${finalBeds?.length || 0}`)
    console.log(`🌿 Plants: ${finalPlants?.length || 0}`)
    console.log(`📋 Tasks: ${finalTasks?.length || 0}`)
    console.log(`📖 Logbook entries: ${finalLogbook?.length || 0}`)

    console.log('\n✅ Database cleanup complete!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  }
}

cleanupDatabase()