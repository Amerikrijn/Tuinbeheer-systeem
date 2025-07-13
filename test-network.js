// Network connectivity test for Supabase
// Run: node test-network.js

const https = require('https');
const { URL } = require('url');

async function testNetworkConnectivity() {
  console.log('🌐 Testing Network Connectivity to Supabase...\n');

  const supabaseUrl = 'https://nrdgfiotsgnzvzsmylne.supabase.co';
  
  console.log(`1. Testing basic connectivity to: ${supabaseUrl}`);
  
  return new Promise((resolve) => {
    const url = new URL(supabaseUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000, // 10 seconds
    };

    const req = https.request(options, (res) => {
      console.log(`   ✅ HTTP Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response length: ${data.length} bytes`);
        console.log('   ✅ Network connectivity is working!');
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Network error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ Request timed out');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

testNetworkConnectivity()
  .then(success => {
    console.log('\n🏁 Network test complete!');
    if (success) {
      console.log('🎉 Network connectivity is working!');
      console.log('The issue might be with the Supabase client configuration or API restrictions.');
    } else {
      console.log('⚠️  Network connectivity issues detected.');
      console.log('This could be due to:');
      console.log('- Firewall blocking the connection');
      console.log('- VPN or proxy issues');
      console.log('- DNS resolution problems');
      console.log('- Supabase service being down');
    }
  })
  .catch(console.error);