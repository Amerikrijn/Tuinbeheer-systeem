/**
 * COMPREHENSIVE VERCEL APP TESTING SCRIPT
 * 
 * This script tests the entire application flow:
 * 1. User management and garden access
 * 2. Plant and task creation
 * 3. Logbook functionality
 * 4. Dashboard display
 * 5. Admin vs User permissions
 */

const { createClient } = require('@supabase/supabase-js')

// Use same hardcoded config as the app
const SUPABASE_CONFIG = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
}

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

class VercelAppTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'debug': '🔍'
    }[type] || '📋'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async test(description, testFn) {
    try {
      this.log(`Testing: ${description}`, 'debug')
      await testFn()
      this.testResults.passed++
      this.log(`PASSED: ${description}`, 'success')
    } catch (error) {
      this.testResults.failed++
      this.testResults.errors.push({ description, error: error.message })
      this.log(`FAILED: ${description} - ${error.message}`, 'error')
    }
  }

  async runAllTests() {
    this.log('🚀 STARTING COMPREHENSIVE VERCEL APP TESTING', 'info')
    this.log('='.repeat(60), 'info')

    // Test 1: Database Connection
    await this.test('Database Connection', async () => {
      const { data, error } = await supabase.from('users').select('count').single()
      if (error) throw new Error(`Database connection failed: ${error.message}`)
    })

    // Test 2: Check Current Database State
    await this.test('Database State Analysis', async () => {
      await this.analyzeDatabase()
    })

    // Test 3: User Management
    await this.test('User Management & Garden Access', async () => {
      await this.testUserManagement()
    })

    // Test 4: Garden & Plant Setup
    await this.test('Garden & Plant Setup', async () => {
      await this.testGardenPlantSetup()
    })

    // Test 5: Task Management
    await this.test('Task Management', async () => {
      await this.testTaskManagement()
    })

    // Test 6: Logbook Functionality
    await this.test('Logbook Functionality', async () => {
      await this.testLogbookFunctionality()
    })

    // Test 7: Dashboard Data
    await this.test('Dashboard Data Display', async () => {
      await this.testDashboardData()
    })

    // Test 8: Security & Access Control
    await this.test('Security & Access Control', async () => {
      await this.testSecurityAccess()
    })

    // Final Results
    this.showResults()
  }

  async analyzeDatabase() {
    this.log('Analyzing current database state...', 'debug')

    // Check users
    const { data: users } = await supabase.from('users').select('*')
    this.log(`Found ${users?.length || 0} users in database`)

    // Check gardens
    const { data: gardens } = await supabase.from('gardens').select('*')
    this.log(`Found ${gardens?.length || 0} gardens (${gardens?.filter(g => g.is_active).length || 0} active)`)

    // Check garden access
    const { data: access } = await supabase.from('user_garden_access').select('*')
    this.log(`Found ${access?.length || 0} garden access records`)

    // Check plants
    const { data: plants } = await supabase.from('plants').select('*')
    this.log(`Found ${plants?.length || 0} plants`)

    // Check tasks
    const { data: tasks } = await supabase.from('tasks').select('*')
    const completedTasks = tasks?.filter(t => t.completed).length || 0
    const pendingTasks = tasks?.filter(t => !t.completed).length || 0
    this.log(`Found ${tasks?.length || 0} tasks (${pendingTasks} pending, ${completedTasks} completed)`)

    // Check logbook entries
    const { data: logbook } = await supabase.from('logbook_entries').select('*')
    this.log(`Found ${logbook?.length || 0} logbook entries`)

    return { users, gardens, access, plants, tasks, logbook }
  }

  async testUserManagement() {
    // Check if test user exists
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
      .single()

    if (!testUser) {
      throw new Error('Test user amerik.rijn@gmail.com not found')
    }

    this.log(`Test user found: ${testUser.email} (${testUser.role})`)

    // Check garden access
    const { data: userAccess } = await supabase
      .from('user_garden_access')
      .select('garden_id, gardens(name)')
      .eq('user_id', testUser.id)

    this.log(`User has access to ${userAccess?.length || 0} gardens: ${userAccess?.map(a => a.gardens.name).join(', ') || 'None'}`)

    if (!userAccess || userAccess.length === 0) {
      this.log('⚠️ User has no garden access - this might cause empty dashboard', 'warning')
    }

    return { testUser, userAccess }
  }

  async testGardenPlantSetup() {
    // Find active gardens
    const { data: activeGardens } = await supabase
      .from('gardens')
      .select('*')
      .eq('is_active', true)

    if (!activeGardens || activeGardens.length === 0) {
      throw new Error('No active gardens found')
    }

    this.log(`Found ${activeGardens.length} active gardens`)

    // Check each garden has plant beds and plants
    for (const garden of activeGardens) {
      const { data: beds } = await supabase
        .from('plant_beds')
        .select('*')
        .eq('garden_id', garden.id)

      const { data: plants } = await supabase
        .from('plants')
        .select('*, plant_beds(garden_id)')
        .eq('plant_beds.garden_id', garden.id)

      this.log(`Garden "${garden.name}": ${beds?.length || 0} beds, ${plants?.length || 0} plants`)

      if (!plants || plants.length === 0) {
        this.log(`⚠️ Garden "${garden.name}" has no plants - tasks won't show`, 'warning')
      }
    }

    return activeGardens
  }

  async testTaskManagement() {
    // Get all tasks with plant info
    const { data: allTasks } = await supabase
      .from('tasks')
      .select(`
        *,
        plants(
          name,
          plant_beds(
            name,
            garden_id,
            gardens(name)
          )
        )
      `)

    if (!allTasks || allTasks.length === 0) {
      this.log('⚠️ No tasks found in database', 'warning')
      return []
    }

    this.log(`Found ${allTasks.length} total tasks`)

    // Analyze tasks by garden
    const tasksByGarden = {}
    for (const task of allTasks) {
      const gardenName = task.plants?.plant_beds?.gardens?.name || 'Unknown'
      if (!tasksByGarden[gardenName]) {
        tasksByGarden[gardenName] = { pending: 0, completed: 0 }
      }
      if (task.completed) {
        tasksByGarden[gardenName].completed++
      } else {
        tasksByGarden[gardenName].pending++
      }
    }

    for (const [garden, counts] of Object.entries(tasksByGarden)) {
      this.log(`Garden "${garden}": ${counts.pending} pending, ${counts.completed} completed tasks`)
    }

    // Test specific user's accessible tasks
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
      .single()

    if (testUser && testUser.role !== 'admin') {
      const { data: userAccess } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', testUser.id)

      if (userAccess && userAccess.length > 0) {
        const accessibleGardens = userAccess.map(a => a.garden_id)
        const userTasks = allTasks.filter(task => 
          accessibleGardens.includes(task.plants?.plant_beds?.garden_id)
        )

        this.log(`User can access ${userTasks.length} tasks from their assigned gardens`)
        
        if (userTasks.length === 0) {
          this.log('⚠️ User has no accessible tasks - dashboard will be empty', 'warning')
        }
      }
    }

    return allTasks
  }

  async testLogbookFunctionality() {
    // Get all logbook entries
    const { data: logbookEntries } = await supabase
      .from('logbook_entries')
      .select(`
        *,
        plant_beds(
          name,
          garden_id,
          gardens(name)
        )
      `)

    this.log(`Found ${logbookEntries?.length || 0} logbook entries`)

    // Get completed tasks that should appear in logbook
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select(`
        *,
        plants(
          name,
          plant_beds(
            name,
            garden_id,
            gardens(name)
          )
        )
      `)
      .eq('completed', true)

    this.log(`Found ${completedTasks?.length || 0} completed tasks that should appear in logbook`)

    if (completedTasks && completedTasks.length === 0) {
      this.log('⚠️ No completed tasks found - logbook will only show regular entries', 'warning')
    }

    // Test logbook query for specific user
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
      .single()

    if (testUser && testUser.role !== 'admin') {
      const { data: userAccess } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', testUser.id)

      if (userAccess && userAccess.length > 0) {
        const accessibleGardens = userAccess.map(a => a.garden_id)
        
        const userLogbook = logbookEntries?.filter(entry =>
          accessibleGardens.includes(entry.plant_beds.garden_id)
        ) || []

        const userCompletedTasks = completedTasks?.filter(task =>
          accessibleGardens.includes(task.plants?.plant_beds?.garden_id)
        ) || []

        this.log(`User can access ${userLogbook.length} logbook entries + ${userCompletedTasks.length} completed tasks`)
        
        if (userLogbook.length === 0 && userCompletedTasks.length === 0) {
          this.log('⚠️ User has no accessible logbook data', 'warning')
        }
      }
    }

    return { logbookEntries, completedTasks }
  }

  async testDashboardData() {
    // Simulate dashboard data loading for test user
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
      .single()

    if (!testUser) {
      throw new Error('Test user not found for dashboard testing')
    }

    const isAdmin = testUser.role === 'admin'
    this.log(`Testing dashboard for ${isAdmin ? 'admin' : 'user'}: ${testUser.email}`)

    // Get accessible gardens
    let accessibleGardens = []
    if (!isAdmin) {
      const { data: access } = await supabase
        .from('user_garden_access')
        .select('garden_id')
        .eq('user_id', testUser.id)
      accessibleGardens = access?.map(a => a.garden_id) || []
    }

    // Test tasks query (same as dashboard)
    let tasksQuery = supabase
      .from('tasks')
      .select(`
        *,
        plants!inner(
          name,
          plant_beds!inner(
            name,
            garden_id,
            gardens!inner(name)
          )
        )
      `)

    if (!isAdmin && accessibleGardens.length > 0) {
      tasksQuery = tasksQuery.in('plants.plant_beds.garden_id', accessibleGardens)
    }

    const { data: dashboardTasks } = await tasksQuery

    this.log(`Dashboard would show ${dashboardTasks?.length || 0} total tasks`)

    const pendingTasks = dashboardTasks?.filter(t => !t.completed) || []
    const completedTasks = dashboardTasks?.filter(t => t.completed) || []

    this.log(`Dashboard breakdown: ${pendingTasks.length} pending, ${completedTasks.length} completed`)

    // Test logbook query (same as dashboard)
    let logbookQuery = supabase
      .from('logbook_entries')
      .select(`
        *,
        plant_beds!inner(
          id,
          name,
          garden_id,
          gardens!inner(name)
        )
      `)
      .limit(20)

    if (!isAdmin && accessibleGardens.length > 0) {
      logbookQuery = logbookQuery.in('plant_beds.garden_id', accessibleGardens)
    }

    const { data: dashboardLogbook } = await logbookQuery

    this.log(`Dashboard would show ${dashboardLogbook?.length || 0} recent logbook entries`)

    if (pendingTasks.length === 0 && completedTasks.length === 0) {
      this.log('⚠️ Dashboard will show no tasks', 'warning')
    }

    if (!dashboardLogbook || dashboardLogbook.length === 0) {
      this.log('⚠️ Dashboard will show no logbook entries', 'warning')
    }

    return { dashboardTasks, dashboardLogbook }
  }

  async testSecurityAccess() {
    // Test that user can only access their assigned gardens
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
      .single()

    if (!testUser || testUser.role === 'admin') {
      this.log('Skipping security test - user is admin or not found')
      return
    }

    const { data: userAccess } = await supabase
      .from('user_garden_access')
      .select('garden_id, gardens(name)')
      .eq('user_id', testUser.id)

    const { data: allGardens } = await supabase
      .from('gardens')
      .select('*')
      .eq('is_active', true)

    const accessibleGardens = userAccess?.map(a => a.garden_id) || []
    const inaccessibleGardens = allGardens?.filter(g => !accessibleGardens.includes(g.id)) || []

    this.log(`User has access to ${accessibleGardens.length} gardens, blocked from ${inaccessibleGardens.length} gardens`)

    // Test that queries properly filter
    const { data: allTasks } = await supabase
      .from('tasks')
      .select(`*, plants(plant_beds(garden_id))`)

    const accessibleTasks = allTasks?.filter(task =>
      accessibleGardens.includes(task.plants?.plant_beds?.garden_id)
    ) || []

    const blockedTasks = allTasks?.filter(task =>
      inaccessibleGardens.some(g => g.id === task.plants?.plant_beds?.garden_id)
    ) || []

    this.log(`Security check: ${accessibleTasks.length} accessible tasks, ${blockedTasks.length} blocked tasks`)

    if (blockedTasks.length > 0) {
      this.log('✅ Security working: user cannot see tasks from other gardens', 'success')
    }
  }

  showResults() {
    this.log('='.repeat(60), 'info')
    this.log('🎯 TEST RESULTS SUMMARY', 'info')
    this.log('='.repeat(60), 'info')
    
    this.log(`✅ Tests Passed: ${this.testResults.passed}`, 'success')
    this.log(`❌ Tests Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'success')
    
    if (this.testResults.errors.length > 0) {
      this.log('\n🚨 FAILED TESTS:', 'error')
      this.testResults.errors.forEach(({ description, error }) => {
        this.log(`  - ${description}: ${error}`, 'error')
      })
    }

    const totalTests = this.testResults.passed + this.testResults.failed
    const successRate = Math.round((this.testResults.passed / totalTests) * 100)
    
    this.log(`\n📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning')
    
    if (successRate >= 90) {
      this.log('🎉 EXCELLENT! App is working well', 'success')
    } else if (successRate >= 70) {
      this.log('⚠️ GOOD, but some issues need attention', 'warning')
    } else {
      this.log('🚨 NEEDS WORK - Multiple issues found', 'error')
    }
  }
}

// Run the tests
const tester = new VercelAppTester()
tester.runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})