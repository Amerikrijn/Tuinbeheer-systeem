/**
 * QUICK TEST DATA SETUP SCRIPT
 * 
 * Populates the database with minimal test data to test:
 * - User accounts and garden access
 * - Plants and tasks
 * - Logbook entries
 * - Completed tasks
 */

const { createClient } = require('@supabase/supabase-js')

// Use same hardcoded config as the app
const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

class TestDataSetup {
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || '📋'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async setupTestData() {
    this.log('🚀 SETTING UP TEST DATA FOR VERCEL APP', 'info')
    this.log('='.repeat(50), 'info')

    try {
      // Step 1: Create gardens (check if exists first)
      const gardens = await this.createGardens()
      
      // Step 2: Create plant beds
      const plantBeds = await this.createPlantBeds(gardens)
      
      // Step 3: Create plants
      const plants = await this.createPlants(plantBeds)
      
      // Step 4: Create users
      const users = await this.createUsers()
      
      // Step 5: Assign garden access
      await this.assignGardenAccess(users, gardens)
      
      // Step 6: Create tasks
      const tasks = await this.createTasks(plants)
      
      // Step 7: Complete some tasks
      await this.completeTasks(tasks)
      
      // Step 8: Create logbook entries
      await this.createLogbookEntries(plantBeds)
      
      this.log('🎉 TEST DATA SETUP COMPLETE!', 'success')
      this.log('='.repeat(50), 'info')
      
      // Summary
      await this.showSummary()
      
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error')
      throw error
    }
  }

  async createGardens() {
    this.log('Creating gardens...', 'info')
    
    // Check if gardens already exist
    const { data: existingGardens } = await supabase.from('gardens').select('*')
    
    if (existingGardens && existingGardens.length > 0) {
      this.log(`Found ${existingGardens.length} existing gardens`, 'info')
      return existingGardens
    }

    const gardens = [
      {
        name: 'Tuin Jeanette',
        description: 'Test tuin voor gebruiker Jeanette',
        location: 'Achtertuin',
        is_active: true
      },
      {
        name: 'Tuin test Amerik',
        description: 'Test tuin voor Amerik',
        location: 'Voortuin',
        is_active: true
      }
    ]

    const { data: createdGardens, error } = await supabase
      .from('gardens')
      .insert(gardens)
      .select()

    if (error) throw error

    this.log(`Created ${createdGardens.length} gardens`, 'success')
    return createdGardens
  }

  async createPlantBeds(gardens) {
    this.log('Creating plant beds...', 'info')

    // Check if plant beds already exist
    const { data: existingBeds } = await supabase
      .from('plant_beds')
      .select('*')

    if (existingBeds && existingBeds.length > 0) {
      this.log(`Found ${existingBeds.length} existing plant beds`, 'info')
      return existingBeds
    }

    const plantBeds = []
    
    for (const garden of gardens) {
      const beds = [
        {
          garden_id: garden.id,
          name: `Bed 1 - ${garden.name}`,
          location: 'Links',
          size: '2x3m',
          soil_type: 'Klei',
          sun_exposure: 'full-sun',
          description: 'Test plantvak 1'
        },
        {
          garden_id: garden.id,
          name: `Bed 2 - ${garden.name}`,
          location: 'Rechts',
          size: '1.5x2m',
          soil_type: 'Zand',
          sun_exposure: 'partial-sun',
          description: 'Test plantvak 2'
        }
      ]
      plantBeds.push(...beds)
    }

    const { data: createdBeds, error } = await supabase
      .from('plant_beds')
      .insert(plantBeds)
      .select()

    if (error) {
      this.log(`Error creating plant beds: ${error.message}`, 'error')
      this.log(`Error details: ${JSON.stringify(error, null, 2)}`, 'error')
      throw error
    }

    this.log(`Created ${createdBeds.length} plant beds`, 'success')
    return createdBeds
  }

  async createPlants(plantBeds) {
    this.log('Creating plants...', 'info')

    const plants = []
    
    for (const bed of plantBeds) {
      const bedPlants = [
        {
          plant_bed_id: bed.id,
          name: 'Tomaten',
          variety: 'Cherry tomaten',
          color: 'Rood',
          status: 'gezond',
          planting_date: '2024-03-15'
        },
        {
          plant_bed_id: bed.id,
          name: 'Basilicum',
          variety: 'Genovese',
          color: 'Groen',
          status: 'gezond',
          planting_date: '2024-03-20'
        },
        {
          plant_bed_id: bed.id,
          name: 'Sla',
          variety: 'Ijsbergsla',
          color: 'Groen',
          status: 'aandacht_nodig',
          planting_date: '2024-04-01'
        }
      ]
      plants.push(...bedPlants)
    }

    const { data: createdPlants, error } = await supabase
      .from('plants')
      .insert(plants)
      .select()

    if (error) throw error

    this.log(`Created ${createdPlants.length} plants`, 'success')
    return createdPlants
  }

