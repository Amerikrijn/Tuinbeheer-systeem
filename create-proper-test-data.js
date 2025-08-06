/**
 * CREATE PROPER TEST DATA
 * For the existing garden "Mijn eerste tuin Amerik"
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

async function createProperTestData() {
  console.log('🌱 CREATING PROPER TEST DATA')
  console.log('='.repeat(35))

  try {
    // Get the existing garden and plant beds
    const { data: garden } = await supabase
      .from('gardens')
      .select('*')
      .eq('is_active', true)
      .single()

    const { data: plantBeds } = await supabase
      .from('plant_beds')
      .select('*')
      .eq('garden_id', garden.id)

    console.log(`Garden: ${garden.name}`)
    console.log(`Plant beds: ${plantBeds?.length || 0}`)

    // Create plants for each bed
    const plants = []
    
    for (const bed of plantBeds) {
      const bedPlants = [
        {
          plant_bed_id: bed.id,
          name: 'Tomaten',
          variety: 'Cherry tomaten',
          color: 'Rood',
          status: 'gezond',
          planting_date: '2024-12-01'
        },
        {
          plant_bed_id: bed.id,
          name: 'Basilicum',
          variety: 'Genovese',
          color: 'Groen',
          status: 'gezond',
          planting_date: '2024-12-01'
        },
        {
          plant_bed_id: bed.id,
          name: 'Sla',
          variety: 'Ijsbergsla',
          color: 'Groen',
          status: 'aandacht_nodig',
          planting_date: '2024-12-05'
        }
      ]
      plants.push(...bedPlants)
    }

    const { data: createdPlants, error: plantsError } = await supabase
      .from('plants')
      .insert(plants)
      .select()

    if (plantsError) throw plantsError
    console.log(`✅ Created ${createdPlants.length} plants`)

    // Create realistic tasks
    const now = new Date()
    const tasks = []

    // Create tasks for each plant
    for (const plant of createdPlants) {
      // Pending task - due this week
      const dueThisWeek = new Date(now)
      dueThisWeek.setDate(now.getDate() + Math.floor(Math.random() * 5)) // 0-4 days from now
      
      tasks.push({
        plant_id: plant.id,
        title: `Water ${plant.name}`,
        description: 'Dagelijks water geven, vooral bij warm weer',
        due_date: dueThisWeek.toISOString().split('T')[0],
        priority: 'medium',
        completed: false
      })

      // Overdue task - some plants
      if (Math.random() > 0.4) {
        const overdue = new Date(now)
        overdue.setDate(now.getDate() - Math.floor(Math.random() * 3) - 1) // 1-3 days ago
        
        tasks.push({
          plant_id: plant.id,
          title: `Bemesten ${plant.name}`,
          description: 'Organische compost toevoegen',
          due_date: overdue.toISOString().split('T')[0],
          priority: 'high',
          completed: false
        })
      }

      // Completed task - recent
      if (Math.random() > 0.3) {
        const completedDate = new Date(now)
        completedDate.setDate(now.getDate() - Math.floor(Math.random() * 5) - 1) // 1-5 days ago
        
        tasks.push({
          plant_id: plant.id,
          title: `Snoeien ${plant.name}`,
          description: 'Dode bladeren en ziektakjes wegknippen',
          due_date: completedDate.toISOString().split('T')[0],
          priority: 'low',
          completed: true,
          updated_at: completedDate.toISOString()
        })
      }
    }

    const { data: createdTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select()

    if (tasksError) throw tasksError
    
    const pendingTasks = createdTasks.filter(t => !t.completed)
    const completedTasks = createdTasks.filter(t => t.completed)
    console.log(`✅ Created ${createdTasks.length} tasks (${pendingTasks.length} pending, ${completedTasks.length} completed)`)

    // Create logbook entries
    const logbookEntries = []
    
    for (const bed of plantBeds) {
      // Recent entries
      for (let i = 0; i < 3; i++) {
        const entryDate = new Date(now)
        entryDate.setDate(now.getDate() - i - 1) // 1-3 days ago
        
        logbookEntries.push({
          plant_bed_id: bed.id,
          entry_date: entryDate.toISOString().split('T')[0],
          notes: `Logboek entry voor ${bed.name}. Dag ${i + 1}: Planten zien er goed uit. Water gegeven en onkruid weggehaald.`,
          photo_url: null
        })
      }
    }

    const { data: createdLogbook, error: logbookError } = await supabase
      .from('logbook_entries')
      .insert(logbookEntries)
      .select()

    if (logbookError) throw logbookError
    console.log(`✅ Created ${createdLogbook.length} logbook entries`)

    // Show final summary
    console.log('\n📊 CREATED TEST DATA:')
    console.log(`🏡 Garden: ${garden.name}`)
    console.log(`🌱 Plant beds: ${plantBeds.length}`)
    console.log(`🌿 Plants: ${createdPlants.length}`)
    console.log(`📋 Tasks: ${createdTasks.length} (${pendingTasks.length} pending, ${completedTasks.length} completed)`)
    console.log(`📖 Logbook entries: ${createdLogbook.length}`)

    console.log('\n🎯 READY FOR TESTING!')
    console.log('Next steps:')
    console.log('1. Create user amerik.rijn@gmail.com via admin interface')
    console.log('2. Assign garden access to this user')
    console.log('3. Test dashboard and logbook functionality')

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message)
  }
}

createProperTestData()