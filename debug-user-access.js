#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Use hardcoded config like the app does
const supabaseUrl = 'https://dwsgwqosmihsfaxuheji.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxOTk1MzcsImV4cCI6MjA0Nzc3NTUzN30.KJj0n-YZEGJVjQPJPnKTJhZB5GiGlGJSdF1qZdXxO5o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUserAccess() {
  console.log('🔍 Checking user access for amerik.rijn@gmail.com...')
  
  try {
    // 1. Check if user exists in users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amerik.rijn@gmail.com')
    
    if (usersError) {
      console.error('❌ Error fetching user:', usersError)
      return
    }
    
    console.log('👤 User data:', users)
    
    if (users.length === 0) {
      console.log('❌ User not found in users table')
      return
    }
    
    const user = users[0]
    
    // 2. Check user_garden_access table
    const { data: access, error: accessError } = await supabase
      .from('user_garden_access')
      .select(`
        *,
        gardens(id, name, is_active)
      `)
      .eq('user_id', user.id)
    
    if (accessError) {
      console.error('❌ Error fetching garden access:', accessError)
      return
    }
    
    console.log('🌱 Garden access records:', access)
    
    // 3. Check active gardens
    const { data: activeGardens, error: gardensError } = await supabase
      .from('gardens')
      .select('*')
      .eq('is_active', true)
    
    if (gardensError) {
      console.error('❌ Error fetching active gardens:', gardensError)
      return
    }
    
    console.log('🏡 Active gardens:', activeGardens)
    
    // 4. Check what garden_access array should be
    const accessibleGardenIds = access
      .filter(a => a.gardens && a.gardens.is_active)
      .map(a => a.garden_id)
    
    console.log('✅ Expected garden_access array:', accessibleGardenIds)
    
    // 5. Check if user.garden_access matches
    console.log('📋 User.garden_access in database:', user.garden_access)
    console.log('🔍 Match?', JSON.stringify(user.garden_access) === JSON.stringify(accessibleGardenIds))
    
    // 6. Check tasks for these gardens
    if (accessibleGardenIds.length > 0) {
      const { data: tasks, error: tasksError } = await supabase
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
        .in('plants.plant_beds.garden_id', accessibleGardenIds)
      
      if (tasksError) {
        console.error('❌ Error fetching tasks:', tasksError)
      } else {
        console.log('📋 Tasks found:', tasks.length)
        console.log('📋 Task details:', tasks.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          due_date: t.due_date,
          garden: t.plants.plant_beds.gardens.name
        })))
      }
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error)
  }
}

debugUserAccess()