  async createUsers() {
    this.log('Creating users...', 'info')

    const users = [
      {
        email: 'amerik.rijn@gmail.com',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        email: 'admin@test.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const { data: createdUsers, error } = await supabase
      .from('users')
      .insert(users)
      .select()

    if (error) throw error

    this.log(`Created ${createdUsers.length} users`, 'success')
    return createdUsers
  }

  async assignGardenAccess(users, gardens) {
    this.log('Assigning garden access...', 'info')

    const testUser = users.find(u => u.email === 'amerik.rijn@gmail.com')
    const jeanetteGarden = gardens.find(g => g.name === 'Tuin Jeanette')

    if (testUser && jeanetteGarden) {
      const { error } = await supabase
        .from('user_garden_access')
        .insert({
          user_id: testUser.id,
          garden_id: jeanetteGarden.id,
          granted_at: new Date().toISOString()
        })

      if (error) throw error

      this.log(`Assigned ${testUser.email} access to ${jeanetteGarden.name}`, 'success')
    }
  }

  async createTasks(plants) {
    this.log('Creating tasks...', 'info')

    const now = new Date()
    const tasks = []

    for (const plant of plants.slice(0, 6)) { // Create tasks for first 6 plants
      // Create some pending tasks
      tasks.push({
        plant_id: plant.id,
        title: `Water ${plant.name}`,
        description: 'Dagelijks water geven',
        due_date: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random within 7 days
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        completed: false
      })

      // Create some overdue tasks
      if (Math.random() > 0.5) {
        tasks.push({
          plant_id: plant.id,
          title: `Bemesten ${plant.name}`,
          description: 'Organische bemesting toevoegen',
          due_date: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random 1-5 days ago
          priority: 'high',
          completed: false
        })
      }

      // Create some completed tasks
      if (Math.random() > 0.3) {
        tasks.push({
          plant_id: plant.id,
          title: `Snoeien ${plant.name}`,
          description: 'Dode bladeren wegknippen',
          due_date: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random 1-10 days ago
          priority: 'medium',
          completed: true,
          updated_at: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() // Completed 1-3 days ago
        })
      }
    }

    const { data: createdTasks, error } = await supabase
      .from('tasks')
      .insert(tasks)
      .select()

    if (error) throw error

    this.log(`Created ${createdTasks.length} tasks`, 'success')
    return createdTasks
  }

  async completeTasks(tasks) {
    this.log('Completing some additional tasks...', 'info')

    // Mark some pending tasks as completed
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 2)
    
    for (const task of pendingTasks) {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)

      if (error) throw error
    }

    this.log(`Completed ${pendingTasks.length} additional tasks`, 'success')
  }

  async createLogbookEntries(plantBeds) {
    this.log('Creating logbook entries...', 'info')

    const entries = []
    const now = new Date()

    for (const bed of plantBeds.slice(0, 3)) { // Create entries for first 3 beds
      for (let i = 0; i < 3; i++) {
        entries.push({
          plant_bed_id: bed.id,
          entry_date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 3 days
          notes: `Logboek entry ${i + 1} voor ${bed.name}. Planten zien er goed uit, regelmatig water gegeven.`,
          photo_url: null
        })
      }
    }

    const { data: createdEntries, error } = await supabase
      .from('logbook_entries')
      .insert(entries)
      .select()

    if (error) throw error

    this.log(`Created ${createdEntries.length} logbook entries`, 'success')
  }

  async showSummary() {
    this.log('📊 DATABASE SUMMARY:', 'info')

    const { data: users } = await supabase.from('users').select('*')
    const { data: gardens } = await supabase.from('gardens').select('*')
    const { data: plants } = await supabase.from('plants').select('*')
    const { data: tasks } = await supabase.from('tasks').select('*')
    const { data: logbook } = await supabase.from('logbook_entries').select('*')
    const { data: access } = await supabase.from('user_garden_access').select('*')

    this.log(`👥 Users: ${users?.length || 0}`, 'info')
    this.log(`🏡 Gardens: ${gardens?.length || 0}`, 'info')
    this.log(`🌿 Plants: ${plants?.length || 0}`, 'info')
    this.log(`📋 Tasks: ${tasks?.length || 0} (${tasks?.filter(t => !t.completed).length || 0} pending, ${tasks?.filter(t => t.completed).length || 0} completed)`, 'info')
    this.log(`📖 Logbook entries: ${logbook?.length || 0}`, 'info')
    this.log(`🔑 Garden access records: ${access?.length || 0}`, 'info')

    this.log('', 'info')
    this.log('🔑 LOGIN CREDENTIALS:', 'info')
    this.log('Email: amerik.rijn@gmail.com', 'info')
    this.log('Password: SimplePass123!', 'info')
    this.log('', 'info')
    this.log('✅ Ready to test the app!', 'success')
  }
}

// Run the setup
const setup = new TestDataSetup()
setup.setupTestData().catch(error => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})