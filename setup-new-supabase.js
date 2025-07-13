#!/usr/bin/env node

// Setup script for new Supabase database
// Run: node setup-new-supabase.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 TUINBEHEER SYSTEEM - SUPABASE SETUP');
console.log('=====================================\n');

// Get credentials from command line arguments or prompt
const args = process.argv.slice(2);
let supabaseUrl = args[0];
let supabaseKey = args[1];

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing credentials!');
  console.log('Usage: node setup-new-supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  console.log('Example: node setup-new-supabase.js https://xyz.supabase.co eyJhbGciOiJIUzI1NiIs...');
  process.exit(1);
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.log('❌ Invalid Supabase URL format!');
  console.log('Expected: https://[project-id].supabase.co');
  process.exit(1);
}

// Validate key format
if (!supabaseKey.startsWith('eyJ')) {
  console.log('❌ Invalid Supabase key format!');
  console.log('Expected: JWT token starting with "eyJ"');
  process.exit(1);
}

async function setupNewSupabase() {
  console.log('📋 Setting up new Supabase configuration...\n');

  // Step 1: Create/Update .env.local
  console.log('1. Creating .env.local file...');
  const envContent = `# Tuinbeheer Systeem - Supabase Configuration
# Generated: ${new Date().toISOString()}

# Primary Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Custom/Backup credentials (workaround for Vercel issues)
CUSTOM_SUPABASE_URL=${supabaseUrl}
CUSTOM_SUPABASE_ANON_KEY=${supabaseKey}

# Development settings
NODE_ENV=development
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('   ✅ .env.local created');

  // Step 2: Update test-connection.js with new credentials
  console.log('2. Updating test-connection.js...');
  const testConnectionContent = `// Simple Supabase connection test
// Run: node test-connection.js
// Auto-generated: ${new Date().toISOString()}

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing New Supabase Connection...\\n');

  // Use new credentials
  const supabaseUrl = '${supabaseUrl}';
  const supabaseKey = '${supabaseKey}';

  console.log('1. Environment Check:');
  console.log(\`   URL: \${supabaseUrl}\`);
  console.log(\`   Key: \${supabaseKey.substring(0, 20)}...\`);
  console.log('');

  // Create client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Basic connection
    console.log('2. Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(\`   ❌ Auth error: \${authError.message}\`);
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
      console.log(\`   ❌ Database error: \${error.message}\`);
      console.log('   ℹ️  This is expected if tables are not created yet');
      return false;
    } else {
      console.log('   ✅ Database query successful');
      console.log(\`   Result: \${JSON.stringify(data, null, 2)}\`);
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
          console.log(\`   ❌ \${table}: \${error.message}\`);
          tablesExist = false;
        } else {
          console.log(\`   ✅ \${table}: accessible (\${data?.length || 0} records)\`);
        }
      } catch (err) {
        console.log(\`   ❌ \${table}: \${err.message}\`);
        tablesExist = false;
      }
    }

    if (!tablesExist) {
      console.log('\\n📝 Next steps:');
      console.log('   1. Go to Supabase SQL Editor');
      console.log('   2. Run the database_setup.sql script');
      console.log('   3. Insert test data');
      console.log('   4. Run this test again');
    }

    return tablesExist;

  } catch (error) {
    console.log(\`❌ Connection failed: \${error.message}\`);
    return false;
  }
}

testConnection()
  .then(success => {
    console.log('\\n🏁 Test complete!');
    if (success) {
      console.log('🎉 All tests passed! Database is ready.');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
    }
  })
  .catch(console.error);
`;

  fs.writeFileSync('test-connection.js', testConnectionContent);
  console.log('   ✅ test-connection.js updated');

  // Step 3: Test the connection
  console.log('3. Testing connection to new database...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`   ❌ Auth test failed: ${authError.message}`);
      return false;
    } else {
      console.log('   ✅ Auth connection successful');
    }

    // Test database access
    const { data, error } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ⚠️  Database query failed: ${error.message}`);
      console.log('   ℹ️  This is expected if tables are not created yet');
      console.log('   📝 Next: Run database_setup.sql in Supabase SQL Editor');
    } else {
      console.log('   ✅ Database query successful');
      console.log(`   📊 Gardens count: ${JSON.stringify(data, null, 2)}`);
    }

  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return false;
  }

  // Step 4: Show next steps
  console.log('\n📋 SETUP COMPLETE!');
  console.log('==================\n');
  
  console.log('✅ Configuration files updated:');
  console.log('   - .env.local');
  console.log('   - test-connection.js');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Go to Supabase SQL Editor');
  console.log('2. Copy and paste the FULL content of database_setup.sql');
  console.log('3. Run the script to create tables');
  console.log('4. Test connection: node test-connection.js');
  console.log('5. Test app locally: npm run dev');
  console.log('6. Update Vercel environment variables');
  console.log('7. Deploy to production');
  
  console.log('\n📝 Vercel Environment Variables:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`);
  console.log(`   CUSTOM_SUPABASE_URL=${supabaseUrl}`);
  console.log(`   CUSTOM_SUPABASE_ANON_KEY=${supabaseKey}`);
  
  console.log('\n🎯 Success! Ready to rebuild the database.');
  
  return true;
}

setupNewSupabase().catch(console.error);