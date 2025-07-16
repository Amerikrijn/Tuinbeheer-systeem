// Test the old Supabase URL
// Run: node test-old-url.js

const { createClient } = require('@supabase/supabase-js');

async function testOldUrl() {
  console.log('🔍 Testing Old Supabase URL...\n');

  const supabaseUrl = 'https://qrotadbmnkhhwhshijdy.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZGdmaW90c2duenZ6c215bG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzA4MTMsImV4cCI6MjA2ODAwNjgxM30.5ARPqu6X_YzHmKdHZKYf69jK2KZUrwLdPHwd3toD2BY';

  console.log(`Testing URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`   ❌ Auth error: ${authError.message}`);
      return false;
    } else {
      console.log('   ✅ Auth connection successful');
    }

    // Test database access
    console.log('2. Testing database access...');
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ❌ Database error: ${error.message}`);
    } else {
      console.log('   ✅ Database query successful');
      console.log(`   Result: ${JSON.stringify(data, null, 2)}`);
    }

    return true;

  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

testOldUrl()
  .then(success => {
    console.log('\n🏁 Test complete!');
    if (success) {
      console.log('🎉 Old URL works!');
    } else {
      console.log('⚠️  Old URL also failed.');
    }
  })
  .catch(console.error);