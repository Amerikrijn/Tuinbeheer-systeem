#!/usr/bin/env node

/**
 * Email Configuration Checker for Tuinbeheer Systeem
 * This script checks if email notifications are properly configured in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Import configuration
const config = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
};

const supabase = createClient(config.url, config.anonKey);

async function checkEmailConfiguration() {
  console.log('🔍 Checking Supabase Email Configuration...\n');
  
  try {
    // Test 1: Check Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('gardens')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Supabase connection failed:', testError.message);
      return;
    }
    console.log('✅ Supabase connection successful');
    
    // Test 2: Check if we can access auth settings (this will fail with anon key, but shows if auth is working)
    console.log('\n2. Testing auth service...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError && !userError.message.includes('JWT')) {
      console.log('❌ Auth service error:', userError.message);
    } else {
      console.log('✅ Auth service is accessible');
    }
    
    // Test 3: Try to get current session
    console.log('\n3. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ Active session found for:', session.user.email);
    } else {
      console.log('ℹ️  No active session (expected for diagnostic script)');
    }
    
    // Test 4: Show configuration details
    console.log('\n4. Configuration details:');
    console.log(`   Supabase URL: ${config.url}`);
    console.log(`   Project ID: ${config.url.split('//')[1].split('.')[0]}`);
    console.log(`   Anon Key: ${config.anonKey.substring(0, 20)}...`);
    
    // Test 5: Email configuration recommendations
    console.log('\n5. Email Configuration Checklist:');
    console.log('   📧 Check these settings in your Supabase Dashboard:');
    console.log('   🔗 https://app.supabase.com/project/' + config.url.split('//')[1].split('.')[0]);
    console.log('\n   Authentication > Settings:');
    console.log('   ✓ Enable email confirmations: ON');
    console.log('   ✓ Enable email change confirmations: ON');
    console.log('   ✓ Enable secure email change: ON');
    console.log('\n   Authentication > URL Configuration:');
    console.log('   ✓ Add redirect URL: http://localhost:3000/auth/accept-invite');
    console.log('   ✓ Add redirect URL: https://your-domain.com/auth/accept-invite');
    console.log('\n   Authentication > Email Templates:');
    console.log('   ✓ Customize "Confirm signup" template');
    console.log('   ✓ Set proper subject and body');
    console.log('   ✓ Use {{ .ConfirmationURL }} in template');
    
    // Test 6: Common issues
    console.log('\n6. Common Email Issues:');
    console.log('   🚫 Rate limiting: Max 30 emails per hour in development');
    console.log('   🚫 Spam folder: Check recipient\'s spam/junk folder');
    console.log('   🚫 Email provider: Some providers block Supabase emails');
    console.log('   🚫 Template errors: Malformed email templates prevent sending');
    
    console.log('\n✅ Diagnostic complete. Check Supabase dashboard for email settings.');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Test email sending function
async function testEmailSending(testEmail = 'test@example.com') {
  console.log(`\n🧪 Testing email sending to: ${testEmail}`);
  console.log('⚠️  This will create a test user - use a real email to receive the confirmation');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TempPassword123!',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/accept-invite',
        data: {
          full_name: 'Test User',
          role: 'user',
          test_invitation: true
        }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️  User already exists - this is expected for test email');
        return;
      }
      console.log('❌ Email test failed:', error.message);
      return;
    }
    
    if (data.user) {
      console.log('✅ Test user created:', data.user.id);
      console.log('📧 Confirmation email should be sent to:', testEmail);
      console.log('⏱️  Check your email within 5 minutes');
    }
    
  } catch (error) {
    console.log('❌ Email test error:', error.message);
  }
}

// Main execution
async function main() {
  await checkEmailConfiguration();
  
  // Ask if user wants to test email sending
  const args = process.argv.slice(2);
  if (args.includes('--test-email')) {
    const email = args[args.indexOf('--test-email') + 1];
    if (email && email.includes('@')) {
      await testEmailSending(email);
    } else {
      console.log('\n❌ Please provide a valid email address after --test-email');
      console.log('Example: node check-email-config.js --test-email your@email.com');
    }
  } else {
    console.log('\n💡 To test email sending, run:');
    console.log('   node check-email-config.js --test-email your@email.com');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkEmailConfiguration, testEmailSending };