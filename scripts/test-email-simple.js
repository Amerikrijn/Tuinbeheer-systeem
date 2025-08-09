#!/usr/bin/env node

/**
 * Simple Email Test for Tuinbeheer Systeem
 */

// Simple test without external dependencies
console.log('🔍 Tuinbeheer Email Configuration Checker\n');

// Configuration check
const config = {
  url: 'https://dwsgwqosmihsfaxuheji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c2d3cW9zbWloc2ZheHVoZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI3NTAsImV4cCI6MjA2ODA4ODc1MH0.Tq24K455oEOyO_bRourUQrg8-9F6HiRBjEwofEImEtE'
};

console.log('1. Configuration Check:');
console.log(`   ✅ Supabase URL: ${config.url}`);
console.log(`   ✅ Project ID: ${config.url.split('//')[1].split('.')[0]}`);
console.log(`   ✅ Anon Key: ${config.anonKey.substring(0, 20)}...`);

console.log('\n2. Email Configuration Checklist:');
console.log('   📧 Supabase Dashboard Settings to verify:');
console.log(`   🔗 https://app.supabase.com/project/${config.url.split('//')[1].split('.')[0]}`);

console.log('\n   Authentication > Settings:');
console.log('   □ Enable email confirmations: SHOULD BE ON');
console.log('   □ Enable email change confirmations: SHOULD BE ON'); 
console.log('   □ Enable secure email change: SHOULD BE ON');
console.log('   □ Disable new user signups: SHOULD BE OFF (to allow admin invites)');

console.log('\n   Authentication > URL Configuration:');
console.log('   □ Redirect URLs should include:');
console.log('     - http://localhost:3000/auth/accept-invite');
console.log('     - https://your-domain.com/auth/accept-invite');

console.log('\n   Authentication > Email Templates:');
console.log('   □ "Confirm signup" template should be configured');
console.log('   □ Subject: "Welkom bij Tuinbeheer - Bevestig je account"');
console.log('   □ Body should contain {{ .ConfirmationURL }}');

console.log('\n3. Common Email Issues:');
console.log('   🚫 Rate Limiting: Max 30 emails/hour in development');
console.log('   🚫 Spam Folder: Check recipient\'s spam/junk folder');
console.log('   🚫 Email Provider: Some providers block Supabase emails');
console.log('   🚫 Template Errors: Malformed templates prevent sending');
console.log('   🚫 Wrong Redirect URL: Must match exactly in Supabase settings');

console.log('\n4. Testing Steps:');
console.log('   1. Go to http://localhost:3000/admin/users');
console.log('   2. Click "Gebruiker Uitnodigen"');
console.log('   3. Fill in a REAL email address you can check');
console.log('   4. Submit the form');
console.log('   5. Check email within 5 minutes');
console.log('   6. Check spam folder if not received');

console.log('\n5. Debug Information:');
console.log('   - Check browser console for errors');
console.log('   - Check Supabase logs in dashboard');
console.log('   - Verify user was created in auth.users table');
console.log('   - Check if email_confirmed_at is null (should be)');

console.log('\n6. Manual Verification:');
console.log('   Run this to test with your own email:');
console.log('   node scripts/test-email-simple.js --email your@email.com');

// Check if email parameter was provided
const args = process.argv.slice(2);
const emailIndex = args.indexOf('--email');
if (emailIndex !== -1 && args[emailIndex + 1]) {
  const testEmail = args[emailIndex + 1];
  console.log(`\n🧪 Would test email sending to: ${testEmail}`);
  console.log('   (Actual test requires Supabase client - use the web interface)');
} else {
  console.log('\n💡 To specify test email:');
  console.log('   node scripts/test-email-simple.js --email your@email.com');
}

console.log('\n✅ Configuration check complete!');
console.log('🔧 Next steps: Verify settings in Supabase dashboard');