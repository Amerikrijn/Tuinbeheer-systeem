// Simple Supabase connection test
// Run: node test-connection.js

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Test environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrotadbmnkhhwhshijdy.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb3RhZGJtbmtoaHdoc2hpamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzAzMTQsImV4cCI6MjA2ODAwNjMxNH0.S7lxECMVvsQAO6sqp_fInc8PXJXWGlg7_3XYn17z9ZQ';

  console.log('1. Environment Check:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!');
    return;
  }

  // Create client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Basic connection
    console.log('2. Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`   ❌ Auth error: ${authError.message}`);
    } else {
      console.log('   ✅ Auth connection successful');
    }

    // Test 2: Simple query
    console.log('3. Testing simple query...');
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ❌ Query error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log('   ✅ Query successful');
      console.log(`   Result: ${JSON.stringify(data, null, 2)}`);
    }

    // Test 3: Check if tables exist
    console.log('4. Testing table access...');
    const tables = ['gardens', 'plant_beds', 'plants'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: accessible (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log(`Full error: ${JSON.stringify(error, null, 2)}`);
  }

  console.log('\n🏁 Test complete!');
}

testConnection().catch(console.error);