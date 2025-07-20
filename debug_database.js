const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = 'https://dwsgwqosmihsfaxuheji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
  console.log('🔍 Starting database debug...');
  
  // Test 1: Check if we can connect
  try {
    console.log('\n1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('gardens').select('count').limit(1);
    if (error) {
      console.error('❌ Connection error:', error);
    } else {
      console.log('✅ Connection successful');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }

  // Test 2: Check if plant_beds table exists
  try {
    console.log('\n2️⃣ Testing plant_beds table...');
    const { data, error } = await supabase.from('plant_beds').select('*').limit(1);
    if (error) {
      console.error('❌ plant_beds table error:', error);
    } else {
      console.log('✅ plant_beds table accessible, sample data:', data);
    }
  } catch (err) {
    console.error('❌ plant_beds table failed:', err);
  }

  // Test 3: Check if gardens exist
  try {
    console.log('\n3️⃣ Testing gardens table...');
    const { data, error } = await supabase.from('gardens').select('id, name').limit(5);
    if (error) {
      console.error('❌ Gardens error:', error);
    } else {
      console.log('✅ Available gardens:', data);
    }
  } catch (err) {
    console.error('❌ Gardens failed:', err);
  }

  // Test 4: Try to create a plant bed with a known garden ID
  try {
    console.log('\n4️⃣ Testing plant bed creation...');
    
    // First get a garden ID
    const { data: gardens, error: gardenError } = await supabase
      .from('gardens')
      .select('id')
      .limit(1);
      
    if (gardenError || !gardens || gardens.length === 0) {
      console.error('❌ No gardens found for testing:', gardenError);
      return;
    }
    
    const testGardenId = gardens[0].id;
    console.log('Using garden ID for test:', testGardenId);
    
    // Try to insert a test plant bed
    const testPlantBed = {
      garden_id: testGardenId,
      name: 'DEBUG_TEST_BED',
      location: null,
      size: '1m x 1m',
      soil_type: null,
      sun_exposure: 'full-sun',
      description: null,
      is_active: true
    };
    
    console.log('Attempting to create plant bed:', testPlantBed);
    
    const { data: plantBed, error: plantBedError } = await supabase
      .from('plant_beds')
      .insert(testPlantBed)
      .select()
      .single();
      
    if (plantBedError) {
      console.error('❌ Plant bed creation failed - DETAILED ERROR:', {
        message: plantBedError.message,
        details: plantBedError.details,
        hint: plantBedError.hint,
        code: plantBedError.code,
        fullError: JSON.stringify(plantBedError, null, 2)
      });
    } else {
      console.log('✅ Plant bed created successfully:', plantBed);
      
      // Clean up - delete the test bed
      await supabase.from('plant_beds').delete().eq('id', plantBed.id);
      console.log('🧹 Test bed cleaned up');
    }
    
  } catch (err) {
    console.error('❌ Plant bed creation test failed:', err);
  }
}

debugDatabase().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(err => {
  console.error('💥 Debug script error:', err);
  process.exit(1);
});