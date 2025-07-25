const { testSupabaseConnection } = require('./packages/shared/src/supabase.ts');

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    const result = await testSupabaseConnection();
    
    if (result.success) {
      console.log('✅ Supabase connection successful!');
      console.log(`   Environment: ${result.environment}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ Supabase connection failed!');
      console.log(`   Environment: ${result.environment}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
    }
  } catch (error) {
    console.error('💥 Failed to test connection:', error.message);
  }
}

testConnection();
