// Simple Supabase connection test
// Run: node test-connection.js
// Auto-generated: 2025-07-15T22:34:12.593Z

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing New Supabase Connection...\n');

  // Use new credentials
  const supabaseUrl = 'https://dwsgwqosmihsfaxuheji.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE';

  console.log('1. Environment Check:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');

  // Create client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Basic connection
    console.log('2. Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`   ❌ Auth error: ${authError.message}`);
      return false;
    } else {
      console.log('   ✅ Auth connection successful');
    }

    // Test 2: Database access
    console.log('3. Testing database access...');
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ❌ Database error: ${error.message}`);
      console.log('   ℹ️  This is expected if tables are not created yet');
      return false;
    } else {
      console.log('   ✅ Database query successful');
      console.log(`   Result: ${JSON.stringify(data, null, 2)}`);
    }

    // Test 3: Check if tables exist
    console.log('4. Testing table access...');
    const tables = ['gardens', 'plant_beds', 'plants'];
    let tablesExist = true;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
          tablesExist = false;
        } else {
          console.log(`   ✅ ${table}: accessible (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
        tablesExist = false;
      }
    }

    if (!tablesExist) {
      console.log('\n📝 Next steps:');
      console.log('   1. Go to Supabase SQL Editor');
      console.log('   2. Run the database_setup.sql script');
      console.log('   3. Insert test data');
      console.log('   4. Run this test again');
    }

    return tablesExist;

  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

testConnection()
  .then(success => {
    console.log('\n🏁 Test complete!');
    if (success) {
      console.log('🎉 All tests passed! Database is ready.');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
    }
  })
  .catch(console.error);
