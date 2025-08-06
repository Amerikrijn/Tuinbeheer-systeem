/**
 * CHECK TASK CONNECTIONS
 * Verify how tasks are linked to gardens
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

async function checkTaskConnections() {
  console.log('🔍 CHECKING TASK CONNECTIONS')
  console.log('='.repeat(30))

  try {
    // Get all tasks with full connection chain
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        priority,
        completed,
        plants(
          id,
          name,
          plant_beds(
            id,
            name,
            garden_id,
            gardens(
              id,
              name
            )
          )
        )
      `)
      .order('title')

    console.log(`Found ${tasks?.length || 0} tasks:\n`)

    tasks?.forEach(task => {
      const plant = task.plants
      const bed = plant?.plant_beds
      const garden = bed?.gardens

      console.log(`📋 ${task.title}`)
      console.log(`   Plant: ${plant?.name || 'UNKNOWN'}`)
      console.log(`   Bed: ${bed?.name || 'UNKNOWN'}`)
      console.log(`   Garden: ${garden?.name || 'UNKNOWN'} (${garden?.id || 'NO ID'})`)
      console.log(`   Status: ${task.completed ? 'COMPLETED' : 'PENDING'}`)
      console.log(`   Due: ${task.due_date}`)
      console.log('')
    })

    // Check specifically fertilizing tasks
    const fertilizingTasks = tasks?.filter(task => task.title.includes('Bemesten')) || []
    console.log(`🌿 FERTILIZING TASKS: ${fertilizingTasks.length}`)
    
    fertilizingTasks.forEach(task => {
      console.log(`  - ${task.title} → ${task.plants?.plant_beds?.gardens?.name}`)
    })

    // Check garden connection
    const gardenIds = [...new Set(tasks?.map(task => task.plants?.plant_beds?.gardens?.id).filter(Boolean))]
    console.log(`\n🏡 CONNECTED GARDENS: ${gardenIds.length}`)
    gardenIds.forEach(id => {
      const garden = tasks?.find(task => task.plants?.plant_beds?.gardens?.id === id)?.plants?.plant_beds?.gardens
      console.log(`  - ${garden?.name} (${id})`)
    })

  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkTaskConnections()