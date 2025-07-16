// Detailed Supabase connection test
// Run: node test-connection-detailed.js

const { createClient } = require('@supabase/supabase-js');

async function testConnectionDetailed() {
  console.log('🔍 Detailed Supabase Connection Test...\n');

  const supabaseUrl = 'https://nrdgfiotsgnzvzsmylne.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY';

  console.log('1. Creating Supabase client...');
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

    // Test 2: List all tables
    console.log('3. Testing table access...');
    const tables = ['gardens', 'plant_beds', 'plants'];
    
    for (const table of tables) {
      console.log(`\n   Testing table: ${table}`);
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          console.log(`   Code: ${error.code}`);
          console.log(`   Details: ${error.details}`);
        } else {
          console.log(`   ✅ Success: ${data?.length || 0} records found`);
          if (data && data.length > 0) {
            console.log(`   Sample data: ${JSON.stringify(data[0], null, 2)}`);
          }
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        console.log(`   Stack: ${err.stack}`);
      }
    }

    // Test 3: Try a simple count query
    console.log('\n4. Testing count queries...');
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.log(`   ❌ ${table} count error: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: ${count} records`);
        }
      } catch (err) {
        console.log(`   ❌ ${table} count exception: ${err.message}`);
      }
    }

    return true;

  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
    return false;
  }
}

testConnectionDetailed()
  .then(success => {
    console.log('\n🏁 Detailed test complete!');
    if (success) {
      console.log('🎉 Connection is working!');
    } else {
      console.log('⚠️  Some issues detected.');
    }
  })
  .catch(console.error);