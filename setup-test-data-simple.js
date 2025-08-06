/**
 * SIMPLE TEST DATA SETUP
 * Works around RLS policies by focusing on data that can be created
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

async function setupSimpleTestData() {
  console.log('🚀 SETTING UP SIMPLE TEST DATA')
  console.log('='.repeat(40))

  try {
    // Get existing data
    const { data: gardens } = await supabase.from('gardens').select('*')
    const { data: plantBeds } = await supabase.from('plant_beds').select('*')
    const { data: plants } = await supabase.from('plants').select('*')

    console.log(`Found: ${gardens?.length || 0} gardens, ${plantBeds?.length || 0} beds, ${plants?.length || 0} plants`)

    if (!plants || plants.length === 0) {
      console.log('❌ No plants found - cannot create tasks')
      console.log('Please create some plants first through the admin interface')
      return
    }

    // Create some tasks for existing plants
    const now = new Date()
    const tasks = []

    for (const plant of plants.slice(0, Math.min(plants.length, 8))) {
      // Pending task
      tasks.push({
        plant_id: plant.id,
        title: `Water ${plant.name}`,
        description: 'Dagelijks water geven',
        due_date: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        completed: false
      })

      // Overdue task
      if (Math.random() > 0.4) {
        tasks.push({
          plant_id: plant.id,
          title: `Bemesten ${plant.name}`,
          description: 'Organische bemesting toevoegen',
          due_date: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          completed: false
        })
      }

      // Completed task
      if (Math.random() > 0.3) {
        tasks.push({
          plant_id: plant.id,
          title: `Snoeien ${plant.name}`,
          description: 'Dode bladeren wegknippen',
          due_date: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium',
          completed: true,
          updated_at: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }

    if (tasks.length > 0) {
      const { data: createdTasks, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks)
        .select()

      if (tasksError) {
        console.log('❌ Error creating tasks:', tasksError.message)
      } else {
        console.log(`✅ Created ${createdTasks.length} tasks`)
      }
    }

    // Create logbook entries for existing plant beds
    if (plantBeds && plantBeds.length > 0) {
      const entries = []
      
      for (const bed of plantBeds.slice(0, 3)) {
        for (let i = 0; i < 2; i++) {
          entries.push({
            plant_bed_id: bed.id,
            entry_date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: `Test logboek entry ${i + 1} voor ${bed.name}. Alles ziet er goed uit!`,
            photo_url: null
          })
        }
      }

      if (entries.length > 0) {
        const { data: createdEntries, error: logbookError } = await supabase
          .from('logbook_entries')
          .insert(entries)
          .select()

        if (logbookError) {
          console.log('❌ Error creating logbook entries:', logbookError.message)
        } else {
          console.log(`✅ Created ${createdEntries.length} logbook entries`)
        }
      }
    }

    // Show final summary
    const { data: finalTasks } = await supabase.from('tasks').select('*')
    const { data: finalLogbook } = await supabase.from('logbook_entries').select('*')

    console.log('\n📊 FINAL DATABASE STATE:')
    console.log(`🏡 Gardens: ${gardens?.length || 0}`)
    console.log(`🌱 Plant beds: ${plantBeds?.length || 0}`)
    console.log(`🌿 Plants: ${plants?.length || 0}`)
    console.log(`📋 Tasks: ${finalTasks?.length || 0} (${finalTasks?.filter(t => !t.completed).length || 0} pending, ${finalTasks?.filter(t => t.completed).length || 0} completed)`)
    console.log(`📖 Logbook entries: ${finalLogbook?.length || 0}`)

    console.log('\n✅ Test data setup complete!')
    console.log('Now you need to:')
    console.log('1. Create user amerik.rijn@gmail.com via admin interface')
    console.log('2. Assign garden access to the user')
    console.log('3. Test the dashboard and logbook')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

setupSimpleTestData()