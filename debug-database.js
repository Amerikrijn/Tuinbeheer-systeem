const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugDatabase() {
  console.log('🔍 DEBUGGING DATABASE DATA\n')

  try {
    // 1. Check users and their garden access
    console.log('👥 USERS AND GARDEN ACCESS:')
    const { data: users } = await supabase.from('users').select('*')
    console.log('Users found:', users?.length || 0)
    
    for (const user of users || []) {
      console.log(`- ${user.email} (${user.role})`)
      
      // Check garden access for this user
      const { data: access } = await supabase
        .from('user_garden_access')
        .select('garden_id, gardens(name)')
        .eq('user_id', user.id)
      
      console.log(`  Garden access:`, access?.map(a => `${a.gardens.name} (${a.garden_id})`).join(', ') || 'None')
    }
    console.log()

    // 2. Check gardens
    console.log('🏡 GARDENS:')
    const { data: gardens } = await supabase.from('gardens').select('*')
    console.log('Gardens found:', gardens?.length || 0)
    
    for (const garden of gardens || []) {
      console.log(`- ${garden.name} (ID: ${garden.id}) - Active: ${garden.is_active}`)
    }
    console.log()

    // 3. Check plant beds per garden
    console.log('🌱 PLANT BEDS PER GARDEN:')
    for (const garden of gardens || []) {
      const { data: beds } = await supabase
        .from('plant_beds')
        .select('*')
        .eq('garden_id', garden.id)
      
      console.log(`${garden.name}: ${beds?.length || 0} plant beds`)
      for (const bed of beds || []) {
        console.log(`  - ${bed.name} (ID: ${bed.id})`)
      }
    }
    console.log()

    // 4. Check plants per garden
    console.log('🌿 PLANTS PER GARDEN:')
    for (const garden of gardens || []) {
      const { data: plants } = await supabase
        .from('plants')
        .select('*, plant_beds(name)')
        .eq('plant_beds.garden_id', garden.id)
      
      console.log(`${garden.name}: ${plants?.length || 0} plants`)
      for (const plant of plants || []) {
        console.log(`  - ${plant.name} in ${plant.plant_beds.name}`)
      }
    }
    console.log()

    // 5. Check tasks per garden
    console.log('📋 TASKS PER GARDEN:')
    for (const garden of gardens || []) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          plants(name, plant_beds(name, garden_id))
        `)
        .eq('plants.plant_beds.garden_id', garden.id)
      
      console.log(`${garden.name}: ${tasks?.length || 0} tasks`)
      
      const completed = tasks?.filter(t => t.completed) || []
      const pending = tasks?.filter(t => !t.completed) || []
      
      console.log(`  - Pending: ${pending.length}, Completed: ${completed.length}`)
      
      for (const task of tasks?.slice(0, 3) || []) {
        console.log(`  - ${task.completed ? '✅' : '⏳'} ${task.title} (${task.plants?.name || 'No plant'})`)
      }
    }
    console.log()

    // 6. Check logbook entries per garden
    console.log('📖 LOGBOOK ENTRIES PER GARDEN:')
    for (const garden of gardens || []) {
      const { data: entries } = await supabase
        .from('logbook_entries')
        .select(`
          *,
          plant_beds(name, garden_id)
        `)
        .eq('plant_beds.garden_id', garden.id)
      
      console.log(`${garden.name}: ${entries?.length || 0} logbook entries`)
      
      for (const entry of entries?.slice(0, 2) || []) {
        console.log(`  - ${entry.entry_date}: ${entry.notes.substring(0, 50)}...`)
      }
    }
    console.log()

    // 7. Test specific user access (amerik.rijn@gmail.com)
    console.log('🔍 TESTING AMERIK.RIJN@GMAIL.COM ACCESS:')
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
      .single()
    
    if (testUser) {
      console.log('User found:', testUser.email, testUser.role)
      
      const { data: userAccess } = await supabase
        .from('user_garden_access')
        .select('garden_id, gardens(name)')
        .eq('user_id', testUser.id)
      
      console.log('Garden access:', userAccess?.map(a => a.gardens.name).join(', ') || 'None')
      
      if (userAccess?.length > 0) {
        const gardenIds = userAccess.map(a => a.garden_id)
        
        // Test tasks query for this user
        const { data: userTasks } = await supabase
          .from('tasks')
          .select(`
            *,
            plants(name, plant_beds(name, garden_id, gardens(name)))
          `)
          .in('plants.plant_beds.garden_id', gardenIds)
        
        console.log('Tasks accessible to user:', userTasks?.length || 0)
        console.log('Completed tasks:', userTasks?.filter(t => t.completed).length || 0)
        console.log('Pending tasks:', userTasks?.filter(t => !t.completed).length || 0)
        
        // Test logbook query for this user
        const { data: userLogbook } = await supabase
          .from('logbook_entries')
          .select(`
            *,
            plant_beds(name, garden_id, gardens(name))
          `)
          .in('plant_beds.garden_id', gardenIds)
        
        console.log('Logbook entries accessible to user:', userLogbook?.length || 0)
      }
    } else {
      console.log('❌ User amerik.rijn@gmail.com not found!')
    }

  } catch (error) {
    console.error('❌ Error debugging database:', error)
  }
}

debugDatabase()