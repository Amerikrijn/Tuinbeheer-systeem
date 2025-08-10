#!/usr/bin/env node

/**
 * 🧪 COMPLETE AUTH CHAIN TEST
 * Test de hele password reset flow end-to-end
 */

const https = require('https');
const fs = require('fs');

const PROD_URL = 'https://tuinbeheer-systeem.vercel.app';
const TEST_EMAIL = 'test@example.com';

console.log('🧪 COMPLETE AUTH CHAIN TEST');
console.log('================================');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ 
        status: res.statusCode, 
        headers: res.headers, 
        body: data 
      }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testAuthChain() {
  console.log('\n🔗 STAP 1: Test productie site bereikbaarheid');
  try {
    const response = await makeRequest(PROD_URL);
    console.log(`✅ Site bereikbaar: ${response.status}`);
  } catch (error) {
    console.log(`❌ Site niet bereikbaar: ${error.message}`);
    return;
  }

  console.log('\n🔗 STAP 2: Test forgot-password pagina');
  try {
    const response = await makeRequest(`${PROD_URL}/auth/forgot-password`);
    console.log(`✅ Forgot password pagina: ${response.status}`);
    
    // Check if page contains expected content
    if (response.body.includes('Wachtwoord Vergeten') || response.body.includes('Reset Link')) {
      console.log('✅ Pagina content correct geladen');
    } else {
      console.log('⚠️  Pagina content mogelijk incomplete (client-side rendering)');
    }
  } catch (error) {
    console.log(`❌ Forgot password pagina error: ${error.message}`);
  }

  console.log('\n🔗 STAP 3: Test reset-password pagina');
  try {
    const response = await makeRequest(`${PROD_URL}/auth/reset-password`);
    console.log(`✅ Reset password pagina: ${response.status}`);
    
    if (response.body.includes('Nieuw Wachtwoord') || response.body.includes('Reset')) {
      console.log('✅ Reset pagina content correct');
    } else {
      console.log('⚠️  Reset pagina content mogelijk incomplete');
    }
  } catch (error) {
    console.log(`❌ Reset password pagina error: ${error.message}`);
  }

  console.log('\n🔗 STAP 4: Test accept-invitation pagina');
  try {
    const response = await makeRequest(`${PROD_URL}/auth/accept-invitation`);
    console.log(`✅ Accept invitation pagina: ${response.status}`);
  } catch (error) {
    console.log(`❌ Accept invitation pagina error: ${error.message}`);
  }

  console.log('\n🔗 STAP 5: Test Supabase connectiviteit');
  try {
    // Test basic Supabase health
    const supabaseUrl = 'https://dwsgwqosmihsfaxuheji.supabase.co/rest/v1/';
    const response = await makeRequest(supabaseUrl);
    console.log(`✅ Supabase endpoint bereikbaar: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Supabase auth werkt (401 = geen auth token, dat is normaal)');
    } else if (response.status === 200) {
      console.log('✅ Supabase database bereikbaar');
    } else {
      console.log(`⚠️  Supabase status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Supabase connectiviteit error: ${error.message}`);
  }

  console.log('\n🔗 STAP 6: Simuleer reset request (zonder echte email)');
  try {
    // Test the API endpoint that would be called
    const resetUrl = `${PROD_URL}/api/auth/reset-password`;
    console.log(`🧪 Testing reset API endpoint: ${resetUrl}`);
    
    const response = await makeRequest(resetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    console.log(`📡 Reset API response: ${response.status}`);
    if (response.status === 404) {
      console.log('ℹ️  API endpoint niet gevonden (mogelijk client-side only)');
    } else {
      console.log(`📄 Response body: ${response.body.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`❌ Reset API test error: ${error.message}`);
  }

  console.log('\n📋 DIAGNOSE SAMENVATTING:');
  console.log('================================');
  console.log('🎯 VOLGENDE STAPPEN:');
  console.log('1. Check Supabase project status (actief/gepauzeerd)');
  console.log('2. Controleer API keys in Supabase dashboard');
  console.log('3. Check email delivery logs in Supabase');
  console.log('4. Controleer JWT token expiry settings');
  console.log('');
  console.log('🔧 SUPABASE DASHBOARD LINKS:');
  console.log('- Project: https://app.supabase.com/project/dwsgwqosmihsfaxuheji');
  console.log('- API Keys: https://app.supabase.com/project/dwsgwqosmihsfaxuheji/settings/api');
  console.log('- Auth Settings: https://app.supabase.com/project/dwsgwqosmihsfaxuheji/auth/settings');
  console.log('- Email Logs: https://app.supabase.com/project/dwsgwqosmihsfaxuheji/logs/edge-logs');
}

testAuthChain().catch(console.error);