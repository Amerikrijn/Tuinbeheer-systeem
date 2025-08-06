/**
 * FULL DATABASE CLEANUP
 * Keep only users and data from active gardens
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

async function fullCleanup() {
  console.log('🧹 FULL DATABASE CLEANUP')
  console.log('Keep: Users + Active Garden Data Only')
  console.log('='.repeat(40))

  try {
    // Get active gardens
    const { data: activeGardens } = await supabase
      .from('gardens')
      .select('*')
      .eq('is_active', true)

    console.log(`Found ${activeGardens?.length || 0} active gardens:`)
    activeGardens?.forEach(g => console.log(`  ✅ KEEP: ${g.name}`))

    if (!activeGardens || activeGardens.length === 0) {
      console.log('❌ No active gardens found!')
      return
    }

    const activeGardenIds = activeGardens.map(g => g.id)

    // Step 1: Delete all tasks (we'll recreate proper ones)
    console.log('\n🗑️ Deleting ALL tasks...')
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (tasksError) console.log('❌ Error deleting tasks:', tasksError.message)
    else console.log('✅ Deleted all tasks')

    // Step 2: Delete all logbook entries (we'll recreate proper ones)
    console.log('\n🗑️ Deleting ALL logbook entries...')
    const { error: logbookError } = await supabase
      .from('logbook_entries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (logbookError) console.log('❌ Error deleting logbook entries:', logbookError.message)
    else console.log('✅ Deleted all logbook entries')

    // Step 3: Delete all plants (we'll recreate proper ones)
    console.log('\n🗑️ Deleting ALL plants...')
    const { error: plantsError } = await supabase
      .from('plants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (plantsError) console.log('❌ Error deleting plants:', plantsError.message)
    else console.log('✅ Deleted all plants')

    // Step 4: Keep only plant beds from active gardens
    console.log('\n🗑️ Cleaning plant beds...')
    const { data: allBeds } = await supabase.from('plant_beds').select('*')
    const bedsToDelete = allBeds?.filter(bed => !activeGardenIds.includes(bed.garden_id)) || []

    if (bedsToDelete.length > 0) {
      const { error: bedsError } = await supabase
        .from('plant_beds')
        .delete()
        .in('id', bedsToDelete.map(b => b.id))

      if (bedsError) console.log('❌ Error deleting plant beds:', bedsError.message)
      else console.log(`✅ Deleted ${bedsToDelete.length} orphaned plant beds`)
    }

    // Step 5: Clean up garden access (keep only for active gardens)
    console.log('\n🗑️ Cleaning garden access...')
    const { data: allAccess } = await supabase.from('user_garden_access').select('*')
    const accessToDelete = allAccess?.filter(access => !activeGardenIds.includes(access.garden_id)) || []

    if (accessToDelete.length > 0) {
      const { error: accessError } = await supabase
        .from('user_garden_access')
        .delete()
        .in('id', accessToDelete.map(a => a.id))

      if (accessError) console.log('❌ Error cleaning garden access:', accessError.message)
      else console.log(`✅ Cleaned ${accessToDelete.length} orphaned garden access records`)
    }

    // Step 6: Delete inactive gardens
    console.log('\n🗑️ Deleting inactive gardens...')
    const { error: inactiveGardensError } = await supabase
      .from('gardens')
      .delete()
      .eq('is_active', false)

    if (inactiveGardensError) console.log('❌ Error deleting inactive gardens:', inactiveGardensError.message)
    else console.log('✅ Deleted inactive gardens')

    // Show final clean state
    const { data: finalUsers } = await supabase.from('users').select('*')
    const { data: finalGardens } = await supabase.from('gardens').select('*')
    const { data: finalBeds } = await supabase.from('plant_beds').select('*')
    const { data: finalPlants } = await supabase.from('plants').select('*')
    const { data: finalTasks } = await supabase.from('tasks').select('*')
    const { data: finalLogbook } = await supabase.from('logbook_entries').select('*')
    const { data: finalAccess } = await supabase.from('user_garden_access').select('*')

    console.log('\n📊 FINAL CLEAN DATABASE STATE:')
    console.log(`👥 Users: ${finalUsers?.length || 0} (PRESERVED)`)
    console.log(`🏡 Gardens: ${finalGardens?.length || 0} (active only)`)
    console.log(`🌱 Plant beds: ${finalBeds?.length || 0}`)
    console.log(`🌿 Plants: ${finalPlants?.length || 0}`)
    console.log(`📋 Tasks: ${finalTasks?.length || 0}`)
    console.log(`📖 Logbook entries: ${finalLogbook?.length || 0}`)
    console.log(`🔑 Garden access: ${finalAccess?.length || 0}`)

    console.log('\n✅ FULL CLEANUP COMPLETE!')
    console.log('🎯 Database is now clean and ready for proper test data')

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  }
}

fullCleanup()