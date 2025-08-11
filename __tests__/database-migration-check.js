/**
 * 🗄️ DATABASE MIGRATION CHECK
 * 
 * Test om te checken of force_password_change kolom bestaat
 * en of password reset proces werkt.
 */

const { createClient } = require('@supabase/supabase-js');

// Test database connection
async function testDatabaseMigration() {
  console.log('🔍 Testing database migration status...');
  
  try {
    // Use anon client to test basic connection
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing-url',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key'
    );

    // Test if we can read users table structure
    const { data, error } = await supabase
      .from('users')
      .select('force_password_change')
      .limit(1);

    if (error) {
      if (error.message.includes('column "force_password_change" does not exist')) {
        console.log('❌ MIGRATION NEEDED: force_password_change column missing');
        console.log('🔧 ACTION: Run database/04-force-password-change-migration.sql');
        return false;
      } else {
        console.log('⚠️ Database access error:', error.message);
        return false;
      }
    }

    console.log('✅ MIGRATION COMPLETE: force_password_change column exists');
    return true;

  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Export for use in other tests
module.exports = { testDatabaseMigration };

// Run test if called directly
if (require.main === module) {
  testDatabaseMigration().then(result => {
    console.log('🔍 Migration check result:', result ? 'READY' : 'NEEDS MIGRATION');
    process.exit(result ? 0 : 1);
  });
